#!/usr/bin/env php
<?php

// chdir("C:\code\study\laravel_reactive\migrations");

$APP_DIRECTORY = getcwd();

echo $APP_DIRECTORY . "\n";

use Illuminate\Database\Migrations\Migrator;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\View;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
|
| Composer provides a convenient, automatically generated class loader
| for our application. We just need to utilize it! We'll require it
| into the script here so that we do not have to worry about the
| loading of any of our classes manually. It's great to relax.
|
*/

require $APP_DIRECTORY . '/vendor/autoload.php';

$app = require_once $APP_DIRECTORY . '/bootstrap/app.php';

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class ExtendedKernel extends ConsoleKernel
{
    public function handle($input, $output = null)
    {
        try {
            $this->bootstrap();
        } catch (Throwable $e) {
            $this->reportException($e);
            $this->renderException($output, $e);

            return 1;
        }
    }
}

$app->bind(Illuminate\Contracts\Console\Kernel::class, ExtendedKernel::class);
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$status = $kernel->handle(
    $input = new Symfony\Component\Console\Input\ArgvInput,
    new Symfony\Component\Console\Output\ConsoleOutput
);

class ExtendedMigrator extends Migrator
{
    public function resolveMigrationPath($file)
    {
        return $this->resolvePath($file);
    }
}


$migrationServiceProvider = new Illuminate\Database\MigrationServiceProvider($app);
$migrationServiceProvider->register();

class MigrationRepository {
    protected $migrations = [];
    protected string $currentMigration = '';

    public function newMigration($migration)
    {
        $this->currentMigration = $migration;

        $this->migrations[$migration] = [
            'migration' => $migration,
            'addedColumns' => [],
            'changedColumns' => [],
            'droppedColumns' => [],
        ];
    }

    public function addColumn($column)
    {
        $this->migrations[$this->currentMigration]['addedColumns'][] = $column;
    }

    public function changeColumn($column)
    {
        $this->migrations[$this->currentMigration]['changedColumns'][] = $column;
    }

    public function dropColumn($columns) {
        if (!is_array($columns)) {
            $columns = [$columns];
        }

        foreach ($columns as $column) {
            $this->migrations[$this->currentMigration]['droppedColumns'][] = $column;
        }
    }

    public function getMigrations()
    {
        return $this->migrations;
    }
}

$migrationsRepository = new MigrationRepository();
$app->singleton('localMigrationsRepository', function () use ($migrationsRepository) {
    return $migrationsRepository;
});

/**
 * Por padrão o migrator já adiciona os caminhos de pacotes, então só precisamos
 * adicionar o caminho das migrations do nosso projeto (TODO: verificar se o Laravel consegue 
 * automaticamente detectar os caminhos das migrations internas do projeto).
 */
$baseMigrator = $app['migrator'];

$migrator = new ExtendedMigrator($app['migration.repository'], $app['db'], $app['files'], $app['events']);

foreach ($baseMigrator->paths() as $path) {
    $migrator->path($path);
}

$migrator->path($APP_DIRECTORY . '/database/migrations');

$migrationsFiles = $migrator->getMigrationFiles($migrator->paths());

// Uma ideia para utilizar o ExtendedBlueprint é fazer um replace do Blueprint no container
// do Laravel, assim o ExtendedBlueprint será utilizado em todas as migrations (isso só é possível pois o
// Laravel está usando o IoC para instanciar o Blueprint. Caso contrário, seria necessário algum hack
// esquisito, tipo fazer replace do namespace no código da migration e executá-la usando eval ou algo nesse sentido).
// No entanto, como a maioria do código interno do Laravel utiliza o Container de Injeção de Serviços, fica mais
// fácil relizar o replace da classe inteira. E melhor, o replace pode ser feito usando uma classe que extende a 
// original

class ExtendedBlueprint extends Illuminate\Database\Schema\Blueprint
{
    protected $migrationsRepository;

    public function __construct($table, $callback = null, $prefix = '')
    {
        parent::__construct($table, $callback, $prefix);
        $this->migrationsRepository = app('localMigrationsRepository');
    }

    public function addColumn($type, $name, array $parameters = [])
    {
        $debug = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 10);

        $toppestCaller = $this->getToppestCaller($debug);

        $parameters = array_merge($parameters, [
            'table' => $this->getTable(),
            'creatorMethod' => $toppestCaller['function'] ?? $type,
        ]);

        return parent::addColumn($type, $name, $parameters);
    }

    protected function getToppestCaller($debug)
    {
        $toppestCaller = null;

        foreach ($debug as $caller) {
            if (isset($caller['class']) && $caller['class'] == 'Illuminate\Database\Schema\Blueprint') {
                $toppestCaller = $caller;
            }
        }

        return $toppestCaller;
    }

    public function dropColumn($columns)
    {
        $treatedColumns = collect($columns)->map(function ($column) {
            return [
                'name' => $column,
                'table' => $this->getTable(),
            ];
        })->toArray();

        $this->migrationsRepository->dropColumn($treatedColumns);

        return parent::dropColumn($columns);
    }
}

$app->bind('Illuminate\Database\Schema\Blueprint', ExtendedBlueprint::class);

class ExtendedBuilder extends Illuminate\Database\Schema\Builder
{
    protected $migrationsRepository;

    public function __construct(Illuminate\Database\Connection $connection)
    {
        parent::__construct($connection);
        $this->migrationsRepository = app('localMigrationsRepository');
    }

    public function create($table, Closure $callback)
    {
        tap($this->createBlueprint($table), function ($blueprint) use ($callback) {
            $blueprint->create();

            $callback($blueprint);
            
            $this->processTable($blueprint);
        });
    }

    public function table($table, Closure $callback)
    {
        tap($this->createBlueprint($table), function ($blueprint) use ($callback) {
            $blueprint->create();

            $callback($blueprint);

            $this->processTable($blueprint);
        });
    }

    protected function processTable($blueprint)
    {
        $addedColumns = $blueprint->getAddedColumns();
        foreach ($addedColumns as $column) {
            $this->migrationsRepository->addColumn($column);
        }

        $changedColumns = $blueprint->getChangedColumns();
        foreach ($changedColumns as $column) {
            $this->migrationsRepository->changeColumn($column);
        }
    }

    public function dropColumn()
    {
        
    }
}

$app['db.schema'] = new ExtendedBuilder($app['db.connection']);

class MigrationDecoder {

    protected $migration;
    protected $upActions = [];
    protected $downActions = [];
    protected $reflectedMigration = null;

    function __construct($migration) {
        $this->migration = $migration;
        
    }

    public function decode()
    {
        $this->reflectedMigration = new ReflectionClass($this->migration);

        $methods = $this->reflectedMigration->getMethods();

        foreach ($methods as $method) {
            if ($method->name == 'up') {
                $this->upActions = $method->invoke($this->migration);
            }
        }
    }

}

$migrations = [];

foreach ($migrationsFiles as $migrationFile) {
    $migrationsRepository->newMigration($migrationFile);
    $migration = $migrator->resolveMigrationPath($migrationFile);
    array_push($migrations, $migration);

    $decoder = new MigrationDecoder($migration);
    $decoder->decode();
}

// $firstMigration = $migrations[0];
// $decoder = new MigrationDecoder($firstMigration);
// $decoder->decode();

class TableRepository {
    protected $tables = [];
    protected $migrationsRepository;

    public function __construct()
    {
        $this->migrationsRepository = app('localMigrationsRepository');
    }

    public function buildTablesFromMigrations()
    {
        $migrations = $this->migrationsRepository->getMigrations();

        foreach ($migrations as $migration) {
            $this->processAddedColumns($migration['addedColumns']);
            $this->processChangedColumns($migration['changedColumns']);
            $this->processDroppedColumns($migration['droppedColumns']);
        }
    }

    protected function processAddedColumns($addedColumns)
    {
        foreach ($addedColumns as $column) {
            $this->addTableColumn($column);
        }
    }

    protected function addTableColumn($column)
    {
        $tableName = $column['table'];
        $columnName = $column['name'];

        if (!isset($this->tables[$tableName])) {
            $this->tables[$tableName] = [];
        }

        $this->tables[$tableName][$columnName] = $column;
    }

    protected function processChangedColumns($changedColumns)
    {
        foreach ($changedColumns as $column) {
            $this->changeTableColumn($column);
        }
    }

    protected function changeTableColumn($column)
    {
        $tableName = $column['table'];
        $columnName = $column['name'];

        if (!isset($this->tables[$tableName])) {
            $this->tables[$tableName] = [];
        }

        $this->tables[$tableName][$columnName] = $column;
    }

    protected function processDroppedColumns($droppedColumns)
    {
        foreach ($droppedColumns as $column) {
            $this->dropTableColumn($column);
        }
    }

    protected function dropTableColumn($column)
    {
        $tableName = $column['table'];
        $columnName = $column['name'];

        if (!isset($this->tables[$tableName])) {
            $this->tables[$tableName] = [];
        }

        unset($this->tables[$tableName][$columnName]);
    }

    public function getTables()
    {
        return $this->tables;
    }
}

$tablesRepository = new TableRepository();
$tablesRepository->buildTablesFromMigrations();
// dump($tablesRepository->getTables());

use function Termwind\{render};

$tableHtml = '
<div>
    <div class="pb-1">
        Vemto on Fire 🔥
    </div>
    @foreach($tables as $table => $columns)
        <div class="bg-green-300 text-green-900 font-bold uppercase p-2" colspan="5">{{ $table }}</div>

        <div>
            <table class="bg-gray-100">
                <thead>
                    <tr>
                        <th>Column</th>
                        <th>Type</th>
                        <th>Creator</th>
                        <th>Length</th>
                        <th>Default</th>
                        <th>Nullable</th>
                        <th>Unsigend</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($columns as $column)
                        <tr>
                            <td>{{ $column["name"] }}</td>
                            <td>{{ $column["type"] }}</td>
                            <td>{{ $column["creatorMethod"] }}</td>
                            <td>{{ $column["length"] }}</td>
                            <td>{{ $column["default"] }}</td>
                            <td>{{ $column["nullable"] ? "✅" : "" }}</td>
                            <td>{{ $column["unsigned"] ? "✅" : "" }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endforeach
</div>
';

$renderedHtml = Blade::render($tableHtml, [
    'tables' => $tablesRepository->getTables()
]);
render($renderedHtml);

// file_put_contents('tables.html', $renderedHtml);

exit(0);