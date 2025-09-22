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
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('avatar', 'avatar_renamed');

            $table
                ->bigInteger('id')
                ->unsigned()
                ->autoIncrement()
                ->change();

            $table
                ->string('name', 255)
                ->index()
                ->change();

            $table->string('last_name', 255)->change();

            $table
                ->string('avatar_renamed', 255)
                ->default('avatar')
                ->nullable()
                ->change();

            $table
                ->timestamp('email_verified_at')
                ->nullable()
                ->change();

            $table->string('password', 255)->change();

            $table
                ->string('remember_token', 100)
                ->nullable()
                ->change();

            $table
                ->timestamp('created_at')
                ->nullable()
                ->change();

            $table
                ->timestamp('updated_at')
                ->nullable()
                ->change();
            $table->dropColumn('email');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('avatar_renamed', 'avatar');

            $table
                ->bigInteger('id')
                ->unsigned()
                ->autoIncrement()
                ->change();

            $table
                ->string('name', 255)
                ->index()
                ->change();

            $table->string('last_name', 255)->change();

            $table
                ->string('avatar_renamed', 255)
                ->default('avatar')
                ->nullable()
                ->change();

            $table
                ->timestamp('email_verified_at')
                ->nullable()
                ->change();

            $table->string('password', 255)->change();

            $table
                ->string('remember_token', 100)
                ->nullable()
                ->change();

            $table
                ->timestamp('created_at')
                ->nullable()
                ->change();

            $table
                ->timestamp('updated_at')
                ->nullable()
                ->change();

            $table
                ->string('email', 255)
                ->unique()
                ->after('avatar_renamed');
        });
    }
};
