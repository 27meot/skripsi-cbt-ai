<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluasiAi extends Model
{
    use HasFactory;

    protected $table = 'evaluasi_ai';

    protected $fillable = [
        'ujian_id',
        'user_id',
        'q1',
        'q2',
        'q3',
        'q4',
        'q5',
        'q6',
        'komentar'
    ];

    public function ujian()
    {
        return $this->belongsTo(Ujian::class);
    }

    public function user()
    {
        return $this->belongsTo(Pengguna::class);
    }
}
