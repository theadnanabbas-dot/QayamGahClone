<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'slug',
        'description',
        'property_type',
        'max_guests',
        'address',
        'phone_number',
        'room_categories_count',
        'latitude',
        'longitude',
        'city_id',
        'category_id',
        'owner_id',
        'bedrooms',
        'bathrooms',
        'amenities',
        'images',
        'main_image',
        'is_featured',
        'is_active',
        'rating',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'max_guests' => 'integer',
            'room_categories_count' => 'integer',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'bedrooms' => 'integer',
            'bathrooms' => 'integer',
            'amenities' => 'array',
            'images' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'rating' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    /**
     * City where this property is located
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    /**
     * Category of this property
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(PropertyCategory::class, 'category_id');
    }

    /**
     * Owner of this property
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Room categories for this property
     */
    public function roomCategories(): HasMany
    {
        return $this->hasMany(RoomCategory::class, 'property_id');
    }
}
