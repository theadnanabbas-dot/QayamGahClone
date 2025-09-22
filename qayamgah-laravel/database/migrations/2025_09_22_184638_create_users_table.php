<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->string('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->text('username')->unique()->notNull();
            $table->text('email')->unique()->notNull();
            $table->text('password_hash')->notNull();
            $table->text('role')->notNull()->default('customer'); // admin, property_owner, customer
            $table->text('full_name')->nullable();
            $table->text('phone')->nullable();
            $table->boolean('is_active')->notNull()->default(true);
            $table->timestamp('created_at')->notNull()->default(DB::raw('now()'));
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};