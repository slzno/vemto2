<?php

namespace VemtoDBReader;

use KitLoong\MigrationsGenerator\Schema\Models\Column as SchemaColumn;

class Column {
    public string $name;
    public string $type;
    public string|NULL $total;
    public string|NULL $length;
    public string|NULL $places;
    public string|NULL $default;
    public bool $index;
    public bool $unique;
    public bool $nullable;
    public bool $unsigned;
    public bool $autoIncrement;
    
    public static function fromSchemaColumn(SchemaColumn $column): Column
    {
        $newColumn = new Column;
        $newColumn->name = $column->getName();
        $newColumn->length = $column->getLength();
        $newColumn->nullable = (bool) $column->isNotNull() ? false : true;
        $newColumn->unsigned = (bool) $column->isUnsigned();
        $newColumn->autoIncrement = (bool) $column->isAutoincrement();
        $newColumn->type = $column->getType()->value;
        $newColumn->index = false;
        $newColumn->unique = false;
        $newColumn->default = $column->getDefault();
        $newColumn->total = null;
        $newColumn->places = null;

        return $newColumn;
    }
}