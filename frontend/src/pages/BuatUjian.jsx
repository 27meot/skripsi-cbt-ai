import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { Settings2, Sparkles, ChevronDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function BuatUjian() {
  const navigate = useNavigate();
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [materiId, setMateriId] = useState('');
  const [title, setTitle] = useState('');
  const [jumlahSoal, setJumlahSoal] = useState(10);
  const [durasiMenit, setDurasiMenit] = useState(60);
  const [difficulty, setDifficulty] = useState('sedang');
  const [tipeSoal, setTipeSoal] = useState('pilihan_ganda');
  const [instruksi, setInstruksi] = useState('');

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        const res = await api.get('/materi');
        setMateriList(res.data);
      } catch (err) {
        console.error('Gagal mengambil daftar materi:', err);
      }
    };
    fetchMateri();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/ujian', {
        materi_id: materiId,
        title,
        durasi_menit: durasiMenit,
        difficulty,
        jumlah_soal: jumlahSoal,
        tipe_soal: tipeSoal,
        instruksi: instruksi || null,
      });

      const ujianId = res.data.data.id;

      // Panggil endpoint AI untuk generate soal (timeout 15 menit)
      await api.post(`/ujian/${ujianId}/generate-soal`, {}, { timeout: 900000 });

      // Redirect ke review soal
      navigate(`/review-soal?ujian_id=${ujianId}`);
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.errors) {
          const firstKey = Object.keys(data.errors)[0];
          setError(data.errors[firstKey][0]);
        } else if (data.message) {
          setError(data.message);
        }
      } else {
        setError('Gagal menyimpan konfigurasi atau memanggil AI.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="h-14 md:h-16 flex items-center px-4 md:px-8 bg-white border-b border-gray-200 shrink-0">
        <h1 className="font-bold text-gray-800 text-base md:text-lg">Buat Ujian</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 w-full">
          
          {/* Judul Halaman */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="bg-[#f0f9fa] p-3 rounded-xl text-[#0ea5e9]">
              <Settings2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Konfigurasi Ujian</h2>
              <p className="text-sm text-gray-500">Pilih materi dan atur parameter soal</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Materi Sumber</label>
              <div className="relative">
                <select 
                  value={materiId} 
                  onChange={(e) => setMateriId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none transition text-gray-700 appearance-none"
                  required
                >
                  <option value="">Pilih materi...</option>
                  {materiList.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              {materiList.length === 0 && (
                <p className="text-xs text-orange-500 mt-2 font-medium">Belum ada materi. Silakan upload PDF terlebih dahulu di halaman Materi.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Soal</label>
                <input type="number" value={jumlahSoal} onChange={(e) => setJumlahSoal(parseInt(e.target.value))} min={1} max={50} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none transition text-gray-700" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Durasi (Menit)</label>
                <input type="number" value={durasiMenit} onChange={(e) => setDurasiMenit(parseInt(e.target.value))} min={1} max={300} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none transition text-gray-700" required />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tingkat Kesulitan</label>
                <div className="relative">
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none transition text-gray-700 appearance-none">
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Soal</label>
                <div className="relative">
                  <select value={tipeSoal} onChange={(e) => setTipeSoal(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none transition text-gray-700 appearance-none">
                    <option value="pilihan_ganda">Pilihan Ganda</option>
                    <option value="essay">Essay</option>
                    <option value="campuran">Campuran (PG & Essay)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Ujian</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: UTS Matematika Kelas 5" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none transition text-gray-700" required />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#0ea5e9] mb-2">
                <Sparkles className="w-4 h-4" /> Instruksi Tambahan untuk AI <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <textarea 
                rows="4" 
                value={instruksi}
                onChange={(e) => setInstruksi(e.target.value)}
                placeholder="Contoh: Fokuskan soal pada penerapan sehari-hari, gunakan bahasa yang ramah anak SD, sertakan ilustrasi cerita pendek pada tiap soal, hindari istilah yang terlalu teknis..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none transition text-gray-700 resize-none"
              ></textarea>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Beri arahan spesifik kepada AI tentang gaya, konteks, atau fokus soal yang ingin dibuat dari materi PDF.
              </p>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 bg-[#30D29E] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#28B487] transition shadow-lg shadow-[#30d29e]/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 fill-white/20" />}
                {loading ? 'AI sedang membuat soal...' : 'Generate Soal dengan AI'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </AdminLayout>
  );
}
