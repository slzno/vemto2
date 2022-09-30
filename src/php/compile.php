<?php

// Get apps from compiler.json apps array property
$compilerSettings = json_decode(file_get_contents(__DIR__ . '/compiler.json'));
$apps = $compilerSettings->apps;


foreach ($apps as $app) {
    $folder = __DIR__ . "/apps/$app";

    chdir($folder);

    // execute command
    echo "Compiling $app...\n";
    $command = "box compile";
    exec($command);

    // move compiled file to bin folder
    $compiledFile = "$folder/dist/$app.phar";
    $destinationFolder = __DIR__ . '/../../build/main/static';
    $destinationFile = "$destinationFolder/$app.phar";
    
    if (!file_exists($destinationFolder)) {
        mkdir($destinationFolder);
    }
    
    rename($compiledFile, $destinationFile);
}