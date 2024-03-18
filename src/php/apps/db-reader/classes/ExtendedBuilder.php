<?php

use Illuminate\Database\Schema\Builder;

class ExtendedBuilder extends Builder
{
    protected $migrationsRepository;

    public function __construct(Illuminate\Database\Connection $connection)
    {
        parent::__construct($connection);

        $this->migrationsRepository = app('localMigrationsRepository');
    }

    public function create($table, Closure $callback)
    {
        tap($this->createBlueprint($table), function ($blueprint) use ($table, $callback) {
            $blueprint->create();

            $callback($blueprint);
            
            $this->migrationsRepository->addCreatedTableName($table);

            $this->processTable($table, $blueprint);
        });
    }

    public function table($table, Closure $callback)
    {
        tap($this->createBlueprint($table), function ($blueprint) use ($table, $callback) {
            $blueprint->create();

            $callback($blueprint);

            $this->processTable($table, $blueprint);
        });
    }

    public function rename($from, $to)
    {
        $this->migrationsRepository->renameTable($from, $to);
    }

    public function drop($table)
    {
        $this->migrationsRepository->dropTable($table);
    }

    public function dropIfExists($table)
    {
        $this->migrationsRepository->dropTable($table);
    }

    protected function processTable($table, $blueprint)
    {
        $addedColumns = $blueprint->getAddedColumns();

        foreach ($addedColumns as $column) {
            $this->migrationsRepository->addColumn($column->toArray());
        }

        $changedColumns = $blueprint->getChangedColumns();
        
        foreach ($changedColumns as $column) {
            $this->migrationsRepository->changeColumn($column->toArray());
        }

        $addedCommands = $blueprint->getCommands();
        
        foreach ($addedCommands as $command) {
            $finalCommand = $command->toArray();
            $finalCommand['table'] = $table;
            $this->migrationsRepository->addCommand($finalCommand);
        }
    }
}