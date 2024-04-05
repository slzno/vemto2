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
            if ($this->dbType == 'mysql') {
                $port = 3306;
            } else if ($this->dbType == 'pgsql') {
                $port = 5432;
            } else if ($this->dbType == 'sqlsrv') {
                $port = 1433;
            }
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
            if ($this->dbType == 'pgsql') {
                // PostgreSQL does not support IF NOT EXISTS in CREATE DATABASE
                $this->pdo->exec("SELECT 'CREATE DATABASE \"$databaseName\"' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$databaseName')");
            } else {
                // MySQL and SQL Server support this syntax
                $this->pdo->exec("CREATE DATABASE IF NOT EXISTS `$databaseName`");
            }
        } catch (PDOException $e) {
            throw new Exception("Could not create database `$databaseName`: " . $e->getMessage());
        }
    }

    public function dropDatabase($databaseName) {
        $this->checkProjectDatabaseIsDifferent($databaseName);
        $this->checkDatabasePrefix($databaseName);

        try {
            $this->pdo->exec("DROP DATABASE IF EXISTS `$databaseName`");
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