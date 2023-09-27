<?php

$config = new PhpCsFixer\Config();
return $config->setRules([
        '@PSR12' => true, // This applies the PSR-12 coding standard
        'ordered_class_elements' => [
            'order' => [
                'use_trait',
                'constant_public',
                'constant_protected',
                'constant_private',
                'property_public_static',
                'property_protected_static',
                'property_private_static',
                'property_public',
                'property_protected',
                'property_private',
                'method_public_static',
                'method_protected_static',
                'method_private_static',
                'construct',
                'destruct',
                'method_public',
                'method_protected',
                'method_private',
            ]
        ],
        'class_attributes_separation' => [
            'elements' => [
                'const' => 'one',
                'method' => 'one',
                'property' => 'one'
            ]
        ],
    ])
    ->setFinder(
        PhpCsFixer\Finder::create()
            ->in(__DIR__)
            ->name('*.php')
    );