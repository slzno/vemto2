<?php

use Carbon\Carbon;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Database\Migrations\MigrationRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use KitLoong\MigrationsGenerator\Enum\Driver;
use KitLoong\MigrationsGenerator\Migration\ForeignKeyMigration;
use KitLoong\MigrationsGenerator\Migration\Migrator\Migrator;
use KitLoong\MigrationsGenerator\Migration\ProcedureMigration;
use KitLoong\MigrationsGenerator\Migration\Squash;
use KitLoong\MigrationsGenerator\Migration\TableMigration;
use KitLoong\MigrationsGenerator\Migration\ViewMigration;
use KitLoong\MigrationsGenerator\Schema\Models\Procedure;
use KitLoong\MigrationsGenerator\Schema\Models\View;
use KitLoong\MigrationsGenerator\Schema\MySQLSchema;
use KitLoong\MigrationsGenerator\Schema\PgSQLSchema;
use KitLoong\MigrationsGenerator\Schema\Schema;
use KitLoong\MigrationsGenerator\Schema\SQLiteSchema;
use KitLoong\MigrationsGenerator\Schema\SQLSrvSchema;
use KitLoong\MigrationsGenerator\Setting;

class ReadTablesFromDatabase
{
    protected Schema $schema;

    public function handle() {
        $connection = DB::getDefaultConnection();

        Vemto::log('Previous connection from class: ' . $connection);

        try {
            $this->setup($connection);

            DB::setDefaultConnection($connection);

            $this->schema = $this->makeSchema();

            Vemto::log('Using connection: ' . $connection . "\n");

            $tables = $this->schema->getTableNames()->sort()->values();

            Vemto::log('Generating migrations for: ' . $tables->implode(',') . "\n");

            $this->generate($tables);

            Vemto::log("\nFinished!\n");
        } finally {
            DB::setDefaultConnection($connection);
            app()->forgetInstance(Setting::class);
        }
    }

    protected function setup(string $connection): void
    {
        $setting = app(Setting::class);
        $setting->setDefaultConnection($connection);
        $setting->setUseDBCollation(true);
        $setting->setIgnoreIndexNames(false);
        $setting->setIgnoreForeignKeyNames(false);
        $setting->setSquash(false);
        $setting->setWithHasTable(true);
    }

    protected function makeSchema(): Schema
    {
        $driver = DB::getDriverName();

        if (!$driver) {
            throw new Exception('Failed to find database driver.');
        }

        switch ($driver) {
            case Driver::MYSQL->value:
                return $this->schema = app(MySQLSchema::class);

            case Driver::PGSQL->value:
                return $this->schema = app(PgSQLSchema::class);

            case Driver::SQLITE->value:
                return $this->schema = app(SQLiteSchema::class);

            case Driver::SQLSRV->value:
                return $this->schema = app(SQLSrvSchema::class);

            default:
                throw new Exception('The database driver in use is not supported by Vemto Database Reader.');
        }
    }

    protected function generate(Collection $tables): void
    {
        $this->generateTables($tables);
    }

    protected function generateTables(Collection $tables): void
    {
        $tables->each(function (string $table): void {
            Vemto::log("Table: $table");
            Vemto::dump($this->schema->getTable($table));
        });
    }

    protected function generateForeignKeys(Collection $tables): void
    {
        $tables->each(function (string $table): void {
            $foreignKeys = $this->schema->getForeignKeys($table);

            if (!$foreignKeys->isNotEmpty()) {
                return;
            }

            Vemto::log("Foreign keys for table: $table");
            Vemto::dump($foreignKeys);
        });
    }
}