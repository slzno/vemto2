<?php

/**
 * This script runs each PHP application from compiler.json and saves its response under /out.
 * Created by Tiago Rodrigues, 2022-10-28
 */

// Get apps from compiler.json apps array property
$compilerSettings = json_decode(file_get_contents(__DIR__ . '/compiler.json'));
$apps = $compilerSettings->apps;
$apps = (array) $apps;


// If we have the attribute app in the console, run only that app
if (isset($argv[1])) {
    echo "Testing output for app: " . $argv[1] . PHP_EOL;

    $apps = [
        $argv[1] => $apps[$argv[1]]
    ];
}

foreach ($apps as $app => $appSettings) {
    
    $output = executeApp($app);
    $vemtoOutput = parseResponse($output);
    
    echo $output . PHP_EOL;

    if (hasError($output)) {
        echo parseError($output) . PHP_EOL;
    }

    $jsonOutput = json_encode($vemtoOutput, JSON_PRETTY_PRINT);
    
    // Save pretty json output to file
    $outputFile = __DIR__ . '/out/' . $app . '.json';
    file_put_contents($outputFile, $jsonOutput);
}

function executeApp(string $app = 'schema-reader', string $laravelApp = 'laravel9-basic')
{
    $output = '';

    chdir(realpath(__DIR__ . '/laravel-base/' . $laravelApp));
    $output = exec('php ' . __DIR__ . '/apps/' . $app . '/index.php');
    chdir(__DIR__);

    return $output;
}

function parseResponse($data)
{
    $data = getVemtoData($data);

    return json_decode($data);
}

function parseError($data)
{
    return getVemtoError($data);
}

function getVemtoData($data) {
    // get text betweeen VEMTO_JSON_RESPONSE_START( and )VEMTO_JSON_RESPONSE_END
    $data = preg_replace('/.*VEMTO_JSON_RESPONSE_START\(/', '', $data);
    $data = preg_replace('/\)VEMTO_JSON_RESPONSE_END.*/', '', $data);
    $data = preg_replace('/\s+/', '', $data);

    return $data;
}

function getVemtoError($data) {
    // get text betweeen VEMTO_ERROR_START( and )VEMTO_ERROR_END
    $data = preg_replace('/.*VEMTO_ERROR_START\(/', '', $data);
    $data = preg_replace('/\)VEMTO_ERROR_END.*/', '', $data);

    return $data;
}

function hasError($data) {
    return strpos($data, 'VEMTO_ERROR_START') !== false;
}