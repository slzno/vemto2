<?php

namespace App\Models;

use Test\TestClass;
use App\Models\Searchable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

// test

class User extends Model
{
    use HasFactory;
    use TestClass, Searchable;

    const INFO = 'info';

    public $table = 'users';

    public $timestamps = false;

    protected $guarded = [
        'id'
    ];

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function videos()
    {
        return $this->hasMany(Video::class);
    }

    public function companies()
    {
        return $this->hasMany(Company::class);
    }
}