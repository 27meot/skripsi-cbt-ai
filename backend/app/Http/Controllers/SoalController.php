<?php

namespace App\Http\Controllers;

use App\Models\Soal;
use App\Models\Ujian;
use Illuminate\Http\Request;

class SoalController extends Controller
{
    /**
     * Trigger skrip Python AI untuk generate soal dari PDF.
     * Python mengembalikan JSON ke stdout, Laravel menyimpan ke database.
     */
    public function generate(Request $request, $ujian_id)
    {
        // Naikkan batas waktu eksekusi PHP (AI butuh waktu ~15 menit jika server AI sedang lambat)
        set_time_limit(900);

        $ujian = Ujian::where('id', $ujian_id)
                    ->where('user_id', $request->user()->id)
                    ->with('materi')
                    ->first();

        if (!$ujian) {
            return response()->json(['message' => 'Ujian tidak ditemukan.'], 404);
        }

        if (!$ujian->materi) {
            return response()->json(['message' => 'Materi tidak ditemukan.'], 404);
        }

        // Path lengkap ke file PDF
        $filePath = storage_path('app/public/' . $ujian->materi->file_path);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File PDF materi tidak ditemukan di server.'], 404);
        }

        // Ambil setting dari ujian
        $aiSettings = $ujian->ai_settings ?? [];
        $jumlahSoal = $aiSettings['jumlah_soal'] ?? 5;
        $difficulty  = $ujian->difficulty ?? 'sedang';
        $tipeSoal    = $aiSettings['tipe_soal'] ?? 'pilihan_ganda';
        $instruksi   = $aiSettings['instruksi'] ?? '';

        // Path ke skrip Python AI
        $pythonScript = base_path('../ai_service/generate_soal.py');

        // Bangun command (stderr ke NUL agar stdout bersih JSON)
        $command = sprintf(
            'python %s --file_path=%s --jumlah_soal=%d --difficulty=%s --tipe_soal=%s --instruksi=%s 2>NUL',
            escapeshellarg($pythonScript),
            escapeshellarg($filePath),
            intval($jumlahSoal),
            escapeshellarg($difficulty),
            escapeshellarg($tipeSoal),
            escapeshellarg($instruksi)
        );

        $output = shell_exec($command);

        if (!$output) {
            // Coba lagi dengan stderr ditangkap untuk debugging
            $debugCommand = str_replace('2>NUL', '2>&1', $command);
            $debugOutput = shell_exec($debugCommand);
            return response()->json([
                'message' => 'Skrip Python tidak menghasilkan output.',
                'debug' => $debugOutput
            ], 500);
        }

        // Ambil baris terakhir yang berisi JSON valid
        $lines = array_filter(explode("\n", trim($output)));
        $jsonLine = end($lines);
        $result = json_decode(trim($jsonLine), true);

        if (!$result) {
            return response()->json(['message' => 'Output Python bukan JSON valid.', 'raw' => $output], 500);
        }

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']], 500);
        }

        if (!isset($result['success']) || !isset($result['soal'])) {
            return response()->json(['message' => 'Format output AI tidak sesuai.', 'raw' => $output], 500);
        }

        // Hapus soal lama jika ada
        Soal::where('ujian_id', $ujian_id)->delete();

        // Simpan soal baru langsung ke database
        $soalBaru = [];
        foreach ($result['soal'] as $item) {
            $soalBaru[] = Soal::create([
                'ujian_id' => $ujian_id,
                'question_text' => $item['question_text'],
                'options' => $item['options'],
                'correct_answer' => $item['correct_answer'],
                'explanation' => $item['explanation'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'Berhasil membuat ' . count($soalBaru) . ' soal!',
            'ujian_id' => $ujian_id,
            'jumlah_soal' => count($soalBaru),
        ]);
    }

    /**
     * Mengambil semua soal untuk satu ujian.
     */
    public function index(Request $request, $ujian_id)
    {
        $ujian = Ujian::where('id', $ujian_id)
                    ->where('user_id', $request->user()->id)
                    ->first();

        if (!$ujian) {
            return response()->json(['message' => 'Ujian tidak ditemukan.'], 404);
        }

        $soal = Soal::where('ujian_id', $ujian_id)
            ->get()
            ->sortBy(function($item) {
                return (empty($item->options) || count($item->options) === 0) ? 1 : 0;
            })->values();

        return response()->json($soal);
    }

    /**
     * Menghapus satu soal.
     */
    public function destroy(Request $request, $soal_id)
    {
        $soal = Soal::find($soal_id);

        if (!$soal) {
            return response()->json(['message' => 'Soal tidak ditemukan.'], 404);
        }

        $ujian = Ujian::where('id', $soal->ujian_id)
                    ->where('user_id', $request->user()->id)
                    ->first();

        if (!$ujian) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        $soal->delete();

        return response()->json(['message' => 'Soal berhasil dihapus.']);
    }
}
