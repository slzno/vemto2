<?php

$APP_DIRECTORY = getcwd();

echo $APP_DIRECTORY . "\n";

define('LARAVEL_START', microtime(true));

require $APP_DIRECTORY . '/vendor/autoload.php';

$app = require_once $APP_DIRECTORY . '/bootstrap/app.php';

echo "oi";