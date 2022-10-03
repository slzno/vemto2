<?php

/**
 * This script compiles each application from compiler.json into a single PHAR file.
 * Created by Tiago Rodrigues, 2022-09-30
 */

// Get apps from compiler.json apps array property
$compilerSettings = json_decode(file_get_contents(__DIR__ . '/compiler.json'));
$apps = $compilerSettings->apps;

foreach ($apps as $app => $appSettings) {
    $folder = __DIR__ . "/apps/$app";

    // Copy files from common to the app/common folder
    $commonFolder = __DIR__ . "/common";
    $commonFiles = $appSettings->commonFiles;

    foreach ($commonFiles as $commonFile) {
        // get the file content
        $fileContent = file_get_contents("$commonFolder/$commonFile");
        
        // Add a comment to the top of the file, after the php tag
        $fileContent = str_replace('<?php', "<?php // ATTENTION: Don't change this file. Instead, change the original file under src/php/common", $fileContent);

        // Save the file
        file_put_contents("$folder/common/$commonFile", $fileContent);
    }

    // set the working directory to the app folder
    chdir($folder);

    // execute command
    echo "Compiling $app...\n";
    $command = "box compile";
    exec($command);

    // move compiled file to bin folder
    $compiledFile = realpath(__DIR__ . "/dist/$app.phar");
    $destinationFolder = realpath(__DIR__ . '/../../build/main/static');
    $destinationFile = "$destinationFolder/$app.phar";
    
    if (!file_exists($destinationFolder)) {
        mkdir($destinationFolder);
    }
    
    //copy compiled file to bin folder
    copy($compiledFile, $destinationFile); 
}