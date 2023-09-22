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

            $this->extractClass($node);
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

    public function extractClass($node)
    {
        $className = $node->name->name;

        $this->classes[$className] = [
            'node' => $node,
            'name' => $className,
            'extends' => $node->extends ? $node->extends->toString() : null,
            'implements' => $node->implements ? $node->implements[0]->toString() : null,
        ];
    }

    public function calculateFirstTraitStmtPosition($node)
    {
        $firstTraitStmtPosition = 0;

        foreach ($node->stmts as $key => $stmt) {
            if ($stmt instanceof Node\Stmt\TraitUse) {
                $firstTraitStmtPosition = $key;
                break;
            }
        }

        return $firstTraitStmtPosition;
    }

    public function calculateFirstPropertyStmtPosition($node)
    {
        $firstPropertyStmtPosition = 0;

        foreach ($node->stmts as $key => $stmt) {
            if ($stmt instanceof Property) {
                $firstPropertyStmtPosition = $key;
                break;
            }
        }

        return $firstPropertyStmtPosition;
    }

    public function calculateFirstMethodStmtPosition($node)
    {
        $firstMethodStmtPosition = 0;

        foreach ($node->stmts as $key => $stmt) {
            if ($stmt instanceof ClassMethod) {
                $firstMethodStmtPosition = $key;
                break;
            }
        }

        return $firstMethodStmtPosition;
    }

    public function calculateLastTraitStmtPosition($node)
    {
        $latestTraitStmtPosition = 0;

        foreach ($node->stmts as $key => $stmt) {
            if ($stmt instanceof Node\Stmt\TraitUse) {
                $latestTraitStmtPosition = $key;
            }
        }

        return $latestTraitStmtPosition;
    }

    public function calculateLastPropertyStmtPosition($node)
    {
        $latestPropertyStmtPosition = 0;

        foreach ($node->stmts as $key => $stmt) {
            if ($stmt instanceof Property) {
                $latestPropertyStmtPosition = $key;
            }
        }

        return $latestPropertyStmtPosition;
    }

    public function calculateLastMethodStmtPosition($node)
    {
        $latestMethodStmtPosition = 0;

        foreach ($node->stmts as $key => $stmt) {
            if ($stmt instanceof ClassMethod) {
                $latestMethodStmtPosition = $key;
            }
        }

        return $latestMethodStmtPosition;
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

    public function getImportByName(string $importName)
    {
        return $this->imports[$importName] ?? null;
    }

    protected function getClassByName(string $className) {
        return $this->classes[$className] ?? null;
    }

    public function getTraitByName(string $traitName)
    {
        return $this->traits[$traitName] ?? null;
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