<?php

// Load the vendor files
require_once 'load.php';

// Load Vemto classes
require_once 'common/Vemto.php';

require_once 'classes/StaticVisitor.php';
require_once 'classes/UpdaterVisitor.php';

Vemto::execute('php-merger', function () use ($argv) {
    
    $newFilePath = $argv[1];
    $currentFilePath = $argv[2];
    $previousFilePath = $argv[3] ?? null;

    Vemto::log($previousFilePath);

    $newFileAst = (new PhpParser\ParserFactory())
        ->create(PhpParser\ParserFactory::PREFER_PHP7)
        ->parse(file_get_contents($newFilePath));

    $currentFileAst = (new PhpParser\ParserFactory())
        ->create(PhpParser\ParserFactory::PREFER_PHP7)
        ->parse(file_get_contents($currentFilePath));

    // Traverse the AST of the new file and identify new/changed elements
    $newFileVisitor = new StaticVisitor();

    $newFileTraverser = new PhpParser\NodeTraverser();
    $newFileTraverser->addVisitor($newFileVisitor);
    $newFileTraverser->traverse($newFileAst);

    // Traverse the AST of the current file and mark all unchanged elements
    $currentFileVisitor = new UpdaterVisitor();

    $currentFileVisitor->setNewFileVisitor($newFileVisitor);
    $currentFileVisitor->setCurrentFileAst($currentFileAst);

    $currentFileTraverser = new PhpParser\NodeTraverser();
    $currentFileTraverser->addVisitor($currentFileVisitor);
    $currentFileTraverser->traverse($currentFileAst);


    // Write the modified AST back to the first file
    $resultFileFolder = getcwd() . '/.vemto/processed-files';
    $resultFilePath = $resultFileFolder . '/' . Illuminate\Support\Str::random(32) . '.php';

    $printer = new PhpParser\PrettyPrinter\Standard();

    if(!file_exists($resultFileFolder)) {
        mkdir($resultFileFolder);
    }

    $resultFileContent = $printer->prettyPrintFile($currentFileVisitor->getCurrentFileAst());

    file_put_contents($resultFilePath, $resultFileContent);

    Vemto::respondWith([
        'status' => 'success',
        'path' => $resultFilePath,
    ]);
});