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

    public static function fromSchemaIndex(SchemaIndex $index): Index|NULL
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

        if($newIndex->isPrimaryForAutoIncrementColumn()) {
            return null;
        }

        if($newIndex->isUniqueForSingleColumn()) {
            $indexColumn = $newIndex->getFirstColumn();
            $indexColumn->setUnique(true);

            Vemto::log("Setting unique for index: $newIndex->name on table: $newIndex->table on column: $indexColumn->name");

            return null;
        }

        return $newIndex;
    }

    public function hasDefaultLaravelName(): bool
    {
        return $this->name === $this->getDefaultLaravelName();
    }

    public function getDefaultLaravelName(): string
    {
        $columnsNames = implode(
            '_', 
            array_map(fn($column) => $column->name, $this->columns)
        );

        return $this->table . '_' . $columnsNames . '_' . $this->type;
    }

    public function getTable(): Table
    {
        return $this->tableRepository->getTableByName($this->table);
    }

    public function isPrimaryForAutoIncrementColumn(): bool
    {
        return $this->type === 'primary' 
            && $this->isSingleColumn() 
            && $this->hasAutoIncrementColumn();
    }

    public function isUniqueForSingleColumn(): bool
    {
        return $this->type === 'unique' 
            && $this->isSingleColumn()
            && $this->hasDefaultLaravelName();
    }

    public function isSingleColumn(): bool
    {
        return count($this->columns) === 1;
    }

    public function hasAutoIncrementColumn(): bool
    {
        $table = $this->getTable();

        foreach ($this->columns as $column) {
            if ($table->getColumnByName($column->name)->isAutoIncrement()) {
                return true;
            }
        }

        return false;
    }

    public function getFirstColumn(): Column
    {
        return $this->columns[0];
    }

    public function getFirstAutoIncrementColumn(): Column
    {
        $table = $this->getTable();

        foreach ($this->columns as $column) {
            if ($table->getColumnByName($column->name)->isAutoIncrement()) {
                return $column;
            }
        }

        return null;
    }
}