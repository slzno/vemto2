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
            $this->processDroppedTables($migration['droppedTables']);
            $this->processRenamedTables($migration['renamedTables']);
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
        $latestColumnOrder = $latestColumn && isset($latestColumn['order']) ? $latestColumn['order'] : count($columns);
        
        $column['order'] = $latestColumn ? $latestColumnOrder + 1 : 0;
        $column['creationOrder'] = ++$this->tableColumnsCreationIncrement[$tableName];
        
        $after = isset($column['after']) ? $column['after'] : null;

        if (!empty($after)) {
            $previousColumn = $columns[$after] ?? null;
            $previousColumnOrder = $previousColumn && isset($previousColumn['order']) ? $previousColumn['order'] : 0;

            $newColumnOrder = $previousColumn ? $previousColumnOrder + 1 : $column['order'];

            $columns = array_map(function($column) use ($newColumnOrder) {
                if(!isset($column['order'])) {
                    $column['order'] = 0;
                }

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

    protected function processDroppedTables($droppedTables)
    {
        foreach ($droppedTables as $table) {
            $this->dropTable($table);
        }
    }

    protected function dropTable($table)
    {
        if(!isset($this->tables[$table])) {
            return;
        }

        unset($this->tables[$table]);
    }

    protected function processRenamedTables($renamedTables)
    {
        foreach ($renamedTables as $renameData) {
            $this->renameTable($renameData['from'], $renameData['to']);
        }
    }

    protected function renameTable($from, $to)
    {
        if(!isset($this->tables[$from])) {
            return;
        }

        $this->tables[$to] = $this->tables[$from];
        $this->tables[$to]['name'] = $to;

        // Adding the new name to the collumns increment
        $this->tableColumnsCreationIncrement[$to] = $this->tableColumnsCreationIncrement[$from];

        unset($this->tables[$from]);
        unset($this->tableColumnsCreationIncrement[$from]);

        $this->saveOldTableName($to, $from);
    }

    protected function saveOldTableName($tableName, $oldName)
    {
        $this->tables[$tableName]['oldNames'][] = $oldName;
    }

    protected function addIndex($command)
    {
        $tableName = $command['table'];
        $indexName = $command['index'];

        if (!isset($this->tables[$tableName]['indexes'][$indexName])) {
            $command['type'] = $command['name'];
            $command['name'] = $indexName;
            
            unset($command['index']);
            
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
            'oldNames' => [],
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
        $this->tables = $this->treatTables($this->tables);

        return collect($this->tables)->map(function($table, $tableName) {
            $table['name'] = $tableName;
            return $table;
        });
    }

    public function treatTables(array $tables)
    {
        foreach ($tables as $tableName => $table) {
            foreach ($table['columns'] as $columnName => $column) {
                if (isset($column['allowed'])) {
                    $tables[$tableName]['columns'][$columnName]['options'] = $column['allowed'];
                } else {
                    $tables[$tableName]['columns'][$columnName]['options'] = [];
                }
            }
        }

        return $tables;
    }
}