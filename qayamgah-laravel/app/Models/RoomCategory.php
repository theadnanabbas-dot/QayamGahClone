<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomCategory extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'property_id',
        'name',
        'image',
        'max_guest_capacity',
        'bathrooms',
        'beds',
        'area_sq_ft',
        'price_per_4_hours',
        'price_per_6_hours',
        'price_per_12_hours',
        'price_per_24_hours',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'max_guest_capacity' => 'integer',
            'bathrooms' => 'integer',
            'beds' => 'integer',
            'area_sq_ft' => 'integer',
            'price_per_4_hours' => 'decimal:2',
            'price_per_6_hours' => 'decimal:2',
            'price_per_12_hours' => 'decimal:2',
            'price_per_24_hours' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Property that this room category belongs to
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    /**
     * Bookings for this room category
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'room_category_id');
    }
}
