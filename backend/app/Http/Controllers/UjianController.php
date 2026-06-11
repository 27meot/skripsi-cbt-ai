<?php

namespace App\Http\Controllers;

use App\Models\Ujian;
use App\Models\Materi;
use Illuminate\Http\Request;

class UjianController extends Controller
{
    // Ambil semua ujian untuk halaman Bank Soal
    public function index(Request $request)
    {
        $ujian = Ujian::where('user_id', $request->user()->id)
                    ->withCount('soal')
                    ->orderBy('created_at', 'desc')
                    ->get();
                    
        return response()->json($ujian);
    }

    // Simpan ujian baru
    public function store(Request $request)
    {
        $request->validate([
            'materi_id' => 'required|exists:materi,id',
            'title' => 'required|string|max:255',
            'difficulty' => 'required|in:mudah,sedang,sulit',
            'jumlah_soal' => 'required|integer|min:1|max:50',
            'durasi_menit' => 'required|integer|min:1|max:300',
            'tipe_soal' => 'required|string',
            'instruksi' => 'nullable|string'
        ]);

        // Cek apakah materi ini milik user yang sedang login
        $materi = Materi::where('id', $request->materi_id)
                      ->where('user_id', $request->user()->id)
                      ->first();
                      
        if (!$materi) {
            return response()->json(['message' => 'Materi tidak valid'], 404);
        }

        // Simpan data ujian ke database
        $ujian = Ujian::create([
            'user_id' => $request->user()->id,
            'materi_id' => $request->materi_id,
            'title' => $request->title,
            'token' => strtoupper(\Illuminate\Support\Str::random(6)),
            'durasi_menit' => $request->durasi_menit,
            'difficulty' => $request->difficulty,
            'ai_settings' => [
                'jumlah_soal' => $request->jumlah_soal,
                'tipe_soal' => $request->tipe_soal,
                'instruksi' => $request->instruksi
            ]
        ]);

        return response()->json([
            'message' => 'Konfigurasi ujian berhasil disimpan.',
            'data' => $ujian
        ], 201);
    }

    // Ambil detail satu ujian beserta soalnya
    public function show(Request $request, $id)
    {
        $ujian = Ujian::where('id', $id)
                    ->where('user_id', $request->user()->id)
                    ->with('soal')
                    ->first();
                    
        if (!$ujian) {
            return response()->json(['message' => 'Ujian tidak ditemukan'], 404);
        }

        return response()->json($ujian);
    }

    // Edit data ujian
    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'durasi_menit' => 'required|integer|min:1|max:300',
        ]);

        $ujian = Ujian::where('id', $id)->where('user_id', $request->user()->id)->first();
        if (!$ujian) return response()->json(['message' => 'Ujian tidak ditemukan'], 404);

        $ujian->update([
            'title' => $request->title,
            'durasi_menit' => $request->durasi_menit
        ]);

        return response()->json(['message' => 'Ujian berhasil diupdate', 'data' => $ujian]);
    }

    // Duplikat ujian beserta semua soalnya
    public function duplicate(Request $request, $id)
    {
        $ujian = Ujian::where('id', $id)->where('user_id', $request->user()->id)->with('soal')->first();
        if (!$ujian) return response()->json(['message' => 'Ujian tidak ditemukan'], 404);

        // Salin ujian
        $newUjian = $ujian->replicate();
        $newUjian->title = $ujian->title . ' (Copy)';
        $newUjian->token = strtoupper(\Illuminate\Support\Str::random(6));
        $newUjian->save();

        // Salin semua soal ke ujian baru
        foreach ($ujian->soal as $soal) {
            $newSoal = $soal->replicate();
            $newSoal->ujian_id = $newUjian->id;
            $newSoal->save();
        }

        return response()->json(['message' => 'Ujian berhasil diduplikasi', 'data' => $newUjian]);
    }

    // Hapus ujian
    public function destroy(Request $request, $id)
    {
        $ujian = Ujian::where('id', $id)->where('user_id', $request->user()->id)->first();
        
        if (!$ujian) {
            return response()->json(['message' => 'Ujian tidak ditemukan'], 404);
        }

        $ujian->delete();

        return response()->json(['message' => 'Ujian berhasil dihapus']);
    }
}
