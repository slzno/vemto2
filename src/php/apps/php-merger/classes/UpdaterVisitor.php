<?php

use PhpParser\Node;
use PhpParser\Node\Stmt\Class_;
use PhpParser\NodeVisitorAbstract;
use PhpParser\Node\Stmt\ClassMethod;

class UpdaterVisitor extends NodeVisitorAbstract
{
    public $methods = [];

    protected $stack;
    protected $classes = [];
    protected $fileContent = '';
    protected $currentClass = null;

    protected $newFileVisitor;
    protected $currentFileAst;

    protected $conflicts = [];

    public function setFileContent(string $fileContent)
    {
        $this->fileContent = $fileContent;
    }

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
            $methodName = $node->name->name;

            $methodBody = $this->extractMethodCode($node->name->name);

            $this->methods[$methodName] = [
                'node' => $node,
                'name' => $methodName,
                'class' => $this->currentClass->name->name,
                'body' => $methodBody,
            ];
        }    
    }

    public function extractMethodCode($methodName)
    {
        $pattern = "/(public|private|protected)?\s*function\s+" . $methodName . "\s*\([^)]*\)\s*{((?>[^{}]+|\{(?>[^{}]+|(?-1))*\})*)}/ms";

        preg_match($pattern, $this->fileContent, $matches);

        if (count($matches) > 0) {
            $methodCode = $matches[0];
            return $methodCode;
        } else {
            return '';
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

    protected function addMethod(array $newMethod)
    {
        $class = $this->getClassByName($newMethod['class']);

        if ($class) {
            $class->stmts[] = $newMethod['node'];
        }
    }

    protected function updateMethod(array $newMethod)
    {
        $class = $this->getClassByName($newMethod['class']);

        if ($class) {
            foreach ($class->stmts as $key => $methodStatementsNode) {
                $methodName = $methodStatementsNode->name->name ?? null;

                if(!$methodName) continue;

                if ($methodStatementsNode instanceof ClassMethod && $methodStatementsNode->name->name === $newMethod['name']) {
                    $currentMethodBody = $this->methods[$methodName]['body'];

                    $newMethodIsDifferentFromCurrent = $newMethod['body'] !== $currentMethodBody;

                    if($newMethodIsDifferentFromCurrent) {
                        $this->registerConflict($currentMethodBody, $newMethod['body']);
                    }

                    $class->stmts[$key] = $newMethod['node'];
                }
            }
        }
    }

    protected function registerConflict(string $currentContent, string $newContent)
    {
        $this->conflicts[] = [
            'id' => uniqid(),
            'currentContent' => $currentContent,
            'newContent' => $newContent,
        ];
    }

    public function getConflicts()
    {
        return $this->conflicts;
    }

    public function hasConflicts()
    {
        return !empty($this->conflicts);
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