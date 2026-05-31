<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ujian extends Model
{
    protected $table = 'ujian';
    
    protected $fillable = [
        'user_id',
        'materi_id',
        'title',
        'token',
        'durasi_menit',
        'difficulty',
        'ai_settings',
    ];

    protected $casts = [
        'ai_settings' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(Pengguna::class);
    }

    public function materi()
    {
        return $this->belongsTo(Materi::class, 'materi_id');
    }

    public function soal()
    {
        return $this->hasMany(Soal::class, 'ujian_id');
    }
}
