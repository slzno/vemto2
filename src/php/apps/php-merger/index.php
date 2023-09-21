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

    /**
     * If the current file doesn't exist, it means that this is the first time
     * we are processing this file. In this case, we just need to write the
     * processed file to the disk and return it.
     */
    if(!file_exists($currentFilePath)) {
        $resultFileContent = file_get_contents($newFilePath);
        $resultFilePath = Vemto::writeProcessedFile($resultFileContent);

        Vemto::respondWith([
            'status' => 'success',
            'file' => $resultFilePath,
            'conflictsFile' => null,
        ]);
    }

    $newFileContent = file_get_contents($newFilePath);
    $currentFileContent = file_get_contents($currentFilePath);

    $previousFileContent = $previousFilePath && file_exists($previousFilePath) ? file_get_contents($previousFilePath) : null;

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
        $previousFileVisitor->setFileContent($previousFileContent);
        
        $previousFileTraverser = new PhpParser\NodeTraverser();
        $previousFileTraverser->addVisitor($previousFileVisitor);
        $previousFileTraverser->traverse($previousFileAst);
    }

    // Traverse the AST of the new file and identify new/changed elements
    $newFileVisitor = new StaticVisitor();
    $newFileVisitor->setPreviousFileVisitor($previousFileVisitor);
    $newFileVisitor->setFileContent($newFileContent);
    
    $newFileTraverser = new PhpParser\NodeTraverser();
    $newFileTraverser->addVisitor($newFileVisitor);
    $newFileTraverser->traverse($newFileAst);

    // Traverse the AST of the current file and update it with the new/changed elements
    $currentFileVisitor = new UpdaterVisitor();
    $currentFileVisitor->setFileContent($currentFileContent);
    $currentFileVisitor->setNewFileVisitor($newFileVisitor);
    $currentFileVisitor->setCurrentFileAst($currentFileAst);

    $currentFileTraverser = new PhpParser\NodeTraverser();
    $currentFileTraverser->addVisitor($currentFileVisitor);
    $currentFileTraverser->traverse($currentFileAst);

    // Write the modified AST back to the first file
    $hasConflicts = $currentFileVisitor->hasConflicts();

    if($hasConflicts) {
        $conflicts = [
            'conflicts' => $currentFileVisitor->getConflicts(),
        ];

        $conflictsFilePath = Vemto::writeConflictsFile($conflicts);
    }

    $printer = new PhpParser\PrettyPrinter\Standard();
    $resultFileContent = $printer->prettyPrintFile($currentFileVisitor->getCurrentFileAst());

    if(getenv('VEMTO_DEBUG')) {
        Vemto::clearLog();
        Vemto::log($resultFileContent);
    }

    $resultFilePath = Vemto::writeProcessedFile($resultFileContent);

    Vemto::respondWith([
        'status' => $hasConflicts ? 'conflict' : 'success',
        'file' => $resultFilePath,
        'conflictsFile' => $hasConflicts ? $conflictsFilePath : null,
    ]);
});