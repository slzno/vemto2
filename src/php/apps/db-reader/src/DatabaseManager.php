<?php

namespace VemtoDBReader;

use PDO;
use Exception;
use PDOException;
use Illuminate\Support\Facades\Config;
use Vemto\ValidationException;

class DatabaseManager {

    protected $pdo;
    protected $dbType;
    protected $projectDatabaseName;
    protected $projectDatabaseNameWasSet = false;

    public function __construct($dbType = 'mysql') {
        $this->dbType = $dbType;
        $this->connect();
    }

    public function setProjectDatabaseName($projectDatabaseName) {
        $this->projectDatabaseName = $projectDatabaseName;
        $this->projectDatabaseNameWasSet = true;
    }

    protected function connect() {
        $config = Config::get("database.connections.vemto_db_connection");

        $port = $config['port'];

        if(empty($port)) {
            $port = match ($this->dbType) {
                'pgsql' => 5432,
                'sqlsrv' => 1433,
                default => 3306
            };
        }
        
        $user = $config['username'];
        $password = $config['password'];

        $dsn = "{$this->dbType}:host={$config['host']};port={$port};";

        try {
            $this->pdo = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            
            if ($this->dbType == 'sqlsrv') { // For SQL Server, select the database after connection
                $this->pdo->exec("USE {$config['database']}");
            }
        } catch (PDOException $e) {
            throw new Exception("DB connection failed: " . $e->getMessage());
        }
    }

    public function createDatabase($databaseName) {
        $this->checkProjectDatabaseIsDifferent($databaseName);
        $this->checkDatabasePrefix($databaseName);

        try {
            $createDatabaseSQL = match ($this->dbType) {
                'pgsql' => "CREATE DATABASE \"$databaseName\"",
                default => "CREATE DATABASE `$databaseName`",
            };

            $this->pdo->exec($createDatabaseSQL);
        } catch (PDOException $e) {
            throw new Exception("Could not create database `$databaseName`: " . $e->getMessage());
        }
    }

    public function dropDatabase($databaseName) {
        \Vemto\Vemto::log("Dropping database $databaseName");

        $this->checkProjectDatabaseIsDifferent($databaseName);
        $this->checkDatabasePrefix($databaseName);

        try {
            $dropDatabaseSQL = match ($this->dbType) {
                'pgsql' => "DROP DATABASE IF EXISTS \"$databaseName\"",
                default => "DROP DATABASE IF EXISTS `$databaseName`",
            };

            $this->pdo->exec($dropDatabaseSQL);
        } catch (PDOException $e) {
            throw new Exception("Could not drop database `$databaseName`: " . $e->getMessage());
        }
    }

    public function dropTables($databaseName) {
        $this->checkDatabasePrefix($databaseName);

        $this->pdo->exec("USE `$databaseName`;");
            
        $tables = [];
        
        switch ($this->dbType) {
            case 'mysql':
                $tables = $this->pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
                break;
            case 'pgsql':
                $tables = $this->pdo->query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")->fetchAll(PDO::FETCH_COLUMN);
                break;
            case 'sqlsrv':
                $tables = $this->pdo->query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")->fetchAll(PDO::FETCH_COLUMN);
                break;
        }

        foreach ($tables as $tableName) {
            $this->pdo->exec("DROP TABLE IF EXISTS `$tableName`;");
        }
    }

    /**
     * If the database name does not start with "vemto_", exit the script
     *
     * @param [type] $databaseName
     * @return void
     */
    public function checkDatabasePrefix($databaseName)
    {
        if (strpos($databaseName, 'vemto_') !== 0) {
            throw new ValidationException("Database name must start with 'vemto_' prefix.", [
                "database_name" => "Database name must start with 'vemto_' prefix."
            ]);
        }
    }

    public function checkProjectDatabaseIsDifferent($databaseName) {
        if(!$this->projectDatabaseNameWasSet) {
            throw new Exception("Project database name was not set.");
        }

        if ($databaseName == $this->projectDatabaseName) {
            throw new ValidationException("Database name must be different from the project database name.", [
                "database_name" => "Database name must be different from the project database name."
            ]);
        }
    }

}