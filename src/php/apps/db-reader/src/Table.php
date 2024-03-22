<?php

namespace VemtoDBReader;

use Illuminate\Support\Collection;
use KitLoong\MigrationsGenerator\Schema\Models\Index as SchemaIndex;
use KitLoong\MigrationsGenerator\Schema\Models\Column as SchemaColumn;
use KitLoong\MigrationsGenerator\Schema\Models\ForeignKey as SchemaForeignKey;

class Table {
    public string $name;
    public array $oldNames = [];
    public array $migrations = [];
    public array $columns = [];
    public array $indexes = [];

    public function addColumns(Collection $columns): void
    {
        $columns->each(function (SchemaColumn $column): void {
            $this->addColumnIfNotEmpty($column);
        });
    }

    public function addColumnIfNotEmpty(SchemaColumn $column): void
    {
        $newColumn = Column::fromSchemaColumn($column);
        
        if(!$newColumn) {
            return;
        }

        $this->addColumn($newColumn);
    }

    public function addColumn(Column $column): void
    {
        $this->columns[$column->name] = $column;
    }

    public function addIndexes(Collection $indexes): void
    {
        $indexes->each(function (SchemaIndex $index) : void {
            $this->addIndexIfNotEmtpy($index);
        });
    }

    public function addIndexIfNotEmtpy(SchemaIndex $index): void
    {
        $newIndex = Index::fromSchemaIndex($index);

        if(!$newIndex) {
            return;
        }

        $this->addIndex($newIndex);
    }

    public function addIndex(Index $index): void
    {
        $this->indexes[$index->name] = $index;
    }

    public function addMigration(Migration $migration): void
    {   
        if($this->hasMigration($migration)) {
            return;
        }

        $this->migrations[] = $migration->toArray();
    }

    public function hasMigration(Migration $migration): bool
    {
        return in_array($migration->toArray(), $this->migrations);
    }

    public function getColumnByName(string $name): Column
    {
        return isset($this->columns[$name]) ? $this->columns[$name] : null;
    }

    public function getIndexByName(string $name): Index
    {
        return isset($this->indexes[$name]) ? $this->indexes[$name] : null;
    }

    public function updateForeignKeyIndex(SchemaForeignKey $foreignKey): Index {
        $foreignKeyHasMultipleColumns = count($foreignKey->getLocalColumns()) > 1;

        if($foreignKeyHasMultipleColumns) {
            throw new \Exception('Foreign key with multiple columns not supported');
        }

        $foreignKeyName = $foreignKey->getName();
        
        $index = $this->getIndexByName($foreignKeyName);

        if(!$index) {
            $index = Index::fromSchemaForeignKey($foreignKey);
            $this->addIndex($index);
        } else {
            $index->updateFromSchemaForeignKey($foreignKey);
        }

        return $index;
    }
}