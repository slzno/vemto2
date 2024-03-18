<?php

use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class ExtendedKernel extends ConsoleKernel
{
    public function handle($input, $output = null)
    {
        try {
            $this->bootstrap();
        } catch (Throwable $e) {
            $this->reportException($e);
            $this->renderException($output, $e);

            return 1;
        }
    }
}