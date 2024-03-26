<?php

namespace VemtoDBReader;

use KitLoong\MigrationsGenerator\Schema\Models\Column as SchemaColumn;

class Column {
    
    public string $name;
    public string $type;
    public ?string $total;
    public ?string $length;
    public ?string $places;
    public ?string $default;
    public ?string $comment;
    public ?int $precision;
    public ?int $order;
    public bool $index;
    public bool $unique;
    public bool $nullable;
    public bool $unsigned;
    public bool $autoIncrement;
    public bool $isRawDefault;
    
    public static function fromSchemaColumn(SchemaColumn $column, int $order = 0): Column
    {
        $newColumn = new Column;
        $newColumn->order = $order;
        $newColumn->name = $column->getName();
        $newColumn->length = $column->getLength();
        $newColumn->nullable = (bool) $column->isNotNull() ? false : true;
        $newColumn->unsigned = (bool) $column->isUnsigned();
        $newColumn->autoIncrement = (bool) $column->isAutoincrement();
        $newColumn->type = $column->getType()->value;
        $newColumn->comment = $column->getComment();
        $newColumn->precision = $column->getPrecision();
        $newColumn->isRawDefault = $column->isRawDefault();
        $newColumn->index = false;
        $newColumn->unique = false;
        $newColumn->default = $column->getDefault();
        $newColumn->total = null;
        $newColumn->places = null;

        $newColumn->fixAliasType();

        return $newColumn;
    }

    public function isAutoIncrement(): bool
    {
        return !! $this->autoIncrement;
    }

    public function setUnsigned(bool $isUnsigned = false) {
        $this->unsigned = $isUnsigned;
    }

    public function setIndex(bool $isIndex = false) {
        $this->index = $isIndex;
    }

    public function setUnique(bool $isUnique = false) {
        $this->unique = $isUnique;
    }

    public function setDefault(string $default = null) {
        $this->default = $default;
    }

    public function setNullable(bool $isNullable = false) {
        $this->nullable = $isNullable;
    }

    public function setTotal(string $total = null) {
        $this->total = $total;
    }

    public function setPlaces(string $places = null) {
        $this->places = $places;
    }

    public function fixAliasType() {
        if($this->type === 'increments') {
            $this->type = 'integer';
            $this->unsigned = true;
            $this->autoIncrement = true;
        }

        if($this->type === 'bigIncrements' ||$this->type === 'id') {
            $this->type = 'bigInteger';
            $this->unsigned = true;
            $this->autoIncrement = true;
        }

        if($this->type === 'tinyIncrements') {
            $this->type = 'tinyInteger';
            $this->unsigned = true;
            $this->autoIncrement = true;
        }

        if($this->type === 'smallIncrements') {
            $this->type = 'smallInteger';
            $this->unsigned = true;
            $this->autoIncrement = true;
        }

        if($this->type === 'mediumIncrements') {
            $this->type = 'mediumInteger';
            $this->unsigned = true;
            $this->autoIncrement = true;
        }

        if($this->type === 'rememberToken') {
            $this->type = 'string';
        }

        if($this->type === 'ipAddress') {
            $this->type = 'string';
        }

        if($this->type === 'macAddress') {
            $this->type = 'string';
        }

        if($this->type === 'softDeletes') {
            $this->type = 'timestamp';
        }

        if($this->type === 'softDeletesTz') {
            $this->type = 'timestampTz';
        }

        if($this->type === 'unsignedBigInteger') {
            $this->type = 'bigInteger';
            $this->unsigned = true;
        }

        if($this->type === 'unsignedInteger') {
            $this->type = 'integer';
            $this->unsigned = true;
        }

        if($this->type === 'unsignedMediumInteger') {
            $this->type = 'mediumInteger';
            $this->unsigned = true;
        }

        if($this->type === 'unsignedSmallInteger') {
            $this->type = 'smallInteger';
            $this->unsigned = true;
        }

        if($this->type === 'unsignedTinyInteger') {
            $this->type = 'tinyInteger';
            $this->unsigned = true;
        }
    }
}