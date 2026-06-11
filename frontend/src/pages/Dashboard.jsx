import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { FileText, BookOpen, ClipboardList, TrendingUp } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMateri: 0,
    totalUjian: 0,
    totalSoal: 0,
  });
  const [evalStats, setEvalStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [materiRes, ujianRes, evalRes] = await Promise.all([
          api.get('/materi'),
          api.get('/ujian'),
          api.get('/ai-evaluation/stats').catch(() => ({ data: null }))
        ]);
        
        const ujianList = ujianRes.data;
        const totalSoal = ujianList.reduce((sum, u) => sum + (u.soal_count || 0), 0);

        setStats({
          totalMateri: materiRes.data.length,
          totalUjian: ujianList.length,
          totalSoal: totalSoal,
        });

        if (evalRes && evalRes.data && evalRes.data.total_responses > 0) {
          setEvalStats(evalRes.data);
        }
      } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Materi', value: stats.totalMateri, icon: FileText, color: 'bg-blue-500', light: 'bg-blue-50' },
    { label: 'Total Ujian', value: stats.totalUjian, icon: BookOpen, color: 'bg-green-500', light: 'bg-green-50' },
    { label: 'Total Soal', value: stats.totalSoal, icon: ClipboardList, color: 'bg-purple-500', light: 'bg-purple-50' },
  ];

  const uatLabels = {
    avg_q1: "Soal bersumber dari dokumen",
    avg_q2: "Sistem tidak berhalusinasi",
    avg_q3: "Distractor masuk akal",
    avg_q4: "Tata bahasa soal mudah dipahami",
    avg_q5: "Menu UI mudah dipahami",
    avg_q6: "Sistem menghemat waktu kerja"
  };

  return (
    <AdminLayout>
      <div className="h-14 md:h-16 flex items-center px-4 md:px-8 bg-white border-b border-gray-200 shrink-0">
        <h1 className="font-bold text-gray-800 text-base md:text-lg">Dashboard</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Sapaan */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Selamat datang, {user.name || 'Pengguna'}! 👋</h2>
          <p className="text-gray-500 mt-1">Berikut ringkasan data Anda saat ini.</p>
        </div>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.light} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900">
                  {loading ? '...' : card.value}
                </p>
                <p className="text-sm text-gray-500 font-medium mt-1">{card.label}</p>
              </div>
            );
          })}
        </div>
        
        {/* Bagian Laporan UAT */}
        {evalStats && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Laporan Validasi Pengguna (UAT)</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Berdasarkan {evalStats.total_responses} tanggapan penguji/guru</p>
              </div>
              <div className="bg-[#f0fdf4] text-green-700 px-4 py-2 rounded-xl font-bold text-sm border border-[#bbf7d0]">
                Skala 1 - 5
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {['avg_q1', 'avg_q2', 'avg_q3', 'avg_q4', 'avg_q5', 'avg_q6'].map((key) => {
                const score = parseFloat(evalStats[key] || 0);
                const percentage = (score / 5) * 100;
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-semibold text-gray-700">{uatLabels[key]}</span>
                      <span className="text-sm font-bold text-[#0ea5e9]">{score.toFixed(1)} / 5.0</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-[#0ea5e9] h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
