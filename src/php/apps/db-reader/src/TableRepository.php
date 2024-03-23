<?php

namespace VemtoDBReader;

use Vemto\Vemto;

class TableRepository
{
    protected array $tables = [];

    protected MigrationRepository $migrationRepository;

    public function __construct()
    {
        $this->migrationRepository = app(MigrationRepository::class);
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
        $renames = array_reverse($renames); // Reverse to start from the oldest rename

        // Build a map of new names to a list of their old names
        // $newToOldNamesMap = [];
        // foreach ($renames as $rename) {
        //     if (!isset($newToOldNamesMap[$rename['new']])) {
        //         $newToOldNamesMap[$rename['new']] = [];
        //     }
        //     array_unshift($newToOldNamesMap[$rename['new']], $rename['old']);
        // }

        // foreach ($this->tables as $tableName => $table) {
        //     if (isset($newToOldNamesMap[$tableName])) {
        //         // If the current table has old names, trace back to the original name
        //         // and attach each old name to the table
        //         $currentName = $tableName;
        //         while (isset($newToOldNamesMap[$currentName])) {
        //             foreach ($newToOldNamesMap[$currentName] as $oldName) {
        //                 $table->addOldName($oldName);
        //                 $currentName = $oldName; // Move back in the rename history
        //             }
        //         }
        //     }
        // }
    }

}