<?php

namespace VemtoDBReader;

use KitLoong\MigrationsGenerator\Schema\Models\Index as SchemaIndex;

class Index {
    public string $name;
    public array $columns = [];
    public string $algorithm;
    public string $references;
    public string $on;
    public string $onDelete;
    public string $onUpdate;
    public string $type;

    public string $table;
    public Table $tableInstance;

    protected TableRepository $tableRepository;

    public function __construct()
    {
        $this->tableRepository = app(TableRepository::class);
    }

    public function addColumn(Column $column): void
    {
        $this->columns[] = $column;
    }

    public static function fromSchemaIndex(SchemaIndex $index): Index
    {
        $newIndex = new Index;
        $newIndex->name = $index->getName();
        $newIndex->algorithm = null;
        $newIndex->table = $index->getTableName();
        $newIndex->type = $index->getType();

        // set table reference


        return $newIndex;
    }
}