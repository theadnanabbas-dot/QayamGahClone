<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vendor extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'phone_no_1',
        'phone_no_2',
        'cnic',
        'address',
        'city',
        'country',
    ];

    /**
     * The attributes that are not mass assignable.
     */
    protected $guarded = [
        'status', // Admin-controlled approval status
        'approved_at', // Admin-controlled approval timestamp
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * User associated with this vendor profile
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
