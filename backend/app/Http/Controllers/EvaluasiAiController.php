<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EvaluasiAiController extends Controller
{
    // Simpan evaluasi dari guru
    public function store(Request $request)
    {
        $request->validate([
            'ujian_id' => 'required|exists:ujian,id',
            'q1' => 'required|integer|min:1|max:5',
            'q2' => 'required|integer|min:1|max:5',
            'q3' => 'required|integer|min:1|max:5',
            'q4' => 'required|integer|min:1|max:5',
            'q5' => 'required|integer|min:1|max:5',
            'q6' => 'required|integer|min:1|max:5',
            'komentar' => 'nullable|string'
        ]);

        $eval = \App\Models\EvaluasiAi::create([
            'ujian_id' => $request->ujian_id,
            'user_id' => $request->user()->id,
            'q1' => $request->q1,
            'q2' => $request->q2,
            'q3' => $request->q3,
            'q4' => $request->q4,
            'q5' => $request->q5,
            'q6' => $request->q6,
            'komentar' => $request->komentar
        ]);

        return response()->json([
            'message' => 'Terima kasih, evaluasi Anda berhasil disimpan.',
            'data' => $eval
        ], 201);
    }

    // Ambil rata-rata statistik evaluasi
    public function stats()
    {
        $stats = \App\Models\EvaluasiAi::selectRaw('
            AVG(q1) as avg_q1,
            AVG(q2) as avg_q2,
            AVG(q3) as avg_q3,
            AVG(q4) as avg_q4,
            AVG(q5) as avg_q5,
            AVG(q6) as avg_q6,
            COUNT(id) as total_responses
        ')->first();

        return response()->json($stats);
    }
}
