<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PropertyCategory extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'image',
        'slug',
    ];

    /**
     * Properties in this category
     */
    public function properties(): HasMany
    {
        return $this->hasMany(Property::class, 'category_id');
    }
}
