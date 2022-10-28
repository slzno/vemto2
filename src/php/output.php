<?php

/**
 * This script runs each PHP application from compiler.json and saves its content under /out.
 * Created by Tiago Rodrigues, 2022-10-28
 */

// Get apps from compiler.json apps array property
$compilerSettings = json_decode(file_get_contents(__DIR__ . '/compiler.json'));
$apps = $compilerSettings->apps;

foreach ($apps as $app => $appSettings) {
    
    $output = executeApp($app);
    $output = parseResponse($output);

    $jsonOutput = json_encode($output, JSON_PRETTY_PRINT);
    
    // Save pretty json output to file
    $outputFile = __DIR__ . '/out/' . $app . '.json';
    file_put_contents($outputFile, $jsonOutput);
}

function executeApp(string $app = 'schema-reader', string $laravelApp = 'laravel9-basic')
{
    chdir(realpath(__DIR__ . '/laravel-base/' . $laravelApp));
    $executedSuccessfully = exec('php ' . __DIR__ . '/apps/' . $app . '/index.php', $output);
    chdir(__DIR__);

    if (!$executedSuccessfully) {
        // translate the output to a string
        $output = implode(PHP_EOL, $output);
        throw new \Exception($output);
    }

    return $output[0];
}

function parseResponse($data)
{
    // get text betweeen VEMTO_JSON_RESPONSE_START( and )VEMTO_JSON_RESPONSE_END
    $data = preg_replace('/.*VEMTO_JSON_RESPONSE_START\(/', '', $data);
    $data = preg_replace('/\)VEMTO_JSON_RESPONSE_END.*/', '', $data);
    $data = preg_replace('/\s+/', '', $data);

    return json_decode($data);
}