<?php

class MigrationDecoder
{
    protected $migrationInstance;
    protected $migrationPath;
    protected $upActions = [];
    protected $downActions = [];
    protected $reflectedMigration = null;

    public function __construct($migrationInstance, string $migrationPath)
    {
        $this->migrationInstance = $migrationInstance;
        $this->migrationPath = $migrationPath;
    }

    public function decode(): void
    {
        $ref = new ReflectionClass($this->migrationInstance);

        if ($ref->hasMethod('up')) {
            $method = $ref->getMethod('up');
            $method->invoke($this->migrationInstance);
            $this->upActions[] = 'up executed';
        }

        if ($ref->hasMethod('down')) {
            $this->downActions[] = 'down exists';
        }
    }

    public function getUpActions(): array
    {
        return $this->upActions;
    }

    public function getDownActions(): array
    {
        return $this->downActions;
    }
}
