<?php

use PhpParser\Node;
use PhpParser\Node\Stmt\Class_;
use PhpParser\NodeVisitorAbstract;
use PhpParser\Node\Stmt\ClassMethod;

class UpdaterVisitor extends NodeVisitorAbstract
{
    use CodeReader;

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

    public function afterTraverse(array $nodes)
    {
        $this->addMissingImports();
        $this->addMissingTraits();
        $this->addOrUpdateProperties();
        $this->addOrUpdateMethods();
    }

    protected function addMissingImports()
    {
        foreach ($this->newFileVisitor->imports as $newImport) {
            $importExists = false;

            foreach ($this->imports as $currentImport) {
                $sameName = $newImport['name'] == $currentImport['name'];
                $sameAlias = $newImport['alias'] == $currentImport['alias'];

                $importExists = $sameName && $sameAlias;

                if($importExists) break;
            }

            if (!$importExists) {
                $this->addImport($newImport);
            }
        }
    }

    protected function addImport(array $newImport)
    {
        $importNode = $newImport['node'];

        array_unshift($this->currentFileAst[0]->stmts, $importNode);
    }

    protected function addMissingTraits()
    {
        foreach ($this->newFileVisitor->traits as $newTrait) {
            $traitExists = false;

            foreach ($this->traits as $currentTrait) {
                $sameName = $newTrait['name'] == $currentTrait['name'];
                $sameClass = $newTrait['class'] == $currentTrait['class'];

                $traitExists = $sameName && $sameClass;

                if($traitExists) break;
            }

            if (!$traitExists) {
                $this->addTrait($newTrait);
            }
        }
    }

    protected function addTrait(array $newTrait)
    {
        $class = $this->getClassByName($newTrait['class']);

        if ($class) {
            $class['node']->stmts[] = $newTrait['node'];
        }
    }

    protected function addOrUpdateProperties()
    {
        $invertedProperties = array_reverse($this->newFileVisitor->properties);

        foreach ($invertedProperties as $newProperty) {
            $propertyExists = false;

            foreach ($this->properties as $currentProperty) {
                $sameName = $newProperty['name'] === $currentProperty['name'];
                $sameClass = $newProperty['class'] === $currentProperty['class'];

                $propertyExists = $sameName && $sameClass;

                if($propertyExists) break;
            }

            if (!$propertyExists) {
                $this->addProperty($newProperty);
            } else {
                $this->updateProperty($newProperty);
            }
        }
    }

    protected function addProperty(array $newProperty)
    {
        $class = $this->getClassByName($newProperty['class']);

        if ($class) {
            $class['node']->stmts[] = $newProperty['node'];
        }
    }

    protected function updateProperty(array $newProperty)
    {
        $class = $this->getClassByName($newProperty['class']);

        if ($class) {
            foreach ($class['node']->stmts as $key => $propertyStatementsNode) {
                $propertyName = $propertyStatementsNode->props[0]->name->name ?? null;

                if(!$propertyName) continue;

                if ($propertyStatementsNode instanceof Node\Stmt\Property && $propertyName === $newProperty['name']) {
                    $currentProperty = $this->getPropertyByName($propertyName);

                    $currentPropertyBody = $currentProperty['body'];

                    $newPropertyIsDifferentFromCurrent = $newProperty['body'] !== $currentPropertyBody;

                    if($newPropertyIsDifferentFromCurrent) {
                        $this->registerConflict($currentPropertyBody, $newProperty['body']);
                    }

                    $class['node']->stmts[$key] = $newProperty['node'];
                }
            }
        }
    }

    protected function addOrUpdateMethods()
    {
        foreach ($this->newFileVisitor->methods as $newMethod) {
            $methodExists = false;

            foreach ($this->methods as $currentMethod) {
                $sameName = $newMethod['name'] === $currentMethod['name'];
                $sameClass = $newMethod['class'] === $currentMethod['class'];

                $methodExists = $sameName && $sameClass;

                if($methodExists) break;
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
            $class['node']->stmts[] = $newMethod['node'];
        }
    }

    protected function updateMethod(array $newMethod)
    {
        $class = $this->getClassByName($newMethod['class']);

        if ($class) {
            foreach ($class['node']->stmts as $key => $methodStatementsNode) {
                $methodName = $methodStatementsNode->name->name ?? null;

                if(!$methodName) continue;

                if ($methodStatementsNode instanceof ClassMethod && $methodStatementsNode->name->name === $newMethod['name']) {
                    $currentMethod = $this->getMethodByName($methodName);

                    $currentMethodBody = $currentMethod['body'];

                    $newMethodIsDifferentFromCurrent = $newMethod['body'] !== $currentMethodBody;

                    if($newMethodIsDifferentFromCurrent) {
                        $this->registerConflict($currentMethodBody, $newMethod['body']);
                    }

                    $class['node']->stmts[$key] = $newMethod['node'];
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
}