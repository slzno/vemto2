<?php
use Illuminate\Database\Migrations\Migrator;

class ExtendedMigrator extends Migrator
{
    public function resolveMigrationPath(string $file)
    {
        // Solo devuelve la ruta del archivo
        return $this->resolvePath($file);
    }
}
