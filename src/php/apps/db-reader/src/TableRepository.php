<?php

namespace VemtoDBReader;

class TableRepository
{
    protected array $tables = [];

    protected MigrationRepository $migrationRepository;

    public function __construct()
    {
        $this->migrationRepository = app(MigrationRepository::class);
    }

    public function getFormatted(): array
    {
        $tables = collect($this->tables);

        return $tables->map(function($table) {
            return $table->getFormatted();
        })->toArray();
    }

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
        $renames = $this->migrationRepository->getRenamedTables();

        $oldTablesNames = [];

        foreach($renames as $rename) {
            $oldTableName = $rename['old'];
            $newTableName = $rename['new'];

            if(!isset($oldTablesNames[$oldTableName])) {
                $oldTablesNames[$oldTableName] = [];
            }

            array_push($oldTablesNames[$oldTableName], $oldTableName);

            $oldTablesNames[$newTableName] = $oldTablesNames[$oldTableName];

            unset($oldTablesNames[$oldTableName]);
        }

        foreach ($this->tables as $tableName => $table) {
            if(isset($oldTablesNames[$tableName])) {
                $table->oldNames = $oldTablesNames[$tableName];
            }
        }
    }

}