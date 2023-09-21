<?php

use PhpParser\Node;
use PhpParser\Node\Stmt\Class_;
use PhpParser\NodeVisitorAbstract;
use PhpParser\Node\Stmt\ClassMethod;
use PhpParser\Node\Stmt\Property;
use PhpParser\Node\Stmt\Use_;

class StaticVisitor extends NodeVisitorAbstract
{
    public $imports = [];
    public $traits = [];
    public $properties = [];
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
        $this->fileContent = $fileContent;
    }

    public function setPreviousFilevisitor(mixed $previousFileVisitor)
    {
        $this->previousFileVisitor = $previousFileVisitor;
    }

    public function enterNode(Node $node)
    {
        // Use a stack to keep track of the current parent node
        // This is needed to set the parent attribute of the nodes
        if (!empty($this->stack)) {
            $node->setAttribute('parent', end($this->stack));
        }

        $this->stack[] = $node;

        // Extract file imports
        if ($node instanceof Use_) {
            $this->extractImport($node);
        }

        // Locate the current class
        if ($node instanceof Class_) {
            $this->currentClass = $node;
        }

        // Extract class use traits
        if ($node instanceof Node\Stmt\TraitUse) {
            $this->extractClassUseTrait($node);
        }

        // Extract class properties
        if ($node instanceof Property) {
            $this->extractClassProperty($node);
        }

        // Extract class methods
        if ($node instanceof ClassMethod) {
            $this->extractClassMethod($node);
        }
    }

    public function extractImport($node)
    {
        foreach ($node->uses as $use) {
            $this->imports[] = [
                'node' => $node,
                'name' => $use->name->toString(),
                'alias' => $use->alias ? $use->alias->toString() : null,
            ];
        }
    }

    public function extractClassUseTrait($node)
    {
        foreach ($node->traits as $trait) {
            $this->traits[] = [
                'node' => $node,
                'name' => $trait->toString(),
                'class' => $this->currentClass->name->name,
            ];
        }
    }

    public function extractClassProperty($node)
    {
        Vemto::log($node->props[0]->name->name);
        Vemto::log($this->extractPropertyCode($node->props[0]->name->name));

        $this->properties[] = [
            'node' => $node,
            'name' => $node->props[0]->name->name,
            'class' => $this->currentClass->name->name,
            'body' => $this->extractPropertyCode($node->props[0]->name->name),
        ];
    }

    public function extractPropertyCode($propertyName)
    {
        $pattern = "/(public|private|protected)?\s*\\$" . $propertyName . "\s*=\s*[^;]+;/ms";

        preg_match($pattern, $this->fileContent, $matches);

        if (count($matches) > 0) {
            $propertyCode = $matches[0];
            return $propertyCode;
        } else {
            return '';
        }
    }

    public function extractClassMethod($node)
    {
        $methodName = $node->name->name;

        $methodBody = $this->extractMethodCode($node->name->name);

        $this->methods[] = [
            'node' => $node,
            'name' => $methodName,
            'class' => $this->currentClass->name->name,
            'body' => $methodBody,
            'previousBody' => $this->getPreviousMethodBody($node->name->name),
        ];
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
