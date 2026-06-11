<?php

namespace App\Http\Controllers;

use App\Models\Soal;
use App\Models\Ujian;
use Illuminate\Http\Request;

class SoalController extends Controller
{
    /**
     * Jalankan skrip Python AI untuk membuat soal dari PDF.
     * Python mengembalikan JSON, lalu Laravel simpan ke database.
     */
    public function generate(Request $request, $ujian_id)
    {
        // Naikkan batas waktu PHP (AI butuh waktu lama jika server lambat)
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

        // Lokasi file PDF
        $filePath = storage_path('app/public/' . $ujian->materi->file_path);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File PDF materi tidak ditemukan di server.'], 404);
        }

        // Ambil pengaturan AI dari ujian
        $aiSettings = $ujian->ai_settings ?? [];
        $jumlahSoal = $aiSettings['jumlah_soal'] ?? 5;
        $difficulty  = $ujian->difficulty ?? 'sedang';
        $tipeSoal    = $aiSettings['tipe_soal'] ?? 'pilihan_ganda';
        $instruksi   = $aiSettings['instruksi'] ?? '';

        // Lokasi skrip Python AI
        $pythonScript = base_path('../ai_service/generate_soal.py');

        // Deteksi sistem operasi (Windows atau Linux)
        $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
        $pythonBin = $isWindows ? 'python' : base_path('../ai_service/venv/bin/python3');
        $nullDevice = $isWindows ? 'NUL' : '/dev/null';

        // Buat perintah (stderr dibuang agar output JSON bersih)
        $command = sprintf(
            '%s %s --file_path=%s --jumlah_soal=%d --difficulty=%s --tipe_soal=%s --instruksi=%s 2>%s',
            escapeshellarg($pythonBin),
            escapeshellarg($pythonScript),
            escapeshellarg($filePath),
            intval($jumlahSoal),
            escapeshellarg($difficulty),
            escapeshellarg($tipeSoal),
            escapeshellarg($instruksi),
            $nullDevice
        );

        $output = shell_exec($command);

        if (!$output) {
            // Coba ulang dengan menangkap error untuk debugging
            $debugCommand = preg_replace('/2>[^ ]+$/', '2>&1', $command);
            $debugOutput = shell_exec($debugCommand);
            return response()->json([
                'message' => 'Skrip Python tidak menghasilkan output.',
                'debug' => $debugOutput
            ], 500);
        }

        // Ambil baris terakhir yang berisi JSON
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

        // Hapus soal lama kalau ada
        Soal::where('ujian_id', $ujian_id)->delete();

        // Simpan soal baru ke database
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
     * Ambil semua soal untuk satu ujian.
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
     * Hapus satu soal.
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
