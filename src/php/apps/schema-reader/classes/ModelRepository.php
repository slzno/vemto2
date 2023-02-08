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

                Vemto::dump($methodContent);

                if (preg_match('/return \$this->(hasOne|hasMany|belongsTo|belongsToMany|hasOneThrough|hasManyThrough|morphOne|morphTo|morphToMany|through)/', $methodContent)) {
                    $return = $method->invoke(new $model['class']);
                    
                    if ($return instanceof Relation) {
                        $relationships[] = [
                            'name' => $method->getName(),
                            'type' => (new ReflectionClass($return))->getShortName(),
                            'relatedTable' => $return->getRelated()->getTable(),
                            'relatedModel' => $return->getRelated()->getMorphClass(),
                            'parentModel' => $return->getParent()->getMorphClass(),
                            'foreignKey' => method_exists($return, 'getForeignKeyName') ? $return->getForeignKeyName() : null,
                            'localKey' => method_exists($return, 'getLocalKeyName') ? $return->getLocalKeyName() : null,
                            'ownerKey' => method_exists($return, 'getOwnerKeyName') ? $return->getOwnerKeyName() : null,
                            'relatedKey' => method_exists($return, 'getRelatedKeyName') ? $return->getRelatedKeyName() : null,
                            'morphType' => method_exists($return, 'getMorphType') ? $return->getMorphType() : null,
                            'method' => $methodContent,
                        ];
                    }
                }
            }

            $formattedModels[] = [
                'name' => $model['name'],
                'class' => $model['class'],
                'path' => $model['path'],
                'fillable' => $fillable,
                'casts' => $casts,
                'dates' => $dates,
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
                        'name' => $item->getFilename(),
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