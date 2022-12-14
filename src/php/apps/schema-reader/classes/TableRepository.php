<?php

class TableRepository {
    protected $tables = [];
    protected $currentMigration = '';
    protected $migrationsRepository;
    protected $tableColumnsCreationIncrement = [];

    public function __construct()
    {
        $this->migrationsRepository = app('localMigrationsRepository');
    }

    public function buildTablesFromMigrations()
    {
        $migrations = $this->migrationsRepository->getMigrations();

        foreach ($migrations as $migration) {
            $this->currentMigration = $migration;

            $this->processAddedColumns($migration['addedColumns']);
            $this->processChangedColumns($migration['changedColumns']);
            $this->processDroppedColumns($migration['droppedColumns']);
            $this->processRenamedColumns($migration['renamedColumns']);
            $this->processCommands($migration['commands']);
        }

        $this->orderTablesColumns();
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

        $this->insertColumn($tableName, $column);

        $this->registerTableMigration($tableName);
    }

    protected function insertColumn($tableName, $column)
    {
        $columns = $this->tables[$tableName]['columns'] ?? [];
        $latestColumn = end($this->tables[$tableName]['columns']) ?? null;
        
        $column['order'] = $latestColumn ? $latestColumn['order'] + 1 : 0;
        $column['creationOrder'] = ++$this->tableColumnsCreationIncrement[$tableName];
        
        $after = isset($column['after']) ? $column['after'] : null;

        if (!empty($after)) {
            $previousColumn = $columns[$after] ?? null;
            $newColumnOrder = $previousColumn ? $previousColumn['order'] + 1 : $column['order'];

            $columns = array_map(function($column) use ($newColumnOrder) {
                if ($column['order'] >= $newColumnOrder) {
                    $column['order']++;
                }

                return $column;
            }, $columns);

            $column['order'] = $newColumnOrder;
        }

        $columns[$column['name']] = $column;

        $this->tables[$tableName]['columns'] = $columns;
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

        $this->registerTableMigration($tableName);
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

        $this->registerTableMigration($tableName);
    }

    protected function processRenamedColumns($renamedColumns)
    {
        foreach ($renamedColumns as $column) {
            $this->renameTableColumn($column);
        }
    }

    protected function renameTableColumn($column)
    {
        $tableName = $column['table'];
        $from = $column['from'];
        $to = $column['to'];

        if (!isset($this->tables[$tableName])) {
            $this->initTable($tableName);
        }

        $this->tables[$tableName]['columns'][$to] = $this->tables[$tableName]['columns'][$from];
        $this->tables[$tableName]['columns'][$to]['name'] = $to;

        // Add the old name to pastNames for future reference
        if (!isset($this->tables[$tableName]['columns'][$to]['pastNames'])) {
            $this->tables[$tableName]['columns'][$to]['pastNames'] = [];
        }

        $this->tables[$tableName]['columns'][$to]['pastNames'][] = $from;

        unset($this->tables[$tableName]['columns'][$from]);

        $this->registerTableMigration($tableName);
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
        
        $commandIsAddingIndex = in_array($commandName, 
            ['index', 'primary', 'unique', 'foreign', 'fulltext', 'spatialIndex']
        );

        if($commandIsAddingIndex) {
            $this->addIndex($command);
        }

        $commandIsDroppingIndex = in_array($commandName, 
            ['dropIndex', 'dropPrimary', 'dropUnique', 'dropForeign']
        );

        if ($commandIsDroppingIndex) {
            $this->dropIndex($command);
        }
    }

    protected function addIndex($command)
    {
        $tableName = $command['table'];
        $indexName = $command['index'];

        if (!isset($this->tables[$tableName]['indexes'][$indexName])) {
            $command['type'] = $command['name'];
            unset($command['name']);
            
            $this->tables[$tableName]['indexes'][$indexName] = $command;
        }

        $this->registerTableMigration($tableName);
    }

    protected function dropIndex($command)
    {
        $tableName = $command['table'];
        $indexName = $command['index'];

        if (isset($this->tables[$tableName]['indexes'][$indexName])) {
            unset($this->tables[$tableName]['indexes'][$indexName]);
        }

        $this->registerTableMigration($tableName);
    }

    protected function initTable($tableName)
    {
        $this->tableColumnsCreationIncrement[$tableName] = 0;

        $this->tables[$tableName] = [
            'columns' => [],
            'indexes' => [],
            'uniques' => [],
            'foreigns' => [],
            'migrations' => [],
        ];
    }

    protected function registerTableMigration(string $tableName)
    {
        $migrationRelativePath = $this->currentMigration['relativePath'];
        $tableMigrations = $this->tables[$tableName]['migrations'] ?? [];

        $tableMigrations = collect($tableMigrations);

        if(!$tableMigrations->where('relativePath', $migrationRelativePath)->count()) {
            $tableMigrations->push($this->currentMigration);
        }

        $this->tables[$tableName]['migrations'] = $tableMigrations;
    }

    protected function orderTablesColumns()
    {
        foreach ($this->tables as $tableName => $table) {
            $columns = collect($table['columns'])->sortBy('order')->toArray();

            $this->tables[$tableName]['columns'] = $columns;
        }
    }

    public function getTables()
    {
        return collect($this->tables)->map(function($table, $tableName) {
            $table['name'] = $tableName;
            return $table;
        });
    }
}