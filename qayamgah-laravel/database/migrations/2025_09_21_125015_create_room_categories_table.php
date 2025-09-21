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
            $table->string('property_id');
            $table->text('name');
            $table->text('image');
            $table->integer('max_guest_capacity');
            $table->integer('bathrooms');
            $table->integer('beds');
            $table->integer('area_sq_ft')->nullable();
            $table->decimal('price_per_4_hours', 10, 2);
            $table->decimal('price_per_6_hours', 10, 2);
            $table->decimal('price_per_12_hours', 10, 2);
            $table->decimal('price_per_24_hours', 10, 2);
            $table->timestamp('created_at')->default(DB::raw('now()'));
            
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
