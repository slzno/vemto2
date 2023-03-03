<?php

// Load the vendor files
require_once 'load.php';

// Load Vemto classes
require_once 'common/Vemto.php';

use PhpParser\PrettyPrinter\Standard as StandardPrinter;

Vemto::execute('php-merger', function () use ($argv) {
    
    $newFilePath = $argv[1];
    $currentFilePath = $argv[2];

    $newFileAst = (new PhpParser\ParserFactory())
        ->create(PhpParser\ParserFactory::PREFER_PHP7)
        ->parse(file_get_contents($newFilePath));

    // Parse the contents of the first and second files into ASTs
    $currentFileAst = (new PhpParser\ParserFactory())
        ->create(PhpParser\ParserFactory::PREFER_PHP7)
        ->parse(file_get_contents($currentFilePath));

    // Traverse the AST of the second file and identify new/changed elements
    $newFileVisitor = new class extends PhpParser\NodeVisitorAbstract
    {
        public $methods = [];
        protected $currentClass = null;

        private $stack;

        public function beginTraverse()
        {
            $this->stack = [];
        }

        public function enterNode(PhpParser\Node $node)
        {
            // Use a stack to keep track of the current parent node
            if(!empty($this->stack)) {
                $node->setAttribute('parent', end($this->stack));
            }

            $this->stack[] = $node;

            if($node instanceof PhpParser\Node\Stmt\Class_) {
                $this->currentClass = $node;
            }

            if ($node instanceof PhpParser\Node\Stmt\ClassMethod) {
                $printer = new StandardPrinter();

                $methodBody = $printer->prettyPrint([$node]);

                $this->methods[] = [
                    'node' => $node,
                    'name' => $node->name->name,
                    'class' => $this->currentClass->name->name,
                    'body' => $methodBody
                ];
            }
        }
    };

    $newFileTraverser = new PhpParser\NodeTraverser();
    $newFileTraverser->addVisitor($newFileVisitor);
    $newFileTraverser->traverse($newFileAst);

    // Traverse the AST of the first file and mark all unchanged elements
    $currentFileVisitor = new class extends PhpParser\NodeVisitorAbstract
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

        public function enterNode(PhpParser\Node $node)
        {
            if(!empty($this->stack)) {
                $node->setAttribute('parent', end($this->stack));
            }

            $this->stack[] = $node;

            if($node instanceof PhpParser\Node\Stmt\Class_) {
                $this->currentClass = $node;

                $this->classes[] = $node;
            }

            if ($node instanceof PhpParser\Node\Stmt\ClassMethod) {
                $printer = new StandardPrinter();

                $methodBody = $printer->prettyPrint([$node]);

                $this->methods[] = [
                    'node' => $node,
                    'name' => $node->name->name,
                    'class' => $this->currentClass->name->name,
                    'body' => $methodBody
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
            $class = $this->getClassByName($method['class']);

            if ($class) {
                foreach ($class->stmts as $key => $stmt) {
                    if ($stmt instanceof PhpParser\Node\Stmt\ClassMethod && $stmt->name->name === $method['name']) {
                        Vemto::log('found the same method: ' . $stmt->name->name);
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
    };


    $currentFileVisitor->setNewFileVisitor($newFileVisitor);
    $currentFileVisitor->setCurrentFileAst($currentFileAst);

    $currentFileTraverser = new PhpParser\NodeTraverser();
    $currentFileTraverser->addVisitor($currentFileVisitor);
    $currentFileTraverser->traverse($currentFileAst);


    // Write the modified AST back to the first file
    $resultFileFolder = getcwd() . '/.vemto/processed-files';
    $resultFilePath = $resultFileFolder . '/' . Illuminate\Support\Str::random(32) . '.php';

    $printer = new PhpParser\PrettyPrinter\Standard();

    if(!file_exists($resultFileFolder)) {
        mkdir($resultFileFolder);
    }

    $resultFileContent = $printer->prettyPrintFile($currentFileVisitor->getCurrentFileAst());

    file_put_contents($resultFilePath, $resultFileContent);

    Vemto::respondWith($resultFilePath);
});