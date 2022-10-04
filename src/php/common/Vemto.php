<?php

class Vemto {

    const SUCCESS = 0;
    const FAILURE = 1;

    public static function respondWith($data)
    {
        echo self::jsonResponse($data);
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
            echo "VEMTO_ERROR_START({$appName} Error: " . $th->getMessage() . ")VEMTO_ERROR_END";
            throw $th;

            exit(static::FAILURE);
        }
    }

}