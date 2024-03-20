<?php

$APP_DIRECTORY = getcwd();
$SCRIPT_DIRECTORY = __DIR__;

define('LARAVEL_START', microtime(true));

require $SCRIPT_DIRECTORY . '/vendor/autoload.php';