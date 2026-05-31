<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Materi extends Model
{
    protected $table = 'materi';
    
    protected $fillable = [
        'user_id',
        'title',
        'file_path',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(Pengguna::class);
    }

    public function ujian()
    {
        return $this->hasMany(Ujian::class, 'materi_id');
    }
}
