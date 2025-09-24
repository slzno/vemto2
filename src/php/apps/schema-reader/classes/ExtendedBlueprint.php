<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Connection;
use Illuminate\Database\Schema\Grammars\Grammar;

class ExtendedBlueprint extends Blueprint
{
    protected $migrationsRepository;

    public function __construct(Connection $connection, string $table, $callback = null)
    {
        parent::__construct($connection, $table, $callback);
        $this->migrationsRepository = app('localMigrationsRepository');
    }

    public function setGrammar(Grammar $grammar): void
    {
        $this->grammar = $grammar;
    }

    public function build(): void
    {
        parent::build();
    }

    protected function addColumnDefinition($definition)
    {
        $debug = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 10);
        $toppestCaller = $this->getToppestCaller($debug);

        $definition['table'] = $this->getTable();
        $definition['creatorMethod'] = $toppestCaller['function'] ?? $definition['type'];

        return parent::addColumnDefinition($definition);
    }

    protected function getToppestCaller($debug)
    {
        $toppestCaller = null;

        foreach ($debug as $caller) {
            if (isset($caller['class']) && $caller['class'] === 'Illuminate\Database\Schema\Blueprint') {
                $toppestCaller = $caller;
            }
        }

        return $toppestCaller;
    }

    public function dropColumn($columns)
    {
        $treatedColumns = collect($columns)->map(function ($column) {
            return [
                'name' => $column,
                'table' => $this->getTable(),
            ];
        })->toArray();

        $this->migrationsRepository->dropColumn($treatedColumns);

        return parent::dropColumn($columns);
    }

    public function renameColumn($from, $to)
    {
        $this->migrationsRepository->renameColumn($this->getTable(), $from, $to);

        return parent::renameColumn($from, $to);
    }
}
