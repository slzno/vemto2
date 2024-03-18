<?php
class MigrationDecoder {

    protected $migration;
    protected $upActions = [];
    protected $downActions = [];
    protected $reflectedMigration = null;

    function __construct($migration) 
    {
        $this->migration = $migration;    
    }

    public function decode()
    {
        $this->reflectedMigration = new ReflectionClass($this->migration);

        $methods = $this->reflectedMigration->getMethods();

        foreach ($methods as $method) {
            if ($method->name == 'up') {
                $this->upActions[] = $method->invoke($this->migration);
            }
        }
    }

}