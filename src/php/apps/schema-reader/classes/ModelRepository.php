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

            $relationships = [];
            $methods = [];

            $allMethods = $reflection->getMethods();
            $classMethods = collect($allMethods)->filter(function ($method) use ($model) {
                // Vemto::dump($method->getFileName());
                // Vemto::dump($model);

                return $method->getFileName() == $model['fullPath'];
            });

            $formattedModels[] = [
                'name' => $model['class'],
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