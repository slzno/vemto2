<?php

/**
 * This script runs the PHP merger application and saves its response under /out.
 * Created by Tiago Rodrigues, 2023-09-21
 */

$output = executeApp();
$vemtoOutput = parseResponse($output);

echo $output . PHP_EOL;

if (hasError($output)) {
    echo parseError($output) . PHP_EOL;
}

// Save output to log
$outputFile = __DIR__ . '/out/merger.log';
file_put_contents($outputFile, $output);

function executeApp()
{
    $output = '';

    chdir(realpath(__DIR__ . '/apps/php-merger/'));
    $firstFilePath = realpath(__DIR__ . '/apps/php-merger/') . '/tests/NewFile.php';
    $secondFilePath = realpath(__DIR__ . '/apps/php-merger/') . '/tests/CurrentFile.php';
    $command = 'php ' . __DIR__ . '/apps/php-merger/index.php ' . $firstFilePath . ' ' . $secondFilePath;

    echo $command . PHP_EOL;
    $output = exec($command);
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