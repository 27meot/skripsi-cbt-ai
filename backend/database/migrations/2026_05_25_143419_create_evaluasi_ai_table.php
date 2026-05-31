<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('evaluasi_ai', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ujian_id')->constrained('ujian')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('q1')->comment('Soal bersumber dari dokumen');
            $table->integer('q2')->comment('Tidak berhalusinasi');
            $table->integer('q3')->comment('Distractor masuk akal');
            $table->integer('q4')->comment('Tata bahasa mudah dipahami');
            $table->integer('q5')->comment('Menu UI mudah dipahami');
            $table->integer('q6')->comment('Menghemat waktu');
            $table->text('komentar')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluasi_ai');
    }
};
