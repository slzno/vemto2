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
}