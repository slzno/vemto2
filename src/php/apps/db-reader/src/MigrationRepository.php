<?php

namespace VemtoDBReader;

class MigrationRepository {
    protected array $migrations = [];
    protected array $renamedTables = [];

    public function get(): array
    {
        return $this->migrations;
    }

    public function getRenamedTables(): array
    {
        return $this->renamedTables;
    }

    public function addFromPath(string $migrationPath): void
    {
        $migration = new Migration($migrationPath);

        $this->add($migration);

        $this->addRenamedTables($migration);
    }

    public function add(Migration $migration): void
    {
        $this->migrations[] = $migration;
    }

    public function addRenamedTables(Migration $migration): void
    {
        $renamedTables = $migration->getRenamedTables();

        foreach ($renamedTables as $rename) {
            $this->renamedTables[] = $rename;
        }
    }
}