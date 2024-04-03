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
    $app = Application::configure(basePath: dirname(__DIR__))
        ->withExceptions(function () {})
        ->create();

    $app->useStoragePath(sys_get_temp_dir());
    $app->useBootstrapPath(sys_get_temp_dir());

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

    // 1 - se for sqlite, simplesmente usa o banco em memória
    // 2 - se não for mysql, chama o serviço DatabaseManager para criar o banco

    // Config::set('database.connections.vemto_db_connection', [
    //     'driver'   => 'sqlite',
    //     'database' => ':memory:',
    // ]);

    Config::set('database.connections.vemto_db_connection', [
        'driver'   => 'mysql',
        'database' => 'laravel11_basic',
        'username' => 'root',
    ]);

    $dbManager = new DatabaseManager('mysql');
    $dbManager->createDatabase('laravel11_basic');
    $dbManager->dropTables('laravel11_basic');

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

    $tablesReader = new ReadTablesFromDatabase($app, $APP_DIRECTORY);
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