<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // tests table
        Schema::rename('tests', 'test');
        Schema::rename('test', 'tests');
        Schema::rename('tests', 'tests_renamed');
        Schema::rename('tests_renamed', 'new_tests');
        Schema::rename('new_tests', 'tests');

        // posts table
        Schema::rename('posts', 'post');
        Schema::rename('post', 'posts');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //   
    }
};
