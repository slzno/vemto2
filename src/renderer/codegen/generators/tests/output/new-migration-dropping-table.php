<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('users');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->string('name', 255)->index();

            $table->string('last_name', 255);

            $table
                ->string('avatar_renamed', 255)
                ->default('avatar')
                ->nullable();

            $table->string('email', 255)->unique();

            $table->timestamp('email_verified_at')->nullable();

            $table->string('password', 255);

            $table->string('remember_token', 100)->nullable();

            $table->timestamp('created_at')->nullable();

            $table->timestamp('updated_at')->nullable();

            $table->index('name');
        });
    }
};
