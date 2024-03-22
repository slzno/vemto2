<?php

namespace VemtoDBReader;

use KitLoong\MigrationsGenerator\Schema\Models\Index as SchemaIndex;
use KitLoong\MigrationsGenerator\Schema\Models\ForeignKey as SchemaForeignKey;

class Index {
    public string $name;
    public array $columns = [];
    public ?string $algorithm;
    public ?string $references;
    public ?string $on;
    public ?string $onDelete;
    public ?string $onUpdate;
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

    public static function fromSchemaIndex(SchemaIndex $index): ?Index
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

            return null;
        }

        if($newIndex->isIndexForSingleColumn()) {
            $indexColumn = $newIndex->getFirstColumn();
            $indexColumn->setIndex(true);

            return null;
        }

        return $newIndex;
    }

    public static function fromSchemaForeignKey(SchemaForeignKey $foreignKey):? Index
    {
        $newIndex = new Index;
        $newIndex->updateFromSchemaForeignKey($foreignKey);

        return $newIndex;
    }

    public function updateFromSchemaForeignKey(SchemaForeignKey $foreignKey): void
    {
        $foreignKeyName = $foreignKey->getName();
        $columns = $foreignKey->getLocalColumns();
        $foreignColumn = $foreignKey->getForeignColumns();

        if(empty($columns) || empty($foreignColumn)) {
            throw new \Exception("Foreign key with no columns not supported: $foreignKeyName");
        }

        if(count($columns) > 1 || count($foreignColumn) > 1){
            throw new \Exception("Foreign key with multiple columns not supported: $foreignKeyName");
        }

        $foreignColumn = $foreignColumn[0];

        $this->type = 'foreign';
        $this->name = $foreignKeyName;
        $this->references = $foreignColumn;
        $this->table = $foreignKey->getTableName();
        $this->on = $foreignKey->getForeignTableName();
        $this->onDelete = $foreignKey->getOnDelete();
        $this->onUpdate = $foreignKey->getOnUpdate();

        $this->columns = [];
        $table = $this->getTable();

        foreach ($columns as $columnName) {
            $tableColumn = $table->getColumnByName($columnName);

            if (!$tableColumn) {
                continue;
            }

            $this->addColumn($tableColumn);
        }
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

    public function isIndexForSingleColumn(): bool
    {
        return $this->type === 'index' 
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