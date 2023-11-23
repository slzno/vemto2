<?php // ATTENTION: Don't change this file. Instead, change the original file under src/php/common

class Vemto
{

    const SUCCESS = 0;
    const FAILURE = 1;

    public static function respondWith($data)
    {
        echo self::jsonResponse($data);

        exit(self::SUCCESS);
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

        if (getenv('VEMTO_DEBUG')) {
            $logFilePath = realpath(__DIR__ . '/../../../out/');
            $logFile = $logFilePath . '/apps.log';
        } else {
            $logFile = getcwd() . '/vemto.log';
        }

        // If the log file doesn't exist, create it
        // If we are not in debug mode, we also clear the log file
        if (!file_exists($logFile) || !getenv('VEMTO_DEBUG')) {
            file_put_contents($logFile, '');
        }

        file_put_contents($logFile, $typeHeaders[$type] . PHP_EOL . $message . PHP_EOL . PHP_EOL, FILE_APPEND);
    }

    public static function clearLog()
    {
        $logFilePath = realpath(__DIR__ . '/../../../out/');
        $logFile = $logFilePath . '/apps.log';

        file_put_contents($logFile, '');
    }

    public static function jsonResponse($data)
    {
        $jsonResponse = json_encode($data);

        return "VEMTO_JSON_RESPONSE_START(" . $jsonResponse . ")VEMTO_JSON_RESPONSE_END";
    }

    public static function writeProcessedFile($fileContent)
    {
        $processedFilesFolder = getcwd() . '/.vemto/processed-files';
        $processedFileName = Illuminate\Support\Str::random(32) . '.php';
        $processedFilePath = $processedFilesFolder . '/' . $processedFileName;

        if (!file_exists($processedFilesFolder)) {
            mkdir($processedFilesFolder);
        }

        file_put_contents($processedFilePath, $fileContent);

        return [
            'path' => $processedFilePath,
            'name' => $processedFileName,
        ];
    }

    public static function writeConflictsFile($conflicts)
    {
        $conflictsFileFolder = getcwd() . '/.vemto/conflicts';
        $conflictsFileName = Illuminate\Support\Str::random(32) . '.json';
        $conflictsFilePath = $conflictsFileFolder . '/' . $conflictsFileName;

        if (!file_exists($conflictsFileFolder)) {
            mkdir($conflictsFileFolder);
        }

        $conflictsFileContent = json_encode($conflicts, JSON_PRETTY_PRINT);

        file_put_contents($conflictsFilePath, $conflictsFileContent);

        return [
            'path' => $conflictsFilePath,
            'name' => $conflictsFileName,
        ];
    }

    public static function execute(string $appName, $callback = null)
    {
        try {
            if ($callback) {
                $callback();
            }

            exit(static::SUCCESS);
        } catch (\Throwable $th) {
            if (getenv('VEMTO_DEBUG')) {
                Vemto::log($th->getMessage(), 'error');
                Vemto::log($th->getTraceAsString(), 'error');
            }

            echo "VEMTO_ERROR_START({$appName} Error: " . $th->getMessage() . ")VEMTO_ERROR_END";
            echo "VEMTO_ERROR_TRACE_START({$appName} Error: " . $th->getTraceAsString() . ")VEMTO_ERROR_TRACE_END";

            exit(static::FAILURE);
        }
    }

    public static function runPhpCsFixer($fileContent)
    {
        $staticFolder = Vemto::getStaticFolder();
        $phpCsFixerPath = $staticFolder . '/tools/php-cs-fixer/vendor/bin/php-cs-fixer';
        $phpCsFixerSettingsPath = $staticFolder . '/tools/php-cs-fixer/.php-cs-fixer.php';

        if (!file_exists($phpCsFixerPath)) {
            throw new Exception("PHP CS Fixer not found on internal build");
        }

        // run cs fixer on the generated code
        $newFileContent = Vemto::manipulateTemporaryFile($fileContent, function ($temporaryFilePath) use ($phpCsFixerPath, $phpCsFixerSettingsPath) {
            $command = "{$phpCsFixerPath} fix {$temporaryFilePath} --using-cache=no --config={$phpCsFixerSettingsPath}";

            shell_exec($command);

            return file_get_contents($temporaryFilePath);
        });

        return $newFileContent;
    }

    public static function manipulateTemporaryFile($fileContent, $manipulationCallback = null)
    {
        $newFileContent = $fileContent;

        $temporaryFilePath = tempnam(sys_get_temp_dir(), 'vemto');

        file_put_contents($temporaryFilePath, $fileContent);

        if ($manipulationCallback) {
            $newFileContent = $manipulationCallback($temporaryFilePath);
        }

        unlink($temporaryFilePath);

        return $newFileContent;
    }

    public static function getStaticFolder()
    {
        // If we are running from a phar file, the static folder is in the same directory
        if (strpos(__FILE__, 'phar://') === 0) {
            $pharLocation = str_replace('\\', '/', $_SERVER['SCRIPT_FILENAME']);
            return dirname($pharLocation);
        }

        return realpath(__DIR__ . '/../../../../main/static');
    }
}
