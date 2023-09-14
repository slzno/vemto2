<?php

class MigrationFilter {

    /**
     * Clear the migrations directory.
     */
    public static function clear() {
        $migrationsDirectory = getcwd() . '/.vemto/migrations';

        if (is_dir($migrationsDirectory)) {
            $files = glob($migrationsDirectory . '/*');

            foreach ($files as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
        }
    }

    /**
     * Filter the migration file.
     *
     * @param string $migrationPath
     * @return string
     */
    public static function filter($migrationPath) {
        // Read file content
        $content = file_get_contents($migrationPath);

        // Modify the content
        $content = self::commentOutDropStatements($content);
        $content = self::commentOutRenameStatements($content);

        // Determine the new path
        $newPath = getcwd() . '/.vemto/migrations/' . basename($migrationPath);

        // Make sure the directory exists
        if (!is_dir(dirname($newPath))) {
            mkdir(dirname($newPath), 0777, true);
        }

        // Save to new path
        file_put_contents($newPath, $content);

        return $newPath;
    }

    /**
     * Comment out Schema::drop statements.
     *
     * @param string $content
     * @return string
     */
    private static function commentOutDropStatements($content) {
        return preg_replace('/^(\s*Schema::drop)/m', '// $1', $content);
    }

    /**
     * Comment out Schema::rename statements.
     *
     * @param string $content
     * @return string
     */
    private static function commentOutRenameStatements($content) {
        return preg_replace('/^(\s*Schema::rename)/m', '// $1', $content);
    }
}