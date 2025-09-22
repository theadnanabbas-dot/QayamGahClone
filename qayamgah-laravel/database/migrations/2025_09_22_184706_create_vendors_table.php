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
        Schema::create('vendors', function (Blueprint $table) {
            $table->string('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('user_id')->notNull();
            $table->text('first_name')->notNull();
            $table->text('last_name')->notNull();
            $table->text('phone_no_1')->notNull();
            $table->text('phone_no_2')->nullable();
            $table->text('cnic')->notNull();
            $table->text('address')->notNull();
            $table->text('city')->notNull();
            $table->text('country')->notNull()->default('Pakistan');
            $table->text('status')->notNull()->default('pending'); // pending, approved, rejected
            $table->timestamp('created_at')->notNull()->default(DB::raw('now()'));
            $table->timestamp('approved_at')->nullable();
            
            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
