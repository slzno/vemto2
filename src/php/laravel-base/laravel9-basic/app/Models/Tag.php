<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $guarded = [];

    public $timestamps = false;

    public function posts()
    {
        return $this->belongsToMany(Post::class);
    }

    public function users()
    {
        return $this->hasManyThrough(User::class, Post::class);
    }

    public function taggeable()
    {
        return $this->morphTo();
    }
}
