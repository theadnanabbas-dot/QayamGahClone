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
            $table->string('user_id');
            $table->text('first_name');
            $table->text('last_name');
            $table->text('phone_no_1');
            $table->text('phone_no_2')->nullable();
            $table->text('cnic');
            $table->text('address');
            $table->text('city');
            $table->text('country')->default('Pakistan');
            $table->text('status')->default('pending'); // pending, approved, rejected
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
