import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { ArrowLeft, BookOpen, Clock, PenTool, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function DetailSiswa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState([]);
  const [siswa, setSiswa] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRiwayat = async () => {
    try {
      const response = await api.get(`/guru/siswa/${id}/riwayat`);
      setRiwayat(response.data.riwayat);
      setSiswa(response.data.siswa);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, [id]);

  const handleHapus = async (hasilId) => {
    if (window.confirm('Yakin ingin mereset/menghapus riwayat ujian ini? Data nilai dan jawaban siswa akan hilang permanen, sehingga siswa dapat mengerjakannya kembali.')) {
      try {
        await api.delete(`/guru/koreksi/${hasilId}`);
        fetchRiwayat(); // Refresh data
      } catch (error) {
        console.error(error);
        alert('Gagal menghapus riwayat ujian.');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Link to="/siswa" className="text-gray-400 hover:text-[#0ea5e9] transition shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-gray-800 text-sm md:text-lg truncate">Detail Siswa: {siswa?.name || 'Loading...'}</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5 hidden md:block">Riwayat pengerjaan ujian dan koreksi</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat riwayat...</div>
        ) : riwayat.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm max-w-2xl mx-auto mt-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Belum Ada Riwayat</h3>
            <p className="text-gray-500 text-sm">Siswa ini belum mengerjakan ujian apapun yang Anda buat.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {riwayat.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{item.ujian?.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(item.selesai_at).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    <span className="font-semibold text-gray-700">Skor Akhir: {item.skor}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleHapus(item.id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition border border-red-200">
                    <Trash2 className="w-4 h-4" /> Reset
                  </button>
                  <Link to={`/koreksi/${item.id}`} className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-sm">
                    <PenTool className="w-4 h-4" /> Koreksi Jawaban
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
