<?php

spl_autoload_register(function ($class) {
    // Define the base directory inside the PHAR for your custom namespaces
    $baseDir = __DIR__;
    
    // Mapping from namespace prefix to base directory from PHAR composer.json
    $composerJson = json_decode(file_get_contents($baseDir . '/composer.json'), true);
    $prefixes = $composerJson['autoload']['psr-4'];

    // Add base directory to the namespace prefix
    $prefixes = array_map(function ($dir) use ($baseDir) {
        return $baseDir . DIRECTORY_SEPARATOR . $dir;
    }, $prefixes);

    foreach ($prefixes as $prefix => $dir) {
        // Does the class use the namespace prefix?
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            // No, move to the next registered autoloader
            continue;
        }

        // Replace the namespace prefix with the base directory,
        // replace namespace separators with directory separators,
        // and append with .php
        $relativeClass = substr($class, $len);
        $file = $dir . str_replace('\\', '/', $relativeClass) . '.php';

        // If the file exists, require it
        if (file_exists($file)) {
            require $file;
            return;
        } else {
            throw new \Exception("Secondary Autoloader | File not found: $file");
        }
    }
});