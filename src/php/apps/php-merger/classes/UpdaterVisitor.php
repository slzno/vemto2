<?php

use PhpParser\Node;
use PhpParser\Node\Stmt\Class_;
use PhpParser\NodeVisitorAbstract;
use PhpParser\Node\Stmt\ClassMethod;
use PhpParser\PrettyPrinter\Standard as StandardPrinter;

class UpdaterVisitor extends NodeVisitorAbstract
{
    public $methods = [];

    private $stack;
    private $classes = [];
    private $currentClass = null;

    protected $newFileVisitor;
    protected $currentFileAst;

    public function setNewFileVisitor(mixed $newFileVisitor)
    {
        $this->newFileVisitor = $newFileVisitor;
    }

    public function setCurrentFileAst(mixed $currentFileAst)
    {
        $this->currentFileAst = $currentFileAst;
    }

    public function getCurrentFileAst()
    {
        return $this->currentFileAst;
    }

    public function beginTraverse()
    {
        $this->stack = [];
    }

    public function enterNode(Node $node)
    {
        if(!empty($this->stack)) {
            $node->setAttribute('parent', end($this->stack));
        }

        $this->stack[] = $node;

        if($node instanceof Class_) {
            $this->currentClass = $node;

            $this->classes[] = $node;
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

    public function afterTraverse(array $nodes)
    {
        $this->addInexistentMethods();
    }

    protected function addInexistentMethods()
    {
        foreach ($this->newFileVisitor->methods as $newMethod) {

            $methodExists = false;

            foreach ($this->methods as $currentMethod) {
                if ($newMethod['name'] === $currentMethod['name'] && $newMethod['class'] === $currentMethod['class']) {
                    $methodExists = true;
                }
            }

            if (!$methodExists) {
                $this->addMethod($newMethod);
            } else {
                $this->updateMethod($newMethod);
            }
        }
    }

    protected function addMethod(array $method)
    {
        $class = $this->getClassByName($method['class']);

        if ($class) {
            $class->stmts[] = $method['node'];
        }
    }

    protected function updateMethod(array $method)
    {

        // para saber se houve um conflito, primeiro eu preciso comparar a versão atual do método com a última vez que foi gerado
        // se houver diferença, preciso registrar o conflito e gravar um arquivo de conflito

        $class = $this->getClassByName($method['class']);

        if ($class) {
            foreach ($class->stmts as $key => $stmt) {
                if ($stmt instanceof ClassMethod && $stmt->name->name === $method['name']) {
                    $class->stmts[$key] = $method['node'];
                }
            }
        }
    }

    protected function getClassByName(string $name) {
        $class = null;

        foreach ($this->classes as $currentClass) {
            if ($currentClass->name->name === $name) {
                $class = $currentClass;
            }
        }

        return $class;
    }
}