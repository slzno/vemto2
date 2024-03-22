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
        preg_match_all('/Schema::create\((?:\'(.*?)\'|"(.*?)")/', $this->content, $matches);

        $matchesWithSingleQuotes = $matches[1];
        $matchesWithDoubleQuotes = $matches[2];
        
        $allMatches = array_merge(
            $matchesWithSingleQuotes, 
            $matchesWithDoubleQuotes
        );

        $allMatches = array_filter($allMatches);
        $allMatches = array_unique($allMatches);
        $allMatches = array_values($allMatches);

        if (empty($allMatches)) {
            return;
        }

        $this->createdTables = $allMatches;
    }

    public function calculateChangedTables(): void
    {
        $this->fillContent();

        $matches = [];
        preg_match_all('/Schema::table\((?:\'(.*?)\'|"(.*?)")/', $this->content, $matches);

        $matchesWithSingleQuotes = $matches[1];
        $matchesWithDoubleQuotes = $matches[2];
        
        $allMatches = array_merge(
            $matchesWithSingleQuotes, 
            $matchesWithDoubleQuotes
        );

        \Vemto\Vemto::dump($allMatches);

        $allMatches = array_filter($allMatches);
        $allMatches = array_unique($allMatches);
        $allMatches = array_values($allMatches);

        if (empty($allMatches)) {
            return;
        }

        $this->changedTables = $allMatches;
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
            'createdTables' => array_unique($this->createdTables),
            'changedTables' => array_unique($this->changedTables),
        ];
    }
}