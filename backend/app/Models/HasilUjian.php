<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HasilUjian extends Model
{
    protected $table = 'hasil_ujian';
    
    protected $fillable = [
        'ujian_id',
        'user_id',
        'skor',
        'jawaban',
        'selesai_at'
    ];

    protected $casts = [
        'jawaban' => 'array',
        'selesai_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(Pengguna::class);
    }

    public function ujian()
    {
        return $this->belongsTo(Ujian::class);
    }
}
