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

    $newFileContent = file_get_contents($newFilePath);
    $currentFileContent = file_get_contents($currentFilePath);
    $previousFileContent = $previousFilePath ? file_get_contents($previousFilePath) : null;

    // We need to process the previous file (the latest file version wrote to the disk from Vemto)
    // to check for code conflicts
    $previousFileAst = null;
    if($previousFileContent) {
        $previousFileAst = (new PhpParser\ParserFactory())
            ->create(PhpParser\ParserFactory::PREFER_PHP7)
            ->parse($previousFileContent);
    }

    $newFileAst = (new PhpParser\ParserFactory())
        ->create(PhpParser\ParserFactory::PREFER_PHP7)
        ->parse($newFileContent);

    $currentFileAst = (new PhpParser\ParserFactory())
        ->create(PhpParser\ParserFactory::PREFER_PHP7)
        ->parse($currentFileContent);

    // Traverse the AST of the previous file
    $previousFileVisitor = new StaticVisitor();
    
    if($previousFileAst) {
        $previousFileTraverser = new PhpParser\NodeTraverser();
        $previousFileTraverser->addVisitor($previousFileVisitor);
        $previousFileTraverser->traverse($previousFileAst);
    }

    // Traverse the AST of the new file and identify new/changed elements
    $newFileVisitor = new StaticVisitor();
    $newFileVisitor->setPreviousFileVisitor($previousFileVisitor);
    
    $newFileTraverser = new PhpParser\NodeTraverser();
    $newFileTraverser->addVisitor($newFileVisitor);
    $newFileTraverser->traverse($newFileAst);

    // Traverse the AST of the current file and update it with the new/changed elements
    $currentFileVisitor = new UpdaterVisitor();
    $currentFileVisitor->setNewFileVisitor($newFileVisitor);
    $currentFileVisitor->setCurrentFileAst($currentFileAst);

    $currentFileTraverser = new PhpParser\NodeTraverser();
    $currentFileTraverser->addVisitor($currentFileVisitor);
    $currentFileTraverser->traverse($currentFileAst);

    // Write the modified AST back to the first file
    $hasConflicts = $currentFileVisitor->hasConflicts();

    if($hasConflicts) {
        $conflicts = $currentFileVisitor->getConflicts();

        $conflictsFileContent = json_encode($conflicts, JSON_PRETTY_PRINT);

        $conflictsFilePath = Vemto::writeConflictsFile($conflictsFileContent);
    }

    $printer = new PhpParser\PrettyPrinter\Standard();
    $resultFileContent = $printer->prettyPrintFile($currentFileVisitor->getCurrentFileAst());

    $resultFilePath = Vemto::writeProcessedFile($resultFileContent);

    Vemto::respondWith([
        'status' => $hasConflicts ? 'conflict' : 'success',
        'filePath' => $resultFilePath,
        'conflictsFilePath' => $hasConflicts ? $conflictsFilePath : null,
    ]);
});