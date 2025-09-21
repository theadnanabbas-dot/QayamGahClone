<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ImportedCalendar extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'name',
        'source_url',
        'platform',
        'is_active',
        'last_sync_at',
        'last_sync_status',
        'sync_error_message',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_sync_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    /**
     * User who owns this imported calendar
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Events imported from this calendar
     */
    public function importedEvents(): HasMany
    {
        return $this->hasMany(ImportedEvent::class, 'imported_calendar_id');
    }
}
