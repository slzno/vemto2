<?php

class Vemto {

    const SUCCESS = 0;
    const FAILURE = 1;

    public static function respondWith($data)
    {
        echo self::jsonResponse($data);
    }

    public static function log($message, $type = 'info')
    {
        $typeHeaders = [
            "info" => "[INFO]",
            "error" => "[ERROR]",
            "warning" => "[WARNING]",
            "success" => "[SUCCESS]",
        ];

        $logFileath = realpath(__DIR__ . '/../../../out/');
        $logFile = $logFileath . '/apps.log';

        if(!file_exists($logFile)) {
            file_put_contents($logFile, '');
        }

        file_put_contents($logFile, $typeHeaders[$type] . PHP_EOL . $message . PHP_EOL . PHP_EOL, FILE_APPEND);
    }

    public static function jsonResponse($data) {
        $jsonResponse = json_encode($data);

        return "VEMTO_JSON_RESPONSE_START(" . $jsonResponse . ")VEMTO_JSON_RESPONSE_END";
    }

    public static function execute(string $appName, $callback = null)
    {
        try {
            if($callback) {
                $callback();
            }

            exit(static::SUCCESS);
        } catch (\Throwable $th) {
            if(getenv('VEMTO_DEBUG')) {
                Vemto::log($th->getMessage(), 'error');
                Vemto::log($th->getTraceAsString(), 'error');
            }

            echo "VEMTO_ERROR_START({$appName} Error: " . $th->getMessage() . ")VEMTO_ERROR_END";

            exit(static::FAILURE);
        }
    }

}