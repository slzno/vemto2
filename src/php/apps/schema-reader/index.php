<?php

// Load the basic Laravel classes
require_once 'load.php';

// Load Vemto classes
require_once 'common/Vemto.php';

require_once 'classes/ExtendedKernel.php';
require_once 'classes/ExtendedBuilder.php';
require_once 'classes/TableRepository.php';
require_once 'classes/MigrationDecoder.php';
require_once 'classes/ExtendedMigrator.php';
require_once 'classes/ExtendedBlueprint.php';
require_once 'classes/MigrationRepository.php';

// Start the application with the extended kernel
$app->bind(Illuminate\Contracts\Console\Kernel::class, ExtendedKernel::class);
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$status = $kernel->handle(
    $input = new Symfony\Component\Console\Input\ArgvInput,
    new Symfony\Component\Console\Output\ConsoleOutput
);

// Register the migrator
$migrationServiceProvider = new Illuminate\Database\MigrationServiceProvider($app);
$migrationServiceProvider->register();

// Create the migrations repository and bind it to a singleton
$migrationsRepository = new MigrationRepository();
$app->singleton('localMigrationsRepository', function () use ($migrationsRepository) {
    return $migrationsRepository;
});

$baseMigrator = $app['migrator'];

$migrator = new ExtendedMigrator(
    $app['migration.repository'], 
    $app['db'], 
    $app['files'], 
    $app['events']
);

// Add base migrator paths to the extended migrator
foreach ($baseMigrator->paths() as $path) {
    $migrator->path($path);
}

// Add the default application path to the extended migrator
$migrator->path($APP_DIRECTORY . '/database/migrations');

// Get migrations files
$migrationsFiles = $migrator->getMigrationFiles($migrator->paths());

// Bind the extended blueprint
$app->bind('Illuminate\Database\Schema\Blueprint', ExtendedBlueprint::class);

// Bind the extended builder
$app['db.schema'] = new ExtendedBuilder($app['db.connection']);

// Execute and decode migrations
$migrations = [];

foreach ($migrationsFiles as $migrationFile) {
    $migrationsRepository->newMigration($migrationFile);
    $migration = $migrator->resolveMigrationPath($migrationFile);
    array_push($migrations, $migration);

    $decoder = new MigrationDecoder($migration);
    $decoder->decode();
}

// Get the schema tables
$tablesRepository = new TableRepository();
$tablesRepository->buildTablesFromMigrations();

$response = $tablesRepository->getTables();

echo Vemto::jsonResponse($response);

exit(0);