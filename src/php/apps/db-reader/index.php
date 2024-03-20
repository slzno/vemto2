<?php

// Load the basic Laravel classes
require_once 'load.php';

// Load Vemto classes
require_once 'common/Vemto.php';

require_once 'classes/ExtendedKernel.php';
require_once 'classes/ReadTablesFromDatabase.php';
require_once 'classes/ModelRepository.php';

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Facade;

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

    Config::set('database.connections.memory_sqlite', [
        'driver'   => 'sqlite',
        'database' => ':memory:',
    ]);

    DB::setDefaultConnection('memory_sqlite');

    // create the migration repository
    $repository = $app->make('migration.repository');
    $repository->setSource('memory_sqlite');
    $repository->createRepository();

    // migrate
    $migrator = $app->make('migrator');
    $migrator->run($APP_DIRECTORY . '/database/migrations');

    $result = DB::table("migrations")->get();

    $reader = new ReadTablesFromDatabase($app, $APP_DIRECTORY);
    $tables = $reader->handle();
    
    Vemto::respondWith([
        'status' => 'success',
        'tables' => $tables
    ]);
});