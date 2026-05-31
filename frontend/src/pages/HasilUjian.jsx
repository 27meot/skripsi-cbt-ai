import React, { useState, useEffect } from 'react';
import StudentLayout from '../layouts/StudentLayout';
import { CheckCircle, XCircle, Award } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

export default function HasilUjian() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const response = await api.get('/siswa/riwayat');
        setRiwayat(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRiwayat();
  }, []);

  return (
    <StudentLayout>
      <div className="p-8 h-full overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Nilai</h1>

        {loading ? (
          <p className="text-gray-500">Memuat data...</p>
        ) : riwayat.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center max-w-2xl mx-auto">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada ujian yang diselesaikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {riwayat.map((hasil) => (
              <div key={hasil.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center">
                
                {/* Score Circle */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center rounded-full bg-gray-50 border-4 border-[#1176b6]">
                  <span className="text-2xl font-bold text-[#1176b6]">{hasil.skor}</span>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{hasil.ujian?.title || 'Ujian Terhapus'}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Selesai pada: {hasil.selesai_at ? format(new Date(hasil.selesai_at), 'dd MMM yyyy, HH:mm') : '-'}
                  </p>
                  
                  <div className="flex gap-4 justify-center md:justify-start">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      <Award className="w-4 h-4 text-yellow-500" />
                      Skor
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
