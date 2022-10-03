<?php declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

final class SchemaReaderTest extends TestCase {

    public function test_it_correctly_reads_laravel_9_migrations()
    {
        $out = $this->executeApp('schema-reader', 'laravel9-basic');
        $response = $this->parseResponse($out);

        $this->assertResponseEqualsExpected($response);
    }

}