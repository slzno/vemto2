<?php

use Illuminate\Database\Migrations\Migrator;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class ExtendedMigrator extends Migrator
{
    public function resolveMigrationPath($file)
    {
        return $this->resolvePath($file);
    }
}