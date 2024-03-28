<?php

namespace App\Models;

class Check extends ExistingModel
{
    public static function canRun()
    {
        return true;
    }
}
