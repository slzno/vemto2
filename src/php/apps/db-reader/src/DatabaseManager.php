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

    public function __construct($dbType = 'mysql') {
        $this->dbType = $dbType;
        $this->connect();
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
            die("DB connection failed: " . $e->getMessage());
        }
    }

    public function createDatabase($dbName) {
        $this->checkDatabasePrefix($dbName);

        try {
            if ($this->dbType == 'pgsql') {
                // PostgreSQL does not support IF NOT EXISTS in CREATE DATABASE
                $this->pdo->exec("SELECT 'CREATE DATABASE \"$dbName\"' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$dbName')");
            } else {
                // MySQL and SQL Server support this syntax
                $this->pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName`");
            }
            echo "Database `$dbName` created successfully.\n";
        } catch (PDOException $e) {
            die("Could not create database `$dbName`: " . $e->getMessage());
        }
    }

    public function dropTables($dbName) {
        $this->checkDatabasePrefix($dbName);

        $this->pdo->exec("USE `$dbName`;");
            
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
     * @param [type] $dbName
     * @return void
     */
    protected function checkDatabasePrefix($dbName)
    {
        if (strpos($dbName, 'vemto_') !== 0) {
            throw new ValidationException("Database name must start with 'vemto_' prefix.", [
                "database_name" => "Database name must start with 'vemto_' prefix."
            ]);
        }
    }

}