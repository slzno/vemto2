<?php

// Load the basic Laravel classes
require_once 'load.php';

use Vemto\Vemto;

use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Facade;
use VemtoDBReader\DatabaseManager;
use VemtoDBReader\TableRepository;
use VemtoDBReader\ModelRepository;
use VemtoDBReader\MigrationRepository;
use VemtoDBReader\ReadTablesFromDatabase;

Vemto::execute('schema-reader', function () use ($app, $APP_DIRECTORY) {
    
    $settings = Vemto::getSettings();
    $envSettings = Vemto::getEnvSettings();
    
    if($settings['SCHEMA_READER_MODE'] !== 'db') {
        throw new \Exception('Trying to read database schema without the correct mode');
    }

    $app = Application::configure(basePath: dirname(__DIR__))
        ->withExceptions(function () {})
        ->create();

    $storagePath = $APP_DIRECTORY . DIRECTORY_SEPARATOR . 'storage';
    $bootstrapPath = $APP_DIRECTORY . DIRECTORY_SEPARATOR . 'bootstrap';

    $app->useStoragePath($storagePath);
    $app->useBootstrapPath($bootstrapPath);

    $app->bootstrapWith([
        \Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
        \Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
        // \Illuminate\Foundation\Bootstrap\HandleExceptions::class,
        \Illuminate\Foundation\Bootstrap\RegisterFacades::class,
        \Illuminate\Foundation\Bootstrap\RegisterProviders::class,
        \Illuminate\Foundation\Bootstrap\BootProviders::class,
    ]);

    Facade::setFacadeApplication($app);

    $app->singleton(Illuminate\Database\Migrations\MigrationRepositoryInterface::class, function ($app) {
        return $app->make('migration.repository');
    });

    $app->register(\KitLoong\MigrationsGenerator\MigrationsGeneratorServiceProvider::class);

    $app->singleton(TableRepository::class, function () {
        return new TableRepository;
    });

    $app->singleton(MigrationRepository::class, function () {
        return new MigrationRepository;
    });

    if($settings['SCHEMA_READER_DB_DRIVER'] === 'sqlite') {
        Config::set('database.connections.vemto_db_connection', [
            'driver'   => 'sqlite',
            'database' => ':memory:',
        ]);
    } else {
        Config::set('database.connections.vemto_db_connection', [
            'driver'   => $settings['SCHEMA_READER_DB_DRIVER'],
            'host'     => $settings['SCHEMA_READER_DB_HOST'],
            'port'     => $settings['SCHEMA_READER_DB_PORT'],
            'database' => $settings['SCHEMA_READER_DB_DATABASE'],
            'username' => $settings['SCHEMA_READER_DB_USERNAME'],
            'password' => $settings['SCHEMA_READER_DB_PASSWORD'],
        ]);
    }

    $databaseDriver = $settings['SCHEMA_READER_DB_DRIVER'];
    $databaseName = $settings['SCHEMA_READER_DB_DATABASE'];
    $projectDatabaseName = $envSettings['DB_DATABASE'] ?? null;

    if($databaseDriver !== 'sqlite') {
        $dbManager = new DatabaseManager($databaseDriver);
        $dbManager->setProjectDatabaseName($projectDatabaseName);
    
        $dbManager->dropDatabase($databaseName);
        $dbManager->createDatabase($databaseName);
    }

    $defaultConnection = "vemto_db_connection";

    DB::setDefaultConnection($defaultConnection);

    // create the migration repository
    $repository = $app->make('migration.repository');
    $repository->setSource($defaultConnection);
    $repository->createRepository();

    // migrate
    $migrationsPath = $APP_DIRECTORY . '/database/migrations';
    $migrator = $app->make('migrator');
    $migrator->path($migrationsPath);
    $migrator->run($migrationsPath);

    $tablesReader = new ReadTablesFromDatabase($app, $APP_DIRECTORY, $settings);
    $tablesReader->handle();

    $migrationRepository = $app->make(MigrationRepository::class);
    $migrationsFiles = $migrator->getMigrationFiles($migrator->paths());

    foreach ($migrationsFiles as $migrationFile) {
        $migrationRepository->addFromPath($migrationFile);
    }

    // Finishing tables read and adding old table names
    $tablesReader->finalize();

    $tableRepository = $app->make(TableRepository::class);
    $tables = $tableRepository->getFormatted();

    $modelRepository = new ModelRepository($APP_DIRECTORY);
    $models = $modelRepository->getFormatted();
    
    Vemto::respondWith([
        'tables' => $tables,
        'models' => $models,
    ]);
});