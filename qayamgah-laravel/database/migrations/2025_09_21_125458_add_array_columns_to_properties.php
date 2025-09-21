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
        Schema::table('properties', function (Blueprint $table) {
            // Add text array columns for amenities and images
            DB::statement('ALTER TABLE properties ADD COLUMN amenities text[] NOT NULL DEFAULT \'{}\'::text[]');
            DB::statement('ALTER TABLE properties ADD COLUMN images text[] NOT NULL DEFAULT \'{}\'::text[]');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['amenities', 'images']);
        });
    }
};
