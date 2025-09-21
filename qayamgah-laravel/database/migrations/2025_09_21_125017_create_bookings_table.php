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
        Schema::create('bookings', function (Blueprint $table) {
            $table->string('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('room_category_id');
            $table->string('user_id');
            $table->text('customer_name');
            $table->text('customer_email');
            $table->text('customer_phone')->nullable();
            $table->integer('guests')->default(1);
            $table->text('stay_type'); // 4h, 6h, 12h, 24h
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->decimal('total_price', 10, 2);
            $table->text('currency')->default('PKR');
            $table->text('payment_method')->default('cash');
            $table->text('status')->default('PENDING');
            $table->timestamp('created_at')->default(DB::raw('now()'));
            
            // Foreign key constraints
            $table->foreign('room_category_id')->references('id')->on('room_categories');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
