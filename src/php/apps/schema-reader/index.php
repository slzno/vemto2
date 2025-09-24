<?php

ini_set('display_errors', 'On');

// Load the basic Laravel classes
require_once 'load.php';

// Load Vemto classes
require_once 'common/Vemto.php';
require_once 'common/ModelRepository.php';

// Load custom classes
require_once 'classes/ExtendedKernel.php';
require_once 'classes/ExtendedBuilder.php';
require_once 'classes/TableRepository.php';
require_once 'classes/MigrationDecoder.php';
require_once 'classes/ExtendedMigrator.php';
require_once 'classes/ExtendedBlueprint.php';
require_once 'classes/MigrationRepository.php';
require_once 'classes/MigrationFilter.php';

use Vemto\Vemto;
use Vemto\ModelRepository;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Facade;

Vemto::execute('schema-reader-mg', function () use ($APP_DIRECTORY) {

    $settings = Vemto::getSettings();

    if ($settings['SCHEMA_READER_MODE'] !== 'migration') {
        throw new \Exception('Trying to read migrations schema without the correct mode');
    }

    $bootstrapFile = $APP_DIRECTORY . '/bootstrap/app.php';

    if (file_exists($bootstrapFile)) {
        $app = require_once $bootstrapFile;
    } else {
        $app = Application::configure(basePath: $APP_DIRECTORY)
            ->withExceptions(function () {})
            ->create();
    }

    $app->bootstrapWith([
        \Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
        \Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
        // \Illuminate\Foundation\Bootstrap\HandleExceptions::class,
        \Illuminate\Foundation\Bootstrap\RegisterFacades::class,
        \Illuminate\Foundation\Bootstrap\SetRequestForConsole::class,
        \Illuminate\Foundation\Bootstrap\RegisterProviders::class,
        \Illuminate\Foundation\Bootstrap\BootProviders::class,
    ]);

    Facade::setFacadeApplication($app);

    // Register the migrator
    $migrationServiceProvider = new Illuminate\Database\MigrationServiceProvider($app);
    $migrationServiceProvider->register();

    // Create the migrations repository and bind it to a singleton
    $migrationsRepository = new MigrationRepository();
    $app->singleton('localMigrationsRepository', function () use ($migrationsRepository) {
        return $migrationsRepository;
    });


    // Crear migrator extendido
    $baseMigrator = $app['migrator'];
    $migrator = new ExtendedMigrator(
        $app['migration.repository'],
        $app['db'],
        $app['files'],
        $app['events']
    );

    // Add base migrator paths to the extended migrator
    foreach ($baseMigrator->paths() as $path) {
        $migrator->path($path);
    }

    // Add the default application path to the extended migrator
    $migrator->path($APP_DIRECTORY . '/database/migrations');


    // Bind the extended builder
    $app->singleton('db.schema', function ($app) {
        return new ExtendedBuilder($app['db.connection']);
    });

    // Bind the extended blueprint
    // Bind ExtendedBlueprint
    $app->bind('Illuminate\Database\Schema\Blueprint', ExtendedBlueprint::class);

    // Get migrations files
    $migrationsFiles = $migrator->getMigrationFiles($migrator->paths());

    foreach ($migrationsFiles as $migrationFile) {

        // Filtrar migración y crear copia temporal
        $filteredPath = MigrationFilter::filter($migrationFile);

        // Registrar nueva migración en MigrationRepository
        $migrationsRepository->newMigration($migrationFile);

        // Requerir migración anónima filtrada
        $migrationInstance = require $filteredPath;

        // Decodificar migración
        $decoder = new MigrationDecoder($migrationInstance, $filteredPath);
        $decoder->decode();
    }

    // Get the schema tables
    $tablesRepository = new TableRepository();
    $tablesRepository->buildTablesFromMigrations();

    $tables = $tablesRepository->getTables();

    $modelRepository = new ModelRepository($APP_DIRECTORY);
    $models = $modelRepository->getFormatted();

    Vemto::respondWithFile([
        'mode' => 'migration',
        'tables' => $tables,
        'models' => $models,
    ]);
});
