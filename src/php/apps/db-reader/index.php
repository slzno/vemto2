<?php

ini_set('display_errors', 'On');

// Load the basic Laravel classes
require_once 'load.php';

use Vemto\Vemto;
use Vemto\ModelRepository;

use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Facade;
use VemtoDBReader\DatabaseManager;
use VemtoDBReader\TableRepository;
use VemtoDBReader\MigrationRepository;
use VemtoDBReader\ReadTablesFromDatabase;

Vemto::execute('schema-reader-db', function () use ($APP_DIRECTORY) {
    
    $settings = Vemto::getSettings();
    $envSettings = Vemto::getEnvSettings();
    
    if($settings['SCHEMA_READER_MODE'] !== 'db') {
        throw new \Exception('Trying to read database schema without the correct mode');
    }

    $bootstrapFile = $APP_DIRECTORY . '/bootstrap/app.php';
    
    if(file_exists($bootstrapFile)) {
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
        $databaseConfig = require_once 'config/database.php';
        $connectionConfig = $databaseConfig['connections'][$settings['SCHEMA_READER_DB_DRIVER']];

        $connectionConfig['driver'] = $settings['SCHEMA_READER_DB_DRIVER'];
        $connectionConfig['host'] = $settings['SCHEMA_READER_DB_HOST'];
        $connectionConfig['port'] = $settings['SCHEMA_READER_DB_PORT'];
        $connectionConfig['database'] = $settings['SCHEMA_READER_DB_DATABASE'];
        $connectionConfig['username'] = $settings['SCHEMA_READER_DB_USERNAME'];
        $connectionConfig['password'] = $settings['SCHEMA_READER_DB_PASSWORD'];

        if(isset($settings['SCHEMA_READER_DB_ENGINE'])) {
            $connectionConfig['engine'] = $settings['SCHEMA_READER_DB_ENGINE'];
        }

        Config::set('database.connections.vemto_db_connection', $connectionConfig);
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
        'mode' => 'db',
        'tables' => $tables,
        'models' => $models,
    ]);
});