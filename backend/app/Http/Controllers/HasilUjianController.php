<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HasilUjianController extends Controller
{
    // Cek token ujian dari siswa
    public function cekToken(Request $request, $token)
    {
        $user_id = $request->user()->id;

        $ujian = \App\Models\Ujian::where('token', strtoupper($token))
            ->withCount('soal')
            ->having('soal_count', '>', 0)
            ->with(['materi' => function($q) {
                $q->select('id', 'title');
            }])
            ->first();

        if (!$ujian) {
            return response()->json(['message' => 'Token ujian tidak valid atau ujian belum memiliki soal.'], 404);
        }

        $sudah_dikerjakan = \App\Models\HasilUjian::where('ujian_id', $ujian->id)
            ->where('user_id', $user_id)
            ->exists();

        $ujian->status = $sudah_dikerjakan ? 'Selesai' : 'Belum Dikerjakan';

        return response()->json($ujian);
    }

    // Ambil soal untuk dikerjakan siswa (tanpa kunci jawaban)
    public function mulaiUjian(Request $request, $id)
    {
        $ujian = \App\Models\Ujian::where('id', $id)->first();
        if (!$ujian) return response()->json(['message' => 'Ujian tidak ditemukan'], 404);

        // Ambil soal tanpa menampilkan jawaban benar
        $soal = \App\Models\Soal::where('ujian_id', $id)
            ->select('id', 'ujian_id', 'question_text', 'options')
            ->get()
            ->sortBy(function($item) {
                return (empty($item->options) || count($item->options) === 0) ? 1 : 0;
            })->values();

        return response()->json([
            'ujian' => [
                'id' => $ujian->id,
                'title' => $ujian->title,
                'durasi_menit' => $ujian->durasi_menit
            ],
            'soal' => $soal
        ]);
    }

    // Submit jawaban siswa dan hitung skor
    public function submit(Request $request, $id)
    {
        $request->validate([
            'jawaban' => 'array' // Format: { soal_id: jawaban, ... }
        ]);

        $user_id = $request->user()->id;

        // Cek apakah sudah pernah mengerjakan
        if (\App\Models\HasilUjian::where('ujian_id', $id)->where('user_id', $user_id)->exists()) {
            return response()->json(['message' => 'Anda sudah mengerjakan ujian ini'], 400);
        }

        $jawaban_siswa = $request->jawaban ?? [];
        $soal_ujian = \App\Models\Soal::where('ujian_id', $id)->get();
        
        $total_soal = $soal_ujian->count();
        if ($total_soal === 0) return response()->json(['message' => 'Ujian tidak memiliki soal'], 400);

        $benar = 0;
        foreach ($soal_ujian as $soal) {
            $jwbn = $jawaban_siswa[$soal->id] ?? null;
            if ($jwbn && strtolower($jwbn) === strtolower($soal->correct_answer)) {
                $benar++;
            }
        }

        $skor = ($benar / $total_soal) * 100;

        $hasil = \App\Models\HasilUjian::create([
            'ujian_id' => $id,
            'user_id' => $user_id,
            'skor' => round($skor),
            'jawaban' => $jawaban_siswa,
            'selesai_at' => now()
        ]);

        return response()->json([
            'message' => 'Ujian berhasil disubmit',
            'skor' => round($skor),
            'benar' => $benar,
            'total_soal' => $total_soal
        ]);
    }

    // Lihat riwayat ujian siswa
    public function riwayatSiswa(Request $request)
    {
        $riwayat = \App\Models\HasilUjian::where('user_id', $request->user()->id)
            ->with(['ujian' => function($q) {
                $q->select('id', 'title');
            }])
            ->orderBy('selesai_at', 'desc')
            ->get();
            
        return response()->json($riwayat);
    }
    
    // Laporan semua siswa untuk guru
    public function laporanSiswa(Request $request)
    {
        $guru_id = $request->user()->id;

        // Ambil semua ujian milik guru ini
        $ujian_guru = \App\Models\Ujian::where('user_id', $guru_id)->pluck('id');

        // Ambil semua hasil ujian dari ujian-ujian tersebut
        $hasil_ujians = \App\Models\HasilUjian::whereIn('ujian_id', $ujian_guru)
            ->with(['user' => function($q) {
                $q->select('id', 'name', 'school');
            }])
            ->get();

        // Kelompokkan berdasarkan siswa lalu hitung rata-rata
        $laporan = [];
        foreach ($hasil_ujians as $hasil) {
            $siswa_id = $hasil->user->id;
            if (!isset($laporan[$siswa_id])) {
                $laporan[$siswa_id] = [
                    'id' => $siswa_id,
                    'name' => $hasil->user->name,
                    'class' => $hasil->user->school ?? 'Umum',
                    'exams' => 0,
                    'total_skor' => 0,
                ];
            }
            $laporan[$siswa_id]['exams']++;
            $laporan[$siswa_id]['total_skor'] += $hasil->skor;
        }

        // Hitung rata-rata
        $hasil_akhir = array_values(array_map(function($siswa) {
            $siswa['avg'] = round($siswa['total_skor'] / $siswa['exams']);
            return $siswa;
        }, $laporan));

        return response()->json($hasil_akhir);
    }

    // Lihat riwayat ujian satu siswa (untuk guru)
    public function riwayatSiswaAdmin(Request $request, $id)
    {
        $guru_id = $request->user()->id;
        $ujian_guru = \App\Models\Ujian::where('user_id', $guru_id)->pluck('id');

        $riwayat = \App\Models\HasilUjian::where('user_id', $id)
            ->whereIn('ujian_id', $ujian_guru)
            ->with(['ujian' => function($q) {
                $q->select('id', 'title', 'created_at');
            }])
            ->orderBy('selesai_at', 'desc')
            ->get();

        // Ambil data siswa
        $siswa = \App\Models\Pengguna::find($id);
            
        return response()->json([
            'siswa' => $siswa,
            'riwayat' => $riwayat
        ]);
    }

    // Ambil detail ujian siswa untuk dikoreksi guru
    public function detailKoreksi(Request $request, $hasil_id)
    {
        $guru_id = $request->user()->id;
        $hasil = \App\Models\HasilUjian::with('user', 'ujian')->find($hasil_id);

        if (!$hasil) return response()->json(['message' => 'Hasil ujian tidak ditemukan'], 404);
        
        // Cek apakah guru berhak melihat ujian ini
        if ($hasil->ujian->user_id !== $guru_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $soal = \App\Models\Soal::where('ujian_id', $hasil->ujian_id)
            ->get()
            ->sortBy(function($item) {
                return (empty($item->options) || count($item->options) === 0) ? 1 : 0;
            })->values();

        return response()->json([
            'hasil' => $hasil,
            'soal' => $soal
        ]);
    }

    // Update skor setelah guru koreksi manual
    public function updateSkor(Request $request, $hasil_id)
    {
        $request->validate([
            'skor' => 'required|numeric|min:0|max:100'
        ]);

        $guru_id = $request->user()->id;
        $hasil = \App\Models\HasilUjian::with('ujian')->find($hasil_id);

        if (!$hasil || $hasil->ujian->user_id !== $guru_id) {
            return response()->json(['message' => 'Unauthorized atau tidak ditemukan'], 403);
        }

        $hasil->skor = $request->skor;
        $hasil->save();

        return response()->json(['message' => 'Skor berhasil diperbarui', 'skor' => $hasil->skor]);
    }

    // Hapus riwayat ujian (reset)
    public function destroyAdmin(Request $request, $hasil_id)
    {
        $guru_id = $request->user()->id;
        $hasil = \App\Models\HasilUjian::with('ujian')->find($hasil_id);

        if (!$hasil || $hasil->ujian->user_id !== $guru_id) {
            return response()->json(['message' => 'Unauthorized atau tidak ditemukan'], 403);
        }

        $hasil->delete();

        return response()->json(['message' => 'Riwayat ujian berhasil dihapus (Reset).']);
    }
}
