<?php

use PhpParser\Node;
use PhpParser\Node\Stmt\Class_;
use PhpParser\NodeVisitorAbstract;
use PhpParser\Node\Stmt\ClassMethod;
use PhpParser\PrettyPrinter\Standard as StandardPrinter;

class StaticVisitor extends NodeVisitorAbstract
{
    public $methods = [];
    protected $fileContent = '';
    protected $currentClass = null;
    protected $previousFileVisitor = null;

    protected $stack;

    public function beginTraverse()
    {
        $this->stack = [];
    }

    public function setFileContent(string $fileContent)
    {
        Vemto::dump($fileContent);
        $this->fileContent = $fileContent;
    }

    public function setPreviousFilevisitor(mixed $previousFileVisitor)
    {
        $this->previousFileVisitor = $previousFileVisitor;
    }

    public function enterNode(Node $node)
    {
        // Use a stack to keep track of the current parent node
        if (!empty($this->stack)) {
            $node->setAttribute('parent', end($this->stack));
        }

        $this->stack[] = $node;

        if ($node instanceof Class_) {
            $this->currentClass = $node;
        }

        if ($node instanceof ClassMethod) {
            $printer = new StandardPrinter();

            $methodName = $node->name->name;

            $methodBody = $this->extractMethodCode($node->name->name);

            Vemto::dump($methodBody);

            $this->methods[] = [
                'node' => $node,
                'name' => $methodName,
                'class' => $this->currentClass->name->name,
                'body' => $methodBody,
                'previousBody' => $this->getPreviousMethodBody($node->name->name),
            ];
        }
    }

    public function extractMethodCode($methodName)
    {
        $pattern = "/(public|private|protected)?\s*function\s+" . $methodName . "\s*\([^)]*\)\s*{((?>[^{}]+|\{(?>[^{}]+|(?-1))*\})*)}/ms";

        preg_match($pattern, $this->fileContent, $matches);

        if (count($matches) > 0) {
            $methodCode = $matches[0];
            // $indentation = $this->getIndentation($methodCode);
            // $methodCode = str_replace("\n" . $indentation, "\n", $methodCode);
            return $methodCode;
        } else {
            return '';
        }
    }

    private function getIndentation($code)
    {
        $indentation = '';
        $matches = array();

        if (preg_match("/^(\s+)/m", $code, $matches)) {
            $indentation = $matches[1];
        }
        
        return $indentation;
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
