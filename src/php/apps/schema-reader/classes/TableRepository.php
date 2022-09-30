<?php

class TableRepository {
    protected $tables = [];
    protected $migrationsRepository;

    public function __construct()
    {
        $this->migrationsRepository = app('localMigrationsRepository');
    }

    public function buildTablesFromMigrations()
    {
        $migrations = $this->migrationsRepository->getMigrations();

        foreach ($migrations as $migration) {
            $this->processAddedColumns($migration['addedColumns']);
            $this->processChangedColumns($migration['changedColumns']);
            $this->processDroppedColumns($migration['droppedColumns']);
            $this->processCommands($migration['commands']);
        }
    }

    protected function processAddedColumns($addedColumns)
    {
        foreach ($addedColumns as $column) {
            $this->addTableColumn($column);
        }
    }

    protected function addTableColumn($column)
    {
        $tableName = $column['table'];
        $columnName = $column['name'];

        if (!isset($this->tables[$tableName])) {
            $this->initTable($tableName);
        }

        $this->tables[$tableName]['columns'][$columnName] = $column;
    }

    protected function processChangedColumns($changedColumns)
    {
        foreach ($changedColumns as $column) {
            $this->changeTableColumn($column);
        }
    }

    protected function changeTableColumn($column)
    {
        $tableName = $column['table'];
        $columnName = $column['name'];

        if (!isset($this->tables[$tableName])) {
            $this->initTable($tableName);
        }

        $this->tables[$tableName]['columns'][$columnName] = $column;
    }

    protected function processDroppedColumns($droppedColumns)
    {
        foreach ($droppedColumns as $column) {
            $this->dropTableColumn($column);
        }
    }

    protected function dropTableColumn($column)
    {
        $tableName = $column['table'];
        $columnName = $column['name'];

        if (!isset($this->tables[$tableName])) {
            $this->initTable($tableName);
        }

        unset($this->tables[$tableName]['columns'][$columnName]);
    }

    protected function processCommands($commands)
    {
        foreach ($commands as $command) {
            $this->processCommand($command);
        }
    }

    protected function processCommand($command)
    {
        $tableName = $command['table'];
        $commandName = $command['name'];

        if (!isset($this->tables[$tableName])) {
            $this->initTable($tableName);
        }

        if ($commandName == 'index') {
            $this->addIndex($command);
        }

        if ($commandName == 'unique') {
            $this->addUnique($command);
        }

        if ($commandName == 'foreign') {
            $this->addForeign($command);
        }
    }

    protected function addIndex($command)
    {
        $tableName = $command['table'];
        $indexName = $command['index'];

        if (!isset($this->tables[$tableName]['indexes'][$indexName])) {
            $this->tables[$tableName]['indexes'][$indexName] = $command;
        }
    }

    protected function addUnique($command)
    {
        $tableName = $command['table'];
        $indexName = $command['index'];

        if (!isset($this->tables[$tableName]['uniques'][$indexName])) {
            $this->tables[$tableName]['uniques'][$indexName] = $command;
        }
    }

    protected function addForeign($command)
    {
        $tableName = $command['table'];
        $indexName = $command['index'];

        if (!isset($this->tables[$tableName]['foreigns'][$indexName])) {
            $this->tables[$tableName]['foreigns'][$indexName] = $command;
        }
    }

    protected function initTable($tableName)
    {
        $this->tables[$tableName] = [
            'columns' => [],
            'indexes' => [],
            'uniques' => [],
            'foreigns' => [],
        ];
    }

    public function getTables()
    {
        return collect($this->tables)->map(function($table, $tableName) {
            $table['name'] = $tableName;
            return $table;
        });
    }
}