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

// use Illuminate\Foundation\Configuration\Exceptions;

Vemto::execute('schema-reader', function () use ($app, $APP_DIRECTORY) {
    $tempPath = sys_get_temp_dir();
    $_ENV['LARAVEL_STORAGE_PATH'] = $tempPath;
    // $_ENV['APP_SERVICES_CACHE'] = $tempPath . '/services.php';

    $app = Application::configure(basePath: dirname(__DIR__))
        ->withExceptions(function () {})
        ->create();

    $app->useBootstrapPath(sys_get_temp_dir());
    $app->useStoragePath(sys_get_temp_dir()); // Use the system temp directory for storage operations

    // dd($app->bootstrapPath());

    $tempManifestPath = sys_get_temp_dir();

    $app->bind('Illuminate\Foundation\PackageManifest', function ($app) use ($tempManifestPath) {
        return new \Illuminate\Foundation\PackageManifest(
            new \Illuminate\Filesystem\Filesystem,
            $app['path.base'],
            $tempManifestPath . '/packages.php'
        );
    });

    $app->bootstrapWith([
        \Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
        \Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
        // \Illuminate\Foundation\Bootstrap\HandleExceptions::class,
        \Illuminate\Foundation\Bootstrap\RegisterFacades::class,
        \Illuminate\Foundation\Bootstrap\RegisterProviders::class,
        \Illuminate\Foundation\Bootstrap\BootProviders::class,
    ]);

    $app->handleCommand(new Symfony\Component\Console\Input\ArgvInput);

    Facade::setFacadeApplication($app);

    Config::set('database.connections.memory_sqlite', [
        'driver'   => 'sqlite',
        'database' => ':memory:',
    ]);

    DB::setDefaultConnection('memory_sqlite');

    // migrate
    $migrator = $app->make('migrator');
    $migrator->run($APP_DIRECTORY . '/database/migrations');

    $result = DB::table("password_resets")->get();

    // $reader = new ReadTablesFromDatabase();
    // $reader->handle();

    Vemto::respondWith([
        'status' => 'success',
        'result' => $result
    ]);
});