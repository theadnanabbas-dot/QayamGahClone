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
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('user_id');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone_no_1');
            $table->string('phone_no_2')->nullable();
            $table->string('cnic');
            $table->text('address');
            $table->string('city');
            $table->string('country')->default('Pakistan');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->timestamp('created_at')->default(DB::raw('now()'));
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
