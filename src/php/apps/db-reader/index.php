<?php

// Load the basic Laravel classes
require_once 'load.php';

use Vemto\Vemto;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Facade;
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

    // Config::set('database.connections.vemto_db_connection', [
    //     'driver'   => 'sqlite',
    //     'database' => ':memory:',
    // ]);

    Config::set('database.connections.vemto_db_connection', [
        'driver'   => 'mysql',
        'database' => 'laravel11_basic',
        'username' => 'root',
    ]);

    $defaultConnection = "vemto_db_connection";

    DB::setDefaultConnection($defaultConnection);

    // Drop all tables (TODO: use Laravel internal code)
    $tables = DB::select('SHOW TABLES');
    foreach ($tables as $table) {
        $table = (array) $table;
        $table = array_values($table);
        $table = $table[0];
        DB::statement("DROP TABLE $table");
    }

    // create the migration repository
    $repository = $app->make('migration.repository');
    $repository->setSource($defaultConnection);
    $repository->createRepository();

    // migrate
    $migrator = $app->make('migrator');
    $migrator->run($APP_DIRECTORY . '/database/migrations');

    $reader = new ReadTablesFromDatabase($app, $APP_DIRECTORY);
    $tables = $reader->handle();
    
    Vemto::respondWith([
        'status' => 'success',
        'tables' => $tables
    ]);
});