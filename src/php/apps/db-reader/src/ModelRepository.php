<?php

namespace VemtoDBReader;

use Illuminate\Support\Facades\File;
use Illuminate\Database\Eloquent\Relations\Relation;
use ReflectionClass;

/**
 * TODO: Refactor this class to have a cleaner code (it was experimental but turned out 
 * to be functional, so it needs a refactor)
 */

class ModelRepository {
    protected array $models = [];
    protected string $projectPath;
    
    public function __construct(string $projectPath) {
        $this->projectPath = $projectPath;
    }

    public function getFormatted() {
        $models = $this->get();

        $formattedModels = [];

        foreach ($models as $model) {
            $allImports = $this->getAllImports($model);

            $allImports = collect($allImports)->map(function ($importData) {
                return $this->buildImportStatementFromData($importData);
            })->values()->toArray();

            $reflection = new \ReflectionClass($model['class']);
            
            // get the model parent class
            $parentClass = $reflection->getParentClass();

            // get the model interfaces
            $interfaces = $reflection->getInterfaces();

            // remove interfaces that are implemented by the parent class
            $interfaces = collect($interfaces)->filter(function ($interface) use ($parentClass) {
                return ! $parentClass || ! $parentClass->implementsInterface($interface->name);
            })->values()->toArray();
            $interfaces = collect($interfaces)->map(function ($interface) use ($model) {
                return $this->buildImportStatement($model, $interface);
            })->values()->toArray();

            // get the model traits
            $traits = collect($reflection->getTraits())->map(function ($trait) use ($model) {
                return $this->buildImportStatement($model, $trait);
            })->values()->toArray();

            // remove traits from allImports (because the regex to get the imports also gets the traits)
            $traitsShortNames = collect($reflection->getTraits())->map(function ($trait) {
                return $trait->getShortName();
            })->values()->toArray();
            $allImports = collect($allImports)->filter(function ($import) use ($traitsShortNames) {
                return ! in_array($import, $traitsShortNames);
            })->values()->toArray();

            $properties = $reflection->getDefaultProperties();

            $fillable = $properties['fillable'] ?? [];
            $casts = $properties['casts'] ?? [];
            $dates = $properties['dates'] ?? [];
            $hidden = $properties['hidden'] ?? [];
            $appends = $properties['appends'] ?? [];
            $guarded = $properties['guarded'] ?? [];

            $allMethods = $reflection->getMethods();
            $allTraitNames = $reflection->getTraitNames();
            $extendsClass = $reflection->getParentClass();
            $classMethods = collect($allMethods)->filter(function ($method) use ($model) {
                return $method->getFileName() == $model['fullPath'];
            });

            $methods = [];
            $relationships = [];

            foreach ($classMethods as $method) {
                $fileContent = file_get_contents($method->getFileName());
                
                $methodContent = '';
                $lines = preg_split("/\r\n|\n|\r/", $fileContent);
                for ($i = $method->getStartLine() - 1; $i < $method->getEndLine(); $i++) {
                    $methodContent .= $lines[$i] . PHP_EOL;
                }

                if (preg_match('/return \$this->(hasOne|hasMany|belongsTo|belongsToMany|hasOneThrough|hasManyThrough|morphOne|morphMany|morphToMany|through)/', $methodContent)) {
                    $return = $method->invoke(new $model['class']);
                    
                    if ($return instanceof Relation) {
                        $relationships[] = [
                            'name' => $method->getName(),
                            'type' => (new ReflectionClass($return))->getShortName(),

                            // BelongsTo, HasMany e HasOne
                            'foreignKeyName' => method_exists($return, 'getForeignKeyName') ? $return->getForeignKeyName() : null,
                            'ownerKeyName' => method_exists($return, 'getOwnerKeyName') ? $return->getOwnerKeyName() : null,

                            // BelongsToMany
                            'foreignPivotKeyName' => method_exists($return, 'getForeignPivotKeyName') ? $return->getForeignPivotKeyName() : null,
                            'relatedPivotKeyName' => method_exists($return, 'getRelatedPivotKeyName') ? $return->getRelatedPivotKeyName() : null,
                            'parentKeyName' => method_exists($return, 'getParentKeyName') ? $return->getParentKeyName() : null,
                            'relatedKeyName' => method_exists($return, 'getRelatedKeyName') ? $return->getRelatedKeyName() : null,
                            'pivotTableName' => method_exists($return, 'getTable') ? $return->getTable() : null,

                            // Morphs
                            'morphType' => method_exists($return, 'getMorphType') ? $return->getMorphType() : null,
                            # foreignKeyName
                            'localKeyName' => method_exists($return, 'getLocalKeyName') ? $return->getLocalKeyName() : null,

                            // Has Many Through
                            'firstKeyName' => method_exists($return, 'getFirstKeyName') ? $return->getFirstKeyName() : null,
                            'secondKeyName' => method_exists($return, 'getSecondKeyName') ? $return->getSecondKeyName() : null,

                            'relatedTableName' => $return->getRelated()->getTable(),
                            'relatedModelName' => $return->getRelated()->getMorphClass(),
                            'parentTableName' => $return->getParent()->getTable(),
                            'parentModelName' => $return->getParent()->getMorphClass(),

                            'relatedKeyName' => method_exists($return, 'getRelatedKeyName') ? $return->getRelatedKeyName() : null,
                            'method' => $methodContent,

                            'withPivotColumns' => str_contains($methodContent, '->withPivot'),
                            'includedPivotColumns' => method_exists($return, 'getPivotColumns') ? $return->getPivotColumns() : [],
                        ];
                    }
                } else {
                    // After Laravel 11, the casts is a method and not a property
                    if($method->getName() === 'casts') {
                        $casts = $method->invoke(new $model['class']);
                    } else {
                        $methods[] = [
                            'name' => $method->getName(),
                            'content' => $methodContent,
                        ];
                    }
                }
            }

            $hasProperty = function($visibility, $name) use ($model) {
                if(! File::exists($model['fullPath'])) return false;

                // TODO: use $model['fileContent']
                $fileContent = file_get_contents($model['fullPath']);

                if(empty($fileContent)) return false;

                preg_match(
                    '/^((?:\/\*(?:[^*]|\*(?!\/))*\*\/|\/\/.*|#.*)*\s*' . $visibility . '\s+\$' . $name . '\s*=\s*[^;]+;)/sm',
                    $fileContent,
                    $matches
                );

                return !empty($matches);
            };

            $formattedModels[] = [
                'fileName' => $model['fileName'],
                'name' => str_replace('.php', '', $model['fileName']),
                'tableName' => (new $model['class'])->getTable(),
                'class' => $model['class'],
                'namespace' => $reflection->getNamespaceName(),
                'path' => $model['path'],
                'allImports' => $allImports,
                'parentClass' => $this->buildImportStatement($model, $parentClass),
                'interfaces' => $interfaces,
                'traits' => $traits,
                'hasFillable' => $hasProperty('protected', 'fillable'),
                'fillable' => $fillable,
                'hasCasts' => !empty($casts) || $hasProperty('protected', 'casts'),
                'casts' => $casts,
                'hasGuarded' => $hasProperty('protected', 'guarded'),
                'guarded' => $guarded,
                'hasHidden' => $hasProperty('protected', 'hidden'),
                'hidden' => $hidden,
                'hasDates' => $hasProperty('protected', 'dates'),
                'dates' => $dates,
                'hasAppends' => $hasProperty('protected', 'appends'),
                'appends' => $appends,
                'relationships' => $relationships,
                'methods' => $methods,
                'hasTimestamps' => $properties['timestamps'] ?? true,
                'hasSoftDeletes' => in_array('Illuminate\Database\Eloquent\SoftDeletes', $allTraitNames),
                'isAuthenticatable' => $extendsClass ? $extendsClass->name === 'Illuminate\Foundation\Auth\User' : false,
            ];
        }

        return $formattedModels;
    }

    public function buildImportStatement(array $modelData, $import)
    {
        $importData = $this->getImportData($modelData, $import);

        return $this->buildImportStatementFromData($importData);
    }

    public function buildImportStatementFromData($importData)
    {
        if($importData['name'] === $importData['alias']) {
            return $importData['import'];
        }
        
        return sprintf("%s as %s", $importData['import'], $importData['alias']);
    }

    public function getImportData(array $modelData, $import) {
        return [
            'import' => $import->name,
            'name' => $import->getShortName(),
            'alias' => $this->getAlias($modelData['fileContent'], $import),
        ];
    }

    public function getAlias(string $classContent, $import) {
        $useStatement = $import->name;
        $alias = $import->getShortName();
    
        // Regex to find the use statement for the specified class/interface/trait
        $pattern = '/use\s+' . preg_quote($useStatement, '/') . '\s*(?:as\s+(.*?))?\s*;/';
        preg_match($pattern, $classContent, $matches);
    
        if (!empty($matches)) {
            // If an alias is defined, use it; otherwise, use the last part of the use statement (class/interface/trait name)
            $alias = isset($matches[1]) ? $matches[1] : basename(str_replace('\\', '/', $useStatement));
        }
    
        return $alias;
    }

    public function getAllImports($model)
    {
        $fileContent = $model['fileContent'];

        preg_match_all('/use\s+([^\s;]+(?:\s+as\s+[^\s;]+)?)\s*;/m', $fileContent, $matches);

        return collect($matches[1])->map(function ($import) {
            $alias = null;

            // remove the "use" keyword and the semicolon
            $import = str_replace(['use ', ';'], '', $import);
            $import = trim($import);

            // split the import by \ to get the class name
            $importSections = explode('\\', $import);
            $name = end($importSections);
            $name = str_contains($name, ' as ') ? explode(' as ', $name)[1] : $name;

            // if the import has the "as" keyword, we need to get the alias
            if (str_contains($import, ' as ')) {
                $aliasSections = explode(' as ', $import);
                $alias = end($aliasSections);
            } else {
                $alias = $name;
            }

            return [
                'import' => $import,
                'name' => $name,
                'alias' => $alias,
            ];
        })->values()->toArray();
    }

    /**
     * Get all models from the application
     * Based on the code by @mohammad425 
     * https://gist.github.com/mohammad425/231242958edb640601108bdea7bcf9ac
     * @return array
     */
    public function get() {
        $composerPath = $this->projectPath . DIRECTORY_SEPARATOR . 'composer.json';

        $composerData = json_decode(
            file_get_contents($composerPath), 
            true
        );

        $models = [];
        
        foreach ((array) data_get($composerData, 'autoload.psr-4') as $namespace => $path) {
            $finalPath = $this->projectPath . DIRECTORY_SEPARATOR . $path;

            $models = array_merge(collect(File::allFiles($finalPath))
                ->map(function ($item) use ($namespace) {
                    $path = $item->getRelativePathName();
                    
                    $class = sprintf('%s%s',
                        $namespace,
                        strtr(substr($path, 0, strrpos($path, '.')), '/', '\\')
                    );

                    return [
                        'class' => $class,
                        'path' => $path,
                        'fullPath' => $item->getPathname(),
                        'fileName' => $item->getFilename(),
                        'fileContent' => file_get_contents($item->getPathname()),
                    ];
                })
                ->filter(function ($classData) {
                    \Vemto\Vemto::dump($classData['class']);

                    require_once $classData['fullPath'];

                    $valid = false;

                    if (class_exists($classData['class'])) {
                        $reflection = new \ReflectionClass($classData['class']);

                        $isModel = $reflection->isSubclassOf(\Illuminate\Database\Eloquent\Model::class);
                        $isAbstract = $reflection->isAbstract();

                        $valid = $isModel && !$isAbstract;
                    }

                    return $valid;
                })
                ->values()
                ->toArray(), $models);
        }

        return $models;
    }
} 