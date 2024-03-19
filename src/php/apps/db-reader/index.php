<?php

// Load the basic Laravel classes
require_once 'load.php';

// Load Vemto classes
require_once 'common/Vemto.php';

require_once 'classes/ExtendedKernel.php';
require_once 'classes/ReadTablesFromDatabase.php';
require_once 'classes/ModelRepository.php';

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

    // $reader = new ReadTablesFromDatabase();
    // $reader->handle();

    Vemto::respondWith([
        'status' => 'success'
    ]);
});