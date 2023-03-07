<?php

class Vemto {

    const SUCCESS = 0;
    const FAILURE = 1;

    public static function respondWith($data)
    {
        echo self::jsonResponse($data);
    }

    public static function dump(mixed $data)
    {
        $text = print_r($data, true);

        self::log($text);
    }

    public static function log($message, $type = 'info')
    {
        $typeHeaders = [
            "info" => "[INFO]",
            "error" => "[ERROR]",
            "warning" => "[WARNING]",
            "success" => "[SUCCESS]",
        ];

        if(getenv('VEMTO_DEBUG')) {
            $logFilePath = realpath(__DIR__ . '/../../../out/');
            $logFile = $logFilePath . '/apps.log';
        } else {
            $logFile = getcwd() . '/vemto.log';
        }

        if(!file_exists($logFile)) {
            file_put_contents($logFile, '');
        }

        file_put_contents($logFile, $typeHeaders[$type] . PHP_EOL . $message . PHP_EOL . PHP_EOL, FILE_APPEND);
    }

    public static function jsonResponse($data) {
        $jsonResponse = json_encode($data);

        return "VEMTO_JSON_RESPONSE_START(" . $jsonResponse . ")VEMTO_JSON_RESPONSE_END";
    }

    public static function writeProcessedFile($fileContent) {
        $processedFilesFolder = getcwd() . '/.vemto/processed-files';
        $processedFilePath = $processedFilesFolder . '/' . Illuminate\Support\Str::random(32) . '.php';

        if(!file_exists($processedFilesFolder)) {
            mkdir($processedFilesFolder);
        }

        file_put_contents($processedFilePath, $fileContent);

        return $processedFilePath;
    }

    public static function writeConflictsFile($conflicts) {
        $conflictsFileFolder = getcwd() . '/.vemto/conflicts';
        $conflictsFilePath = $conflictsFileFolder . '/' . Illuminate\Support\Str::random(32) . '.json';

        if(!file_exists($conflictsFileFolder)) {
            mkdir($conflictsFileFolder);
        }

        $conflictsFileContent = json_encode($conflicts, JSON_PRETTY_PRINT);

        file_put_contents($conflictsFilePath, $conflictsFileContent);

        return $conflictsFilePath;
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
            echo "VEMTO_ERROR_TRACE_START({$appName} Error: " . $th->getTraceAsString() . ")VEMTO_ERROR_TRACE_END";

            exit(static::FAILURE);
        }
    }

}