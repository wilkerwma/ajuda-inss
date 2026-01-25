<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Cid10Code extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'cid10_codes';

    protected $fillable = [
        'cid_code',
        'description',
        'bpc_eligibility',
        'legal_notes',
        'embedding',
    ];

    protected $casts = [
        'bpc_eligibility' => 'boolean',
        'embedding' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
