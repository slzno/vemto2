<?php

/**
 * This script copies PHP rendered JSON files to be used in tests
 */

$outputFolders = [
    'src/common/services/tests/input' => [
        'schema-reader.json' => 'schema-reader-L9.json',
    ]
];

$jsonFilesFolder = __DIR__ . '/src/php/out';

// Copy files to output folders
foreach ($outputFolders as $outputFolder => $files) {
    foreach ($files as $file => $newFile) {
        $content = file_get_contents($jsonFilesFolder . '/' . $file);
        file_put_contents(__DIR__ . '/' . $outputFolder . '/' . $newFile, $content);
    }
}