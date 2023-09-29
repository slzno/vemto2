<?php

namespace App\Models;

use Test\TestClass;
use App\Models\Searchable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

// test

class User extends Model
{
    use HasFactory;
    use TestClass;
    use Searchable;

    const INFO = 'info';

    public $table = 'users';
    protected $fillable = ['name', 'email', 'password', 'nickname'];

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

    // removed_method:vehicles
}