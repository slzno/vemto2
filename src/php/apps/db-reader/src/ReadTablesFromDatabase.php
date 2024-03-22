<?php

namespace VemtoDBReader;

use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Application;
use KitLoong\MigrationsGenerator\Setting;
use KitLoong\MigrationsGenerator\Enum\Driver;
use KitLoong\MigrationsGenerator\Schema\Schema;
use KitLoong\MigrationsGenerator\Schema\MySQLSchema;
use KitLoong\MigrationsGenerator\Schema\PgSQLSchema;
use KitLoong\MigrationsGenerator\Schema\SQLiteSchema;
use KitLoong\MigrationsGenerator\Schema\SQLSrvSchema;
use KitLoong\MigrationsGenerator\Schema\Models\Column as SchemaColumn;
use KitLoong\MigrationsGenerator\Schema\Models\ForeignKey as SchemaForeignKey;

class ReadTablesFromDatabase
{
    protected Schema $schema;

    protected Application $app;

    protected string $appPath;

    protected array $tables = [];

    protected TableRepository $tableRepository;

    public function __construct(Application $app, string $appPath)
    {
        $this->app = $app;
        $this->appPath = $appPath;

        $this->tableRepository = app(TableRepository::class);
    }

    public function getTableByName(string $name): Table
    {
        return isset($this->tables[$name]) ? $this->tables[$name] : null;
    }

    public function handle(): array {
        $connection = DB::getDefaultConnection();

        try {
            $this->setup($connection);

            $this->schema = $this->makeSchema();

            $tables = $this->schema->getTableNames()->sort()->values();

            $this->generate($tables);

            return $this->tableRepository->get();
        } finally {
            DB::setDefaultConnection($connection);
        }
    }

    protected function setup(string $connection): void
    {
        $setting = new Setting;
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
        $this->generateForeignKeys($tables);
    }

    protected function generateTables(Collection $tables): void
    {
        $tables->each(function (string $table): void {
            $tableSchema = $this->schema->getTable($table);

            $table = new Table;
            $table->name = $tableSchema->getName();

            $this->tableRepository->addTable($table);

            $columns = $tableSchema->getColumns();
            $table->addColumns($columns);

            $indexes = $tableSchema->getIndexes();
            $table->addIndexes($indexes);
        });
    }

    protected function generateForeignKeys(Collection $tables): void
    {
        $tables->each(function (string $table): void {
            $foreignKeys = $this->schema->getForeignKeys($table);

            if (!$foreignKeys->isNotEmpty()) {
                return;
            }

            $this->addForeignKeys($table, $foreignKeys);
        });
    }

    protected function addForeignKeys(string $tableName, Collection $foreignKeys): void
    {
        $table = $this->tableRepository->getTableByName($tableName);

        $foreignKeys->each(function (SchemaForeignKey $foreignKey) use ($table) : void {
            $table->updateForeignKeyIndex($foreignKey);
        });
    }
}