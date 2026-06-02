import React, { useState, useEffect } from 'react';
import StudentLayout from '../layouts/StudentLayout';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function SiswaDashboard() {
  const [stats, setStats] = useState({ ujian_tersedia: 0, ujian_selesai: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const riwayatRes = await api.get('/siswa/riwayat');
        const selesai = riwayatRes.data.length;
        
        setStats({ ujian_selesai: selesai });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <StudentLayout>
      <div className="p-4 md:p-8 h-full overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Siswa</h1>
        
        {loading ? (
          <p className="text-gray-500">Memuat data...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 mb-8 max-w-sm">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="bg-green-50 p-4 rounded-full mr-5">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Ujian Selesai</p>
                <p className="text-3xl font-bold text-gray-800">{stats.ujian_selesai}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center max-w-2xl mx-auto mt-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Siap untuk mulai belajar?</h2>
          <p className="text-gray-500 mb-6">Cek daftar ujian yang tersedia dan mulai kerjakan sekarang untuk mengukur kemampuanmu.</p>
          <Link to="/siswa/ujian" className="bg-[#1176b6] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#0f649a] transition">
            Lihat Daftar Ujian
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
