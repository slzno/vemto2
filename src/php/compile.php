<?php

/**
 * This is script compiles each application from compiler.json into a single file.
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
        copy($commonFolder . "/" . $commonFile, $folder . "/common/" . $commonFile);
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