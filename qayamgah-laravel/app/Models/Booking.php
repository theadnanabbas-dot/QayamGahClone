<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'room_category_id',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'guests',
        'stay_type',
        'start_at',
        'end_at',
        'currency',
        'payment_method',
    ];

    /**
     * The attributes that are not mass assignable.
     */
    protected $guarded = [
        'total_price', // Server-calculated, prevent tampering
        'status', // Server-controlled status
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'guests' => 'integer',
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'total_price' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Room category that this booking is for
     */
    public function roomCategory(): BelongsTo
    {
        return $this->belongsTo(RoomCategory::class, 'room_category_id');
    }

    /**
     * User who made this booking
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
