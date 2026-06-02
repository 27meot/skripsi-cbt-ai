import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, FileText, Cpu, GraduationCap, ChevronRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen font-sans">
      
      {/* Top Dark Section with Gradient */}
      <div className="bg-gradient-to-br from-[#1a3848] via-[#132936] to-[#0d1c25] pb-40 relative">
        {/* Header */}
        <header className="container mx-auto px-6 py-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="bg-[#30D29E] p-1.5 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:inline">COK-GEN</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login?role=admin" className="px-6 py-2.5 text-sm font-medium border border-[#234559] bg-[#1A3345] rounded-full hover:bg-[#234559] transition shadow-sm">
              Masuk Admin
            </Link>
            <Link to="/login?role=siswa" className="px-6 py-2.5 text-sm font-medium bg-[#30D29E] text-white rounded-full hover:bg-[#28B487] transition shadow-sm">
              Masuk Siswa
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 pt-16 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-[#1A3345]/50 px-4 py-2 rounded-full border border-[#234559] mb-8 backdrop-blur-sm">
            <Cpu className="w-4 h-4 text-[#30D29E]" />
            <span className="text-sm text-gray-300 font-medium">Powered by AI & RAG Technology</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Sistem Pembuatan Ujian <br />
            <span className="text-[#30D29E]">Otomatis</span> untuk Sekolah
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Unggah materi pembelajaran, dan biarkan AI membuat soal ujian berkualitas secara otomatis menggunakan teknologi RAG dan LLM.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login?role=admin" className="px-8 py-3.5 bg-[#30D29E] text-white font-medium rounded-full hover:bg-[#28B487] transition flex items-center justify-center gap-2 shadow-lg shadow-[#30d29e]/20">
              Mulai Buat Ujian <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/login?role=siswa" className="px-8 py-3.5 bg-white text-[#112330] font-medium rounded-full hover:bg-gray-100 transition shadow-lg">
              Kerjakan Ujian
            </Link>
          </div>
        </main>

        {/* Overlapping Feature Cards */}
        <div className="absolute left-0 right-0 -bottom-24 z-10 px-6">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white rounded-2xl p-8 shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                <div className="bg-blue-50 w-12 h-12 flex items-center justify-center rounded-xl mb-6">
                  <FileText className="text-blue-500 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Materi PDF</h3>
                <p className="text-gray-500 leading-relaxed">
                  Unggah materi pembelajaran dalam format PDF yang akan diproses oleh sistem RAG.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                <div className="bg-green-50 w-12 h-12 flex items-center justify-center rounded-xl mb-6">
                  <Cpu className="text-green-500 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Generate Soal</h3>
                <p className="text-gray-500 leading-relaxed">
                  Model LLM membaca dan memahami materi, lalu membuat soal ujian berkualitas.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                <div className="bg-gray-50 w-12 h-12 flex items-center justify-center rounded-xl mb-6">
                  <GraduationCap className="text-gray-700 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Ujian Online</h3>
                <p className="text-gray-500 leading-relaxed">
                  Siswa dapat mengerjakan ujian secara online dengan hasil otomatis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works Section (Light) */}
      <section className="bg-[#f8fafc] pt-40 pb-24 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bagaimana Cara Kerjanya?</h2>
          <p className="text-gray-500 mb-16">Proses sederhana dari materi menjadi soal ujian</p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-6xl font-extrabold text-[#e0f2fe] mb-4">01</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Upload PDF</h4>
              <p className="text-gray-500 text-sm">Guru mengunggah materi pelajaran</p>
            </div>
            <div>
              <div className="text-6xl font-extrabold text-[#e0f2fe] mb-4">02</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">RAG Processing</h4>
              <p className="text-gray-500 text-sm">Sistem membaca & mengindeks materi</p>
            </div>
            <div>
              <div className="text-6xl font-extrabold text-[#e0f2fe] mb-4">03</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">AI Generate</h4>
              <p className="text-gray-500 text-sm">LLM membuat soal dari konteks materi</p>
            </div>
            <div>
              <div className="text-6xl font-extrabold text-[#e0f2fe] mb-4">04</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Ujian Siap</h4>
              <p className="text-gray-500 text-sm">Siswa dapat mengerjakan ujian online</p>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-[#f8fafc] border-t border-gray-200 py-8 text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
           <Brain className="w-5 h-5 text-[#0F5A7B]" />
           <span className="font-bold text-[#0F5A7B]">COK-GEN</span>
        </div>
        <p className="text-gray-400 text-sm">© 2026 COK-GEN (Context-Oriented Knowledge Generator)</p>
      </footer>
    </div>
  );
}
