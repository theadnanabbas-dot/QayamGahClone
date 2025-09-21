<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportedEvent extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'imported_calendar_id',
        'external_id',
        'summary',
        'description',
        'start_at',
        'end_at',
        'is_all_day',
        'location',
        'organizer',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'is_all_day' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Imported calendar that this event belongs to
     */
    public function importedCalendar(): BelongsTo
    {
        return $this->belongsTo(ImportedCalendar::class, 'imported_calendar_id');
    }
}
