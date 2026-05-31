import React, { useState } from 'react';
import StudentLayout from '../layouts/StudentLayout';
import { BookOpen, Clock, Search, KeyRound, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function DaftarUjian() {
  const [token, setToken] = useState('');
  const [ujian, setUjian] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setLoading(true);
    setError('');
    setUjian(null);

    try {
      const response = await api.get(`/siswa/ujian/token/${token}`);
      setUjian(response.data);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ujian tidak ditemukan. Periksa kembali token Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="p-8 h-full overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Mulai Ujian</h1>
        <p className="text-gray-500 mb-8">Masukkan 6 digit Token Ujian yang diberikan oleh guru Anda.</p>
        
        {/* Token Search Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-xl mx-auto mb-8">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="h-6 w-6 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Contoh: A7B9X2" 
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                maxLength={6}
                className="block w-full pl-14 pr-32 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1176b6] focus:border-[#1176b6] outline-none shadow-sm text-lg font-mono uppercase tracking-widest transition"
                required
              />
              <button 
                type="submit"
                disabled={loading || token.length < 3}
                className="absolute inset-y-2 right-2 px-6 bg-[#1176b6] text-white rounded-lg font-medium hover:bg-[#0f649a] transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Cari
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
              <span className="shrink-0 text-lg">⚠️</span>
              {error}
            </div>
          )}
        </div>

        {/* Ujian Card Result */}
        {ujian && (
          <div className="max-w-xl mx-auto animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Ujian Ditemukan</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition">
              <div className="mb-4">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  ujian.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  Status: {ujian.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{ujian.title}</h3>
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-5 h-5 mr-3 shrink-0 text-blue-500" />
                  Materi: <span className="font-semibold ml-1">{ujian.materi?.title || '-'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-5 h-5 mr-3 shrink-0 text-orange-500" />
                  Jumlah: <span className="font-semibold ml-1">{ujian.soal_count} Soal</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-5 h-5 mr-3 shrink-0 text-green-500" />
                  Durasi: <span className="font-semibold ml-1">{ujian.durasi_menit || 60} Menit</span>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100">
                {ujian.status === 'Selesai' ? (
                  <button 
                    onClick={() => navigate('/siswa/riwayat')}
                    className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    Lihat Hasil di Riwayat
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate(`/siswa/ujian/${ujian.id}/kerjakan`)}
                    className="w-full py-3 bg-[#1176b6] text-white rounded-xl font-bold hover:bg-[#0f649a] transition shadow-md hover:shadow-lg"
                  >
                    Mulai Ujian Sekarang
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
