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
            $properties = $reflection->getDefaultProperties();

            $fillable = $properties['fillable'] ?? [];
            $casts = $properties['casts'] ?? [];
            $dates = $properties['dates'] ?? [];
            $hidden = $properties['hidden'] ?? [];
            $appends = $properties['appends'] ?? [];
            $guarded = $properties['guarded'] ?? [];

            $allMethods = $reflection->getMethods();
            $classMethods = collect($allMethods)->filter(function ($method) use ($model) {
                return $method->getFileName() == $model['fullPath'];
            });

            $relationships = [];

            foreach ($classMethods as $method) {
                $fileContent = file_get_contents($method->getFileName());
                
                $methodContent = '';
                $lines = preg_split("/\r\n|\n|\r/", $fileContent);
                for ($i = $method->getStartLine() - 1; $i < $method->getEndLine(); $i++) {
                    $methodContent .= $lines[$i] . PHP_EOL;
                }

                if (preg_match('/return \$this->(hasOne|hasMany|belongsTo|belongsToMany|hasOneThrough|hasManyThrough|morphOne|morphTo|morphToMany|through)/', $methodContent)) {
                    $return = $method->invoke(new $model['class']);
                    
                    if ($return instanceof Relation) {
                        $relationships[] = [
                            'name' => $method->getName(),
                            'type' => (new ReflectionClass($return))->getShortName(),
                            'relatedTableName' => $return->getRelated()->getTable(),
                            'relatedModelName' => $return->getRelated()->getMorphClass(),
                            'parentTableName' => $return->getParent()->getTable(),
                            'parentModelName' => $return->getParent()->getMorphClass(),
                            'foreignKeyName' => method_exists($return, 'getForeignKeyName') ? $return->getForeignKeyName() : null,
                            'localKeyName' => method_exists($return, 'getLocalKeyName') ? $return->getLocalKeyName() : null,
                            'ownerKeyName' => method_exists($return, 'getOwnerKeyName') ? $return->getOwnerKeyName() : null,
                            'relatedKeyName' => method_exists($return, 'getRelatedKeyName') ? $return->getRelatedKeyName() : null,
                            'morphType' => method_exists($return, 'getMorphType') ? $return->getMorphType() : null,
                            'method' => $methodContent,
                        ];
                    }
                }
            }

            $formattedModels[] = [
                'fileName' => $model['fileName'],
                'name' => str_replace('.php', '', $model['fileName']),
                'tableName' => (new $model['class'])->getTable(),
                'class' => $model['class'],
                'namespace' => $reflection->getNamespaceName(),
                'path' => $model['path'],
                'hasFillable' => !empty($fillable),
                'fillable' => $fillable,
                'casts' => $casts,
                'dates' => $dates,
                'hasGuarded' => !empty($guarded),
                'guarded' => $guarded,
                'hasHidden' => !empty($hidden),
                'hidden' => $hidden,
                'appends' => $appends,
                'relationships' => $relationships,
                'methods' => $classMethods,
            ];
        }

        return $formattedModels;
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