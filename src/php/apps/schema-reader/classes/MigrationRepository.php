<?php

class MigrationRepository {
    protected $migrations = [];
    protected string $currentMigration = '';

    public function newMigration($migration)
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
            'commands' => [],
        ];
    }

    public function addColumn($column)
    {
        $this->migrations[$this->currentMigration]['addedColumns'][] = $column;
    }

    public function changeColumn($column)
    {
        $this->migrations[$this->currentMigration]['changedColumns'][] = $column;
    }

    public function addCommand($command)
    {
        $this->migrations[$this->currentMigration]['commands'][] = $command;
    }

    public function dropColumn($columns) 
    {
        if (!is_array($columns)) {
            $columns = [$columns];
        }

        foreach ($columns as $column) {
            $this->migrations[$this->currentMigration]['droppedColumns'][] = $column;
        }
    }

    public function getMigrations()
    {
        return $this->migrations;
    }
}