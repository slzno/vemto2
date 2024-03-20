<?php

use Exception;
use Illuminate\Foundation\Application;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use KitLoong\MigrationsGenerator\Enum\Driver;
use KitLoong\MigrationsGenerator\Schema\Models\Column as SchemaColumn;
use KitLoong\MigrationsGenerator\Schema\MySQLSchema;
use KitLoong\MigrationsGenerator\Schema\PgSQLSchema;
use KitLoong\MigrationsGenerator\Schema\Schema;
use KitLoong\MigrationsGenerator\Schema\SQLiteSchema;
use KitLoong\MigrationsGenerator\Schema\SQLSrvSchema;
use KitLoong\MigrationsGenerator\Setting;

class Table {
    public string $name;
    public array $oldNames = [];
    public array $migrations = [];
    public array $columns = [];

    public function addColumn(Column $column): void
    {
        $this->columns[$column->name] = $column;
    }
}

class Column {
    public string $name;
    public string $type;
    public string|NULL $total;
    public string|NULL $length;
    public string|NULL $places;
    public string|NULL $default;
    public bool $index;
    public bool $unique;
    public bool $nullable;
    public bool $unsigned;
    public bool $autoIncrement;
    
    public static function fromSchemaColumn(SchemaColumn $column): Column
    {
        $newColumn = new Column;
        $newColumn->name = $column->getName();
        $newColumn->length = $column->getLength();
        $newColumn->nullable = (bool) $column->isNotNull() ? false : true;
        $newColumn->unsigned = (bool) $column->isUnsigned();
        $newColumn->autoIncrement = (bool) $column->isAutoincrement();
        $newColumn->type = $column->getType()->value;
        $newColumn->index = false;
        $newColumn->unique = false;
        $newColumn->default = $column->getDefault();
        $newColumn->total = null;
        $newColumn->places = null;

        return $newColumn;
    }
}
class ReadTablesFromDatabase
{
    protected Schema $schema;

    protected Application $app;

    protected string $appPath;

    protected array $tables = [];

    public function __construct(Application $app, string $appPath)
    {
        $this->app = $app;
        $this->appPath = $appPath;
    }

    public function handle() {
        $connection = DB::getDefaultConnection();

        try {
            $this->setup($connection);

            $this->createAndMigrateTables($connection);

            $this->schema = $this->makeSchema();

            $tables = $this->schema->getTableNames()->sort()->values();

            $this->generate($tables);
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

    protected function createAndMigrateTables(string $connection): void
    {
        //
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
            $tableSchema = $this->schema->getTable($table);
            // Vemto::log("Table: $table");
            // Vemto::dump($this->schema->getTable($table));

            $table = new Table;
            $table->name = $tableSchema->getName();

            $columns = $tableSchema->getColumns();
            $columns->each(function (SchemaColumn $column) use ($table) : void {
                $newColumn = Column::fromSchemaColumn($column);

                $table->addColumn($newColumn);
            });
            
            $this->tables[] = $table;
        });

        Vemto::dump($this->tables);
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