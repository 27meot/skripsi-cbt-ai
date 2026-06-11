<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\MateriController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // API Materi
    Route::get('/materi', [MateriController::class, 'index']);
    Route::get('/materi/{id}', [MateriController::class, 'show']);
    Route::post('/materi', [MateriController::class, 'store']);
    Route::delete('/materi/{id}', [MateriController::class, 'destroy']);

    // API Ujian
    Route::get('/ujian', [\App\Http\Controllers\UjianController::class, 'index']);
    Route::post('/ujian', [\App\Http\Controllers\UjianController::class, 'store']);
    Route::get('/ujian/{id}', [\App\Http\Controllers\UjianController::class, 'show']);
    Route::put('/ujian/{id}', [\App\Http\Controllers\UjianController::class, 'update']);
    Route::delete('/ujian/{id}', [\App\Http\Controllers\UjianController::class, 'destroy']);
    Route::post('/ujian/{id}/duplicate', [\App\Http\Controllers\UjianController::class, 'duplicate']);

    // API Evaluasi AI
    Route::get('/ai-evaluation/stats', [\App\Http\Controllers\EvaluasiAiController::class, 'stats']);
    Route::post('/ai-evaluation', [\App\Http\Controllers\EvaluasiAiController::class, 'store']);

    // API Soal (AI & Pengelolaan)
    Route::post('/ujian/{ujian_id}/generate-soal', [\App\Http\Controllers\SoalController::class, 'generate']);
    Route::get('/ujian/{ujian_id}/soal', [\App\Http\Controllers\SoalController::class, 'index']);
    Route::delete('/soal/{id}', [\App\Http\Controllers\SoalController::class, 'destroy']);

    // API Guru (Laporan & Koreksi)
    Route::get('/guru/laporan', [\App\Http\Controllers\HasilUjianController::class, 'laporanSiswa']);
    Route::get('/guru/siswa/{id}/riwayat', [\App\Http\Controllers\HasilUjianController::class, 'riwayatSiswaAdmin']);
    Route::get('/guru/koreksi/{hasil_id}', [\App\Http\Controllers\HasilUjianController::class, 'detailKoreksi']);
    Route::put('/guru/koreksi/{hasil_id}', [\App\Http\Controllers\HasilUjianController::class, 'updateSkor']);
    Route::delete('/guru/koreksi/{hasil_id}', [\App\Http\Controllers\HasilUjianController::class, 'destroyAdmin']);

    // API Siswa (Ujian & Riwayat)
    Route::get('/siswa/ujian/token/{token}', [\App\Http\Controllers\HasilUjianController::class, 'cekToken']);
    Route::get('/siswa/ujian/{id}/mulai', [\App\Http\Controllers\HasilUjianController::class, 'mulaiUjian']);
    Route::post('/siswa/ujian/{id}/submit', [\App\Http\Controllers\HasilUjianController::class, 'submit']);
    Route::get('/siswa/riwayat', [\App\Http\Controllers\HasilUjianController::class, 'riwayatSiswa']);
});
