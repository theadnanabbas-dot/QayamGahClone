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
            $table->string('room_category_id')->notNull();
            $table->string('user_id')->nullable();
            $table->text('customer_name')->notNull();
            $table->text('customer_email')->notNull();
            $table->text('customer_phone')->nullable();
            $table->integer('guests')->notNull();
            $table->text('stay_type')->notNull(); // 4h, 6h, 12h, 24h
            $table->timestamp('start_at')->notNull();
            $table->timestamp('end_at')->notNull();
            $table->text('currency')->notNull()->default('PKR');
            $table->text('payment_method')->notNull();
            $table->decimal('total_price', 10, 2)->notNull();
            $table->text('status')->notNull()->default('PENDING'); // PENDING, CONFIRMED, CANCELLED, COMPLETED
            $table->timestamp('created_at')->notNull()->default(DB::raw('now()'));
            
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
