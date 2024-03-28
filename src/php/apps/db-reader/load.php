<?php

$APP_DIRECTORY = getcwd();
$SCRIPT_DIRECTORY = __DIR__;

define('LARAVEL_START', microtime(true));

require $APP_DIRECTORY . '/vendor/autoload.php';
require $SCRIPT_DIRECTORY . '/phar-autoloader.php';