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
            $table->text('title')->notNull();
            $table->text('slug')->unique()->notNull();
            $table->text('description')->nullable();
            $table->text('property_type')->notNull()->default('private'); // commercial or private
            $table->integer('max_guests')->notNull()->default(1);
            $table->text('address')->notNull();
            $table->text('phone_number')->nullable();
            $table->integer('room_categories_count')->notNull()->default(1);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('city_id')->nullable();
            $table->string('category_id')->nullable();
            $table->string('owner_id')->nullable();
            $table->integer('bedrooms')->notNull()->default(0);
            $table->integer('bathrooms')->notNull()->default(0);
            // Using JSON for array fields since Laravel doesn't support native Postgres arrays directly
            $table->json('amenities')->default('[]');
            $table->json('images')->default('[]');
            $table->text('main_image')->notNull();
            $table->boolean('is_featured')->notNull()->default(false);
            $table->boolean('is_active')->notNull()->default(true);
            $table->decimal('rating', 3, 2)->notNull()->default('0.00');
            $table->timestamp('created_at')->notNull()->default(DB::raw('now()'));
            
            // Foreign key constraints
            $table->foreign('city_id')->references('id')->on('cities');
            $table->foreign('category_id')->references('id')->on('property_categories');
            $table->foreign('owner_id')->references('id')->on('users');
        });
        
        // Convert JSON columns to native Postgres arrays after creation
        DB::statement('ALTER TABLE properties ALTER COLUMN amenities TYPE text[] USING CASE WHEN amenities IS NULL THEN ARRAY[]::text[] ELSE ARRAY(SELECT json_array_elements_text(amenities)) END');
        DB::statement('ALTER TABLE properties ALTER COLUMN images TYPE text[] USING CASE WHEN images IS NULL THEN ARRAY[]::text[] ELSE ARRAY(SELECT json_array_elements_text(images)) END');
        DB::statement('ALTER TABLE properties ALTER COLUMN amenities SET DEFAULT ARRAY[]::text[]');
        DB::statement('ALTER TABLE properties ALTER COLUMN images SET DEFAULT ARRAY[]::text[]');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};