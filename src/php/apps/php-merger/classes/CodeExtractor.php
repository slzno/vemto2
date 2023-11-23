<?php

trait CodeExtractor {

    public function extractPropertyCodeFromContent($content, $propertyName)
    {
        $pattern = "/(public|private|protected)?\s*\\$" . $propertyName . "\s*=\s*[^;]+;/ms";

        preg_match($pattern, $content, $matches);

        if (count($matches) > 0) {
            $propertyCode = $matches[0];
            return $propertyCode;
        } else {
            return '';
        }
    }

    public function extractMethodCodeFromContent($content, $methodName)
    {
        $pattern = "/(public|private|protected)?\s*function\s+" . $methodName . "\s*\([^)]*\)\s*{((?>[^{}]+|\{(?>[^{}]+|(?-1))*\})*)}/ms";

        preg_match($pattern, $content, $matches);

        if (count($matches) > 0) {
            $methodCode = $matches[0];
            return $methodCode;
        } else {
            return '';
        }
    }

}