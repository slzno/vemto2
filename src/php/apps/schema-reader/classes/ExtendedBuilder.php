<?php

use Illuminate\Database\Schema\Builder;
use Illuminate\Database\Connection;
require 'ExtendedBlueprint.php';

class ExtendedBuilder extends Builder
{
    protected $migrationsRepository;

    public function __construct(Connection $connection)
    {
        parent::__construct($connection);
        $this->migrationsRepository = app('localMigrationsRepository');
    }

    protected function createBlueprint($table, Closure $callback = null)
    {
        $blueprint = new ExtendedBlueprint($this->connection, $table, $callback);
        $blueprint->setGrammar($this->connection->getSchemaGrammar());
        return $blueprint;
    }

    public function create($table, Closure $callback)
    {
        tap($this->createBlueprint($table, $callback), function ($blueprint) use ($table, $callback) {
            $blueprint->create();
            $callback($blueprint);
            $this->migrationsRepository->addCreatedTableName($table);
            $this->processTable($table, $blueprint);
        });
    }

    public function table($table, Closure $callback)
    {
        tap($this->createBlueprint($table, $callback), function ($blueprint) use ($table, $callback) {
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
        foreach ($blueprint->getAddedColumns() as $column) {
            $this->migrationsRepository->addColumn($column->toArray());
        }

        foreach ($blueprint->getChangedColumns() as $column) {
            $this->migrationsRepository->changeColumn($column->toArray());
        }

        foreach ($blueprint->getCommands() as $command) {
            $finalCommand = $command->toArray();
            $finalCommand['table'] = $table;
            $this->migrationsRepository->addCommand($finalCommand);
        }
    }
}
