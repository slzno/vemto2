<?php

use Illuminate\Support\Facades\DB;

class ReadTablesFromDatabase
{
    // public function __construct()
    // {
        
    // }

    public function handle() {
        $previousConnection = DB::getDefaultConnection();

        Vemto::log('Previous connection from class: ' . $previousConnection);

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
    }
}