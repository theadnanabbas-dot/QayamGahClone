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
        Schema::create('room_categories', function (Blueprint $table) {
            $table->string('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('property_id')->notNull();
            $table->text('name')->notNull();
            $table->text('image')->notNull();
            $table->integer('max_guest_capacity')->notNull();
            $table->integer('bathrooms')->notNull();
            $table->integer('beds')->notNull();
            $table->integer('area_sq_ft')->nullable(); // Optional area in square feet
            $table->decimal('price_per_4_hours', 10, 2)->notNull();
            $table->decimal('price_per_6_hours', 10, 2)->notNull();
            $table->decimal('price_per_12_hours', 10, 2)->notNull();
            $table->decimal('price_per_24_hours', 10, 2)->notNull();
            $table->timestamp('created_at')->notNull()->default(DB::raw('now()'));
            
            // Foreign key constraint
            $table->foreign('property_id')->references('id')->on('properties');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_categories');
    }
};