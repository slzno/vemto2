<?php

namespace VemtoDBReader;

class Table {
    public string $name;
    public array $oldNames = [];
    public array $migrations = [];
    public array $columns = [];
    public array $indexes = [];

    public function addColumn(Column $column): void
    {
        $this->columns[$column->name] = $column;
    }

    public function addIndex(Index $index): void
    {
        $this->indexes[$index->name] = $index;
    }

    public function getColumnByName(string $name): Column
    {
        return isset($this->columns[$name]) ? $this->columns[$name] : null;
    }

    public function getIndexByName(string $name): Index
    {
        return isset($this->indexes[$name]) ? $this->indexes[$name] : null;
    }
}