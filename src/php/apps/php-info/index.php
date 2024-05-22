<?php

ini_set('display_errors', 'On');

$data = [
    'version' => phpversion(),
    'extensions' => get_loaded_extensions(),
];

$jsonResponse = json_encode($data);

echo "VEMTO_JSON_RESPONSE_START(" . $jsonResponse . ")VEMTO_JSON_RESPONSE_END";

exit;