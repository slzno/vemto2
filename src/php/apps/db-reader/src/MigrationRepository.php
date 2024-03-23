<?php

namespace VemtoDBReader;

class MigrationRepository {
    protected array $migrations = [];
    protected array $tablesOldNames = [];

    public function get(): array
    {
        return $this->migrations;
    }

    public function addFromPath(string $migrationPath): void
    {
        $migration = new Migration($migrationPath);

        $this->add($migration);
    }

    public function add(Migration $migration): void
    {
        $this->migrations[] = $migration;
    }
}