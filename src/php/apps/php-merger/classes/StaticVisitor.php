<?php

use PhpParser\Node;
use PhpParser\Node\Stmt\Class_;
use PhpParser\NodeVisitorAbstract;
use PhpParser\Node\Stmt\ClassMethod;
use PhpParser\PrettyPrinter\Standard as StandardPrinter;

class StaticVisitor extends NodeVisitorAbstract
{
    public $methods = [];
    protected $currentClass = null;
    private $previousFileVisitor = null;

    private $stack;

    public function beginTraverse()
    {
        $this->stack = [];
    }

    public function setPreviousFilevisitor(mixed $previousFileVisitor)
    {
        $this->previousFileVisitor = $previousFileVisitor;
    }

    public function enterNode(Node $node)
    {
        // Use a stack to keep track of the current parent node
        if(!empty($this->stack)) {
            $node->setAttribute('parent', end($this->stack));
        }

        $this->stack[] = $node;

        if($node instanceof Class_) {
            $this->currentClass = $node;
        }

        if ($node instanceof ClassMethod) {
            $printer = new StandardPrinter();

            $methodName = $node->name->name;
            $methodBody = $printer->prettyPrint([$node]);

            $this->methods[] = [
                'node' => $node,
                'name' => $methodName,
                'class' => $this->currentClass->name->name,
                'body' => $methodBody,
                'previousBody' => $this->getPreviousMethodBody($node->name->name),
            ];
        }
    }

    protected function getPreviousMethodBody(string $methodName)
    {
        if($this->previousFileVisitor) {
            foreach($this->previousFileVisitor->methods as $method) {
                if($method['name'] === $methodName) {
                    return $method['body'];
                }
            }
        }

        return null;
    }
}