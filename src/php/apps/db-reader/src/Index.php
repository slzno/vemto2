<?php

namespace VemtoDBReader;

use Vemto\Vemto;
use KitLoong\MigrationsGenerator\Schema\Models\Index as SchemaIndex;

class Index {
    public string $name;
    public array $columns = [];
    public string|NULL $algorithm;
    public string|NULL $references;
    public string|NULL $on;
    public string|NULL $onDelete;
    public string|NULL $onUpdate;
    public string $type; // primary, unique, index, foreign, spatialIndex, fullText, fulltext

    public string $table;

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
        $newIndex->type = $index->getType()->value;
        
        $table = $newIndex->getTable();
        $columns = $index->getColumns();

        foreach ($columns as $columnName) {
            $tableColumn = $table->getColumnByName($columnName);

            if (!$tableColumn) {
                continue;
            }

            $newIndex->addColumn($tableColumn);
        }

        // set table reference
        Vemto::log("Index name: " . $newIndex->name . " - Default Laravel name: " . $newIndex->getDefaultLaravelName());

        return $newIndex;
    }

    public function hasDefaultLaravelName(): bool
    {
        return $this->name === $this->getDefaultLaravelName();
    }

    public function getDefaultLaravelName(): string
    {
        return $this->table . '_' . $this->type . '_' . implode('_', array_map(fn($column) => $column->name, $this->columns));
    }

    public function getTable(): Table
    {
        return $this->tableRepository->getTableByName($this->table);
    }
}