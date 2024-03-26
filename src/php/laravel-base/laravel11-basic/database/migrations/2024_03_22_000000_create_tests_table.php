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
        Schema::create('test', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('title')->index()->nullable();
            $table->ipAddress('visitor_ip');
            $table->macAddress('device_mac');
            $table->float('some_float', 8, 2);
            $table->decimal('some_decimal', 8, 2);
            $table->unsignedBigInteger('some_unsigned_big_int');
            $table->timestamps();
            $table->softDeletesTz('deleted_at', precision: 0);
        });

        // Rename table
        Schema::rename('test', 'tests');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tests');
    }
};
