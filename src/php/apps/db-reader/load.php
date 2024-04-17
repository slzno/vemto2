<?php

$APP_DIRECTORY = getcwd();
$SCRIPT_DIRECTORY = __DIR__;

define('LARAVEL_START', microtime(true));

// IMPORTANT: this autoloader needs to be included before the composer autoloader
require $SCRIPT_DIRECTORY . '/phar-autoloader.php';
// ------------------------------------------------------------------------------

require $APP_DIRECTORY . '/vendor/autoload.php';