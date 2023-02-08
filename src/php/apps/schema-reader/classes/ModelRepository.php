<?php

use Illuminate\Support\Facades\File;

class ModelRepository {
    protected $models = [];
    
    public static function getModelsFormatted() {
        $models = self::getModels();

        $formattedModels = [];

        foreach ($models as $model) {
            // use reflection to get the class properties
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

            $modelInstance = new $model['class'];
            Vemto::dump($modelInstance);
            Vemto::dump($modelInstance->getRelations());

            foreach ($classMethods as $method) {
                $fileContent = file_get_contents($method->getFileName());
                
                $methodContent = '';
                $lines = preg_split("/\r\n|\n|\r/", $fileContent);
                for ($i = $method->getStartLine() - 1; $i < $method->getEndLine(); $i++) {
                    $methodContent .= $lines[$i] . PHP_EOL;
                }

                Vemto::dump($methodContent);

                if (preg_match('/return \$this->(hasOne|hasMany|belongsTo|belongsToMany|hasOneThrough|hasManyThrough|morphOne|morphTo|morphToMany)\(/', $methodContent)) {
                    $relationshipType = null;
                    
                    if (preg_match('/return \$this->hasOne\(/', $methodContent)) {
                        $relationshipType = 'hasOne';
                    } else if (preg_match('/return \$this->hasMany\(/', $methodContent)) {
                        $relationshipType = 'hasMany';
                    } else if (preg_match('/return \$this->belongsTo\(/', $methodContent)) {
                        $relationshipType = 'belongsTo';
                    } else if (preg_match('/return \$this->belongsToMany\(/', $methodContent)) {
                        $relationshipType = 'belongsToMany';
                    }

                    // TODO: add the rest of the relationship types

                    $relationships[] = [
                        'name' => $method->getName(),
                        'type' => $relationshipType
                    ];
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
                // 'scopes' => $scopes,
                // 'accessors' => $accessors,
                // 'mutators' => $mutators,
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