<?php

namespace VemtoDBReader;

class Migration {
    private string $content;    
    protected string $migration;
    protected string $relativePath;
    protected string $migrationName;
    protected string $datePrefix;
    protected string $fullPrefix;
    protected array $createdTables = [];
    protected array $changedTables = [];

    private TableRepository $tableRepository;

    public function __construct(string $migration)
    {
        $this->migration = $migration;
        
        $this->tableRepository = app(TableRepository::class);

        $this->fillData();
    }

    protected function fillData(): void
    {
        $this->relativePath = str_replace(getcwd(), '', $this->migration);
        $this->migrationName = str_replace('.php', '', basename($this->migration));
        $this->datePrefix = substr(basename($this->migration), 0, 10);
        $this->fullPrefix = substr(basename($this->migration), 0, 17);

        $this->calculateCreatedTables();
        $this->calculateChangedTables();

        $this->attachToTables();
    }

    public function calculateCreatedTables(): void
    {
        $this->fillContent();

        $matches = [];
        preg_match_all('/Schema::create\(\'(.*?)\'/', $this->content, $matches);

        $this->createdTables = $matches[1];
    }

    public function calculateChangedTables(): void
    {
        $this->fillContent();

        $matches = [];
        preg_match_all('/Schema::table\(\'(.*?)\'/', $this->content, $matches);

        $this->changedTables = $matches[1];
    }

    public function attachToTables(): void
    {
        foreach ($this->createdTables as $tableName) {
            $table = $this->tableRepository->getTableByName($tableName);

            if (!$table) {
                continue;
            }

            $table->addMigration($this);
        }

        foreach ($this->changedTables as $tableName) {
            $table = $this->tableRepository->getTableByName($tableName);

            if (!$table) {
                continue;
            }

            $table->addMigration($this);
        }

        // make changed tables and created tables unique
        $this->createdTables = array_unique($this->createdTables);
        $this->changedTables = array_unique($this->changedTables);
    }

    public function fillContent(): void
    {
        if (!file_exists($this->migration)) {
            throw new \Exception("Migration file not found: {$this->migration}");
        }

        if (!empty($this->content)) {
            return;
        }

        $this->content = file_get_contents($this->migration);
    }

    public function toArray(): array
    {
        return [
            'migration' => $this->migration,
            'relativePath' => $this->relativePath,
            'migrationName' => $this->migrationName,
            'datePrefix' => $this->datePrefix,
            'fullPrefix' => $this->fullPrefix,
            'createdTables' => $this->createdTables,
            'changedTables' => $this->changedTables,
        ];
    }
}