<?php

namespace VemtoDBReader;

use Vemto\Vemto;

class TableRepository
{
    protected array $tables = [];

    public function get(): array
    {
        return $this->tables;
    }

    public function add(Table $table): void
    {
        if (isset($this->tables[$table->name])) {
            throw new \Exception("Table {$table->name} already exists on TableRepository.");
        }

        $this->tables[$table->name] = $table;
    }

    public function getTableByName(string $name): ?Table
    {
        return isset($this->tables[$name]) ? $this->tables[$name] : null;
    }

    public function attachTablesOldNames(): void
    {
        // foreach ($this->tables as $table) {
        //     $table->attachOldNames();
        // }
    }
}