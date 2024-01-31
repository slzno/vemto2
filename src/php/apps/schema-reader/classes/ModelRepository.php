<?php

use Illuminate\Support\Facades\File;
use Illuminate\Database\Eloquent\Relations\Relation;

class ModelRepository {
    protected $models = [];
    
    public static function getModelsFormatted() {
        $models = self::getModels();

        $formattedModels = [];

        foreach ($models as $model) {
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
                return self::buildImportStatement($model, $interface);
            })->values()->toArray();

            // get the model traits
            $traits = collect($reflection->getTraits())->map(function ($trait) use ($model) {
                return self::buildImportStatement($model, $trait);
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
                'parentClass' => self::buildImportStatement($model, $parentClass),
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

    public static function buildImportStatement(array $modelData, $import)
    {
        $importData = self::getImportData($modelData, $import);

        if($importData['name'] === $importData['alias']) {
            return $importData['import'];
        }
        
        return sprintf("%s as %s", $importData['import'], $importData['alias']);
    }

    public static function getImportData(array $modelData, $import) {
        return [
            'import' => $import->name,
            'name' => $import->getShortName(),
            'alias' => self::getAlias($modelData['fileContent'], $import),
        ];
    }

    public static function getAlias(string $classContent, $import) {
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

    public static function getModels() {
        // Based on the code by @mohammad425 (https://gist.github.com/mohammad425/231242958edb640601108bdea7bcf9ac)
        $composerData = json_decode(
            file_get_contents(base_path('composer.json')), 
            true
        );

        $models = [];
        
        foreach ((array) data_get($composerData, 'autoload.psr-4') as $namespace => $path) {
            $models = array_merge(collect(File::allFiles(base_path($path)))
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