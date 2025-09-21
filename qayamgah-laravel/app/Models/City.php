<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'slug',
        'image',
        'hero_image',
        'latitude',
        'longitude',
        'property_count',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'property_count' => 'integer',
        ];
    }

    /**
     * Properties in this city
     */
    public function properties(): HasMany
    {
        return $this->hasMany(Property::class, 'city_id');
    }
}
