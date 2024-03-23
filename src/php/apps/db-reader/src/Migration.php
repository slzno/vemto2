<?php

namespace VemtoDBReader;

class Migration {
    private string $content;    
    private string $simplifiedContent;
    protected string $migration;
    protected string $relativePath;
    protected string $migrationName;
    protected string $datePrefix;
    protected string $fullPrefix;
    protected array $createdTables = [];
    protected array $changedTables = [];
    protected array $tableRenames = [];

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
        $this->calculateTableRenames();

        $this->attachToTables();
    }

    public function calculateCreatedTables(): void
    {
        $this->fillContent();

        $matches = [];
        preg_match_all('/Schema::create\((?:\'(.*?)\'|"(.*?)")/', $this->simplifiedContent, $matches);

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
        preg_match_all('/Schema::table\((?:\'(.*?)\'|"(.*?)")/', $this->simplifiedContent, $matches);

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

        $this->changedTables = $allMatches;
    }

    // get all table renames Schema::rename('old_table_name', 'new_table_name');, and save to $tableRenames as an array like ['old' => 'old_table_name', 'new' => 'new_table_name']
    public function calculateTableRenames(): void
    {
        $this->fillContent();

        // Ensure $this->tableRenames is an array and clear it each time the method is called.
        $this->tableRenames = [];

        // Regular expression to match the Schema::rename('old_table_name', 'new_table_name') pattern
        $pattern = "/Schema::rename\(\s*'([^']+)',\s*'([^']+)'\s*\);/";

        // Use preg_match_all to find all matches in $this->migrationContent
        if (preg_match_all($pattern, $this->simplifiedContent, $matches)) {
            // Iterate over matches and save them to $this->tableRenames
            foreach ($matches[1] as $index => $oldTableName) {
                $newTableName = $matches[2][$index];
                $this->tableRenames[] = ['old' => $oldTableName, 'new' => $newTableName];
            }
        }

        \Vemto\Vemto::dump($this->tableRenames);
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

        $this->simplifiedContent = preg_replace('/\s+/', '', $this->content);
        $this->simplifiedContent = str_replace('"', "'", $this->simplifiedContent);
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