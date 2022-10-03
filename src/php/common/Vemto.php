<?php

class Vemto {

    public static function jsonResponse($data) {
        $jsonResponse = json_encode($data);

        return "VEMTO_JSON_RESPONSE_INIT(" . $jsonResponse . ")VEMTO_JSON_RESPONSE_END";
    }

}