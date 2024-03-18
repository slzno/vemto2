<?php

// Load the basic Laravel classes

use Illuminate\Support\Facades\DB;

require_once 'load.php';

// Load Vemto classes
require_once 'common/Vemto.php';

require_once 'classes/ExtendedKernel.php';
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

    $previousConnection = DB::getDefaultConnection();

    Vemto::log('Previous connection: ' . $previousConnection);

    // try {
    //     $this->setup($previousConnection);

    //     $connection = $this->option('connection') ?: $previousConnection;

    //     DB::setDefaultConnection($connection);

    //     $this->schema = $this->makeSchema();

    //     $this->info('Using connection: ' . $connection . "\n");

    //     $tables       = $this->filterTables()->sort()->values();
    //     $views        = $this->filterViews()->sort()->values();
    //     $generateList = $tables->merge($views)->unique();

    //     $this->info('Generating migrations for: ' . $generateList->implode(',') . "\n");

    //     $this->askIfLogMigrationTable($previousConnection);

    //     $this->generate($tables, $views);

    //     $this->info("\nFinished!\n");

    //     if (DB::getDriverName() === Driver::SQLITE->value) {
    //         $this->warn('SQLite only supports foreign keys upon creation of the table and not when tables are altered.');
    //         $this->warn('See https://www.sqlite.org/omitted.html');
    //         $this->warn('*_add_foreign_keys_* migrations were generated, however will get omitted if migrate to SQLite type database.');
    //     }
    // } finally {
    //     DB::setDefaultConnection($previousConnection);
    //     app()->forgetInstance(Setting::class);
    // }

    Vemto::respondWith([
        'status' => 'success'
    ]);
});