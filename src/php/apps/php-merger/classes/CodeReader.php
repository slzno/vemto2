<?php

use PhpParser\Node;
use PhpParser\Node\Stmt\Use_;
use PhpParser\Node\Stmt\Class_;
use PhpParser\Node\Stmt\Property;
use PhpParser\Node\Stmt\ClassMethod;

trait CodeReader {

    use CodeExtractor;

    public $imports = [];
    public $classes = [];
    public $traits = [];
    public $properties = [];
    public $methods = [];

    protected $fileContent = '';
    protected $currentClass = null;

    /**
     * The stack is used to track node parents
     *
     * @var array
     */
    protected $stack = [];

    public function beginTraverse()
    {
        $this->stack = [];
        $this->classes = [];
    }

    public function setFileContent(string $fileContent)
    {
        $this->fileContent = $fileContent;
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

            $this->classes[] = $node;
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
            $importName = $use->name->toString();

            $this->imports[$importName] = [
                'node' => $node,
                'name' => $importName,
                'alias' => $use->alias ? $use->alias->toString() : null,
            ];
        }
    }

    public function extractClassUseTrait($node)
    {
        foreach ($node->traits as $trait) {
            $traitName = $trait->toString();

            $this->traits[$traitName] = [
                'node' => $node,
                'name' => $traitName,
                'class' => $this->currentClass->name->name,
            ];
        }
    }

    public function extractClassProperty($node)
    {
        $propertyName = $node->props[0]->name->name;
        $propertyBody = $this->extractPropertyCode($node->props[0]->name->name);

        $this->properties[$propertyName] = [
            'node' => $node,
            'name' => $propertyName,
            'class' => $this->currentClass->name->name,
            'body' => $propertyBody,
        ];
    }

    public function extractPropertyCode($propertyName)
    {
        return $this->extractPropertyCodeFromContent($this->fileContent, $propertyName);
    }

    public function extractClassMethod($node)
    {
        $methodName = $node->name->name;
        $methodBody = $this->extractMethodCode($node->name->name);
        $previousMethodBody = $this->getPreviousMethodBody($node->name->name);

        $this->methods[$methodName] = [
            'node' => $node,
            'name' => $methodName,
            'class' => $this->currentClass->name->name,
            'body' => $methodBody,
            'previousBody' => $previousMethodBody,
        ];
    }

    public function extractMethodCode($methodName)
    {
        return $this->extractMethodCodeFromContent($this->fileContent, $methodName);
    }

    protected function getPreviousMethodBody() {
        return null;
    }

    public function getImportByName(string $name)
    {
        return $this->imports[$name] ?? null;
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

    public function getTraitByName(string $name)
    {
        return $this->traits[$name] ?? null;
    }

    public function getPropertyByName(string $propertyName)
    {
        return $this->properties[$propertyName] ?? null;
    }
    
    public function getMethodByName(string $methodName)
    {
        return $this->methods[$methodName] ?? null;
    }

}