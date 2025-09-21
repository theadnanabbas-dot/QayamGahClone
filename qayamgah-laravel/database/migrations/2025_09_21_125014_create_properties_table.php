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
        Schema::create('properties', function (Blueprint $table) {
            $table->string('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->text('title');
            $table->text('slug')->unique();
            $table->text('description')->nullable();
            $table->text('property_type')->default('private'); // commercial or private
            $table->integer('max_guests')->default(1);
            $table->text('address');
            $table->text('phone_number')->nullable();
            $table->integer('room_categories_count')->default(1);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('city_id')->nullable();
            $table->string('category_id')->nullable();
            $table->string('owner_id')->nullable();
            $table->integer('bedrooms')->default(0);
            $table->integer('bathrooms')->default(0);
            $table->text('main_image');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->decimal('rating', 3, 2)->default('0.00');
            $table->timestamp('created_at')->default(DB::raw('now()'));
            
            // Foreign key constraints
            $table->foreign('city_id')->references('id')->on('cities');
            $table->foreign('category_id')->references('id')->on('property_categories');
            $table->foreign('owner_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
