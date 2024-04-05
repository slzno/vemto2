<?php

// Load the basic Laravel classes
require_once 'load.php';

// Load Vemto classes
require_once 'common/Vemto.php';

require_once 'classes/ExtendedKernel.php';
require_once 'classes/ExtendedBuilder.php';
require_once 'classes/TableRepository.php';
require_once 'classes/ModelRepository.php';
require_once 'classes/MigrationDecoder.php';
require_once 'classes/ExtendedMigrator.php';
require_once 'classes/ExtendedBlueprint.php';
require_once 'classes/MigrationRepository.php';

use Vemto\Vemto;

Vemto::execute('schema-reader', function () use ($app, $APP_DIRECTORY) {
    // Set the database connection to SQLite
    // config(['database.default' => 'sqlite']);
    // config(['database.connections.sqlite.database' => ':memory:']);

    // Start the application with the extended kernel
    $app->bind(Illuminate\Contracts\Console\Kernel::class, ExtendedKernel::class);
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

    $kernel->handle(
        new Symfony\Component\Console\Input\ArgvInput,
        new Symfony\Component\Console\Output\ConsoleOutput
    );

    // Register the migrator
    $migrationServiceProvider = new Illuminate\Database\MigrationServiceProvider($app);
    $migrationServiceProvider->register();

    // Create the migrations repository and bind it to a singleton
    $migrationsRepository = new MigrationRepository();
    $app->singleton('localMigrationsRepository', function () use ($migrationsRepository) {
        return $migrationsRepository;
    });

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

    // Get migrations files
    $migrationsFiles = $migrator->getMigrationFiles($migrator->paths());

    // Bind the extended blueprint
    $app->bind('Illuminate\Database\Schema\Blueprint', ExtendedBlueprint::class);

    // Bind the extended builder
    $app->singleton('db.schema', function ($app) {
        return new ExtendedBuilder($app['db.connection']);
    });

    foreach ($migrationsFiles as $migrationFile) {
        $migrationsRepository->newMigration($migrationFile);
        $migration = $migrator->resolveMigrationPath($migrationFile);

        $migrationPath = str_replace($APP_DIRECTORY, '', $migrationFile);

        $decoder = new MigrationDecoder($migration, $migrationPath);
        $decoder->decode();
    }

    // Get the schema tables
    $tablesRepository = new TableRepository();
    $tablesRepository->buildTablesFromMigrations();

    $tables = $tablesRepository->getTables();

    // $models = [];
    $models = ModelRepository::getModelsFormatted();

    Vemto::respondWith([
        'tables' => $tables,
        'models' => $models,
    ]);
});