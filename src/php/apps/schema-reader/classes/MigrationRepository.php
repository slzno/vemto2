<?php

class MigrationRepository {
    protected array $migrations = [];
    protected string $currentMigration = '';

    public function newMigration(string $migration): void
    {
        $this->currentMigration = $migration;

        $this->migrations[$migration] = [
            'migration' => $migration,
            'relativePath' => str_replace(getcwd(), '', $migration),
            'migrationName' => str_replace('.php', '', basename($migration)),
            'datePrefix' => substr(basename($migration), 0, 10),
            'fullPrefix' => substr(basename($migration), 0, 17),
            'addedColumns' => [],
            'changedColumns' => [],
            'droppedColumns' => [],
            'renamedColumns' => [],
            'commands' => [],
            'createdTables' => [],
            'renamedTables' => [],
            'droppedTables' => [],
        ];
    }

    protected function ensureCurrentMigration(): void
    {
        if (!isset($this->migrations[$this->currentMigration])) {
            throw new \RuntimeException("No current migration set.");
        }
    }

    public function addCreatedTableName(string $tableName): void
    {
        $this->ensureCurrentMigration();
        if (!in_array($tableName, $this->migrations[$this->currentMigration]['createdTables'])) {
            $this->migrations[$this->currentMigration]['createdTables'][] = $tableName;
        }
    }

    public function addColumn(array $column): void
    {
        $this->ensureCurrentMigration();
        $this->migrations[$this->currentMigration]['addedColumns'][] = $column;
    }

    public function changeColumn(array $column): void
    {
        $this->ensureCurrentMigration();
        $this->migrations[$this->currentMigration]['changedColumns'][] = $column;
    }

    public function addCommand(array $command): void
    {
        $this->ensureCurrentMigration();
        $this->migrations[$this->currentMigration]['commands'][] = $command;
    }

    public function dropColumn(array|string $columns): void
    {
        $this->ensureCurrentMigration();
        $columns = is_array($columns) ? $columns : [$columns];

        foreach ($columns as $column) {
            $this->migrations[$this->currentMigration]['droppedColumns'][] = $column;
        }
    }

    public function renameColumn(string $table, string $from, string $to): void
    {
        $this->ensureCurrentMigration();
        $this->migrations[$this->currentMigration]['renamedColumns'][] = [
            'table' => $table,
            'from' => $from,
            'to' => $to,
        ];
    }

    public function renameTable(string $from, string $to): void
    {
        $this->ensureCurrentMigration();
        $this->migrations[$this->currentMigration]['renamedTables'][] = [
            'from' => $from,
            'to' => $to,
        ];
    }

    public function dropTable(string $table): void
    {
        $this->ensureCurrentMigration();
        $this->migrations[$this->currentMigration]['droppedTables'][] = $table;
    }

    public function getMigrations(): array
    {
        return $this->migrations;
    }
}
