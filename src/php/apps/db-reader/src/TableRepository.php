<?php

namespace VemtoDBReader;

use Table;

class TableRepository
{
    protected array $tables = [];

    public function addTable(Table $table): void
    {
        $this->tables[$table->name] = $table;
    }

    public function getTableByName(string $name): Table
    {
        return isset($this->tables[$name]) ? $this->tables[$name] : null;
    }
}