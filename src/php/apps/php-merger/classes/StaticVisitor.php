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

    private $stack;

    public function beginTraverse()
    {
        $this->stack = [];
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

            $methodBody = $printer->prettyPrint([$node]);

            $this->methods[] = [
                'node' => $node,
                'name' => $node->name->name,
                'class' => $this->currentClass->name->name,
                'body' => $methodBody,
                'internalBody' => $node->stmts,
            ];
        }
    }
}