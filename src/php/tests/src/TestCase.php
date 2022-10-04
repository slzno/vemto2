<?php

namespace Tests;

use PHPUnit\Framework\TestCase as BaseTestCase;

class TestCase extends BaseTestCase {

    protected function assertResponseEqualsExpected($response)
    {
        $testName = $this->getName();
        
        // expectedFile needs to use reflection to get the class folder
        // and then append the test name to it
        $testFileName = (new \ReflectionClass($this))->getFileName();
        $testFolder = dirname($testFileName);
        $expectedFile = $testFolder . '/out/' . $testName . '.json';
        
        if (!file_exists($expectedFile)) {
            file_put_contents($expectedFile, json_encode($response, JSON_PRETTY_PRINT));
        }

        $expected = file_get_contents($expectedFile);
        $jsonResponse = json_encode($response, JSON_PRETTY_PRINT);

        $this->assertEquals($expected, $jsonResponse);
    }

    public function parseResponse($data)
    {
        // get text betweeen VEMTO_JSON_RESPONSE_START( and )VEMTO_JSON_RESPONSE_END
        $data = preg_replace('/.*VEMTO_JSON_RESPONSE_START\(/', '', $data);
        $data = preg_replace('/\)VEMTO_JSON_RESPONSE_END.*/', '', $data);
        $data = preg_replace('/\s+/', '', $data);

        return json_decode($data);
    }

    public function executeApp(string $app = 'schema-reader', string $laravelApp = 'laravel9-basic')
    {
        chdir(realpath(__DIR__ . '/../../laravel-base/' . $laravelApp));
        $executedSuccessfully = exec('php ' . __DIR__ . '/../../apps/' . $app . '/index.php', $output);
        chdir(__DIR__);

        if (!$executedSuccessfully) {
            // translate the output to a string
            $output = implode(PHP_EOL, $output);
            throw new \Exception($output);
        }

        return $output[0];
    }

}