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
        Schema::create('blogs', function (Blueprint $table) {
            $table->string('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->text('title')->notNull();
            $table->text('slug')->unique()->notNull();
            $table->text('excerpt')->notNull();
            $table->text('content')->notNull();
            $table->text('image')->notNull();
            $table->timestamp('published_at')->notNull()->default(DB::raw('now()'));
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
