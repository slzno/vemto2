<?php

namespace Vemto;

use Exception;

class ValidationException extends Exception
{
    public function __construct($message, $fields = [], $code = 0, Exception $previous = null)
    {
        $messageData = [
            'message' => $message,
            'fields' => $fields
        ];

        $jsonData = json_encode($messageData);

        $message = "VALIDATION_ERROR($jsonData)";

        parent::__construct($message, $code, $previous);
    }
}