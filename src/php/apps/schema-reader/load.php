<?php

$APP_DIRECTORY = getcwd();

define('LARAVEL_START', microtime(true));

require $APP_DIRECTORY . '/vendor/autoload.php';

$app = require_once $APP_DIRECTORY . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$status = $kernel->handle(
    $input = new Symfony\Component\Console\Input\ArgvInput,
    new Symfony\Component\Console\Output\ConsoleOutput
);