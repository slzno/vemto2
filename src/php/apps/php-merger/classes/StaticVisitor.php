<?php

use PhpParser\NodeVisitorAbstract;
class StaticVisitor extends NodeVisitorAbstract
{
    use CodeReader;

    protected $previousFileVisitor = null;

    public function setPreviousFilevisitor(mixed $previousFileVisitor)
    {
        $this->previousFileVisitor = $previousFileVisitor;
    }

    protected function getPreviousMethodBody(string $methodName)
    {
        if ($this->previousFileVisitor) {
            foreach ($this->previousFileVisitor->methods as $method) {
                if ($method['name'] === $methodName) {
                    return $method['body'];
                }
            }
        }

        return null;
    }
}
