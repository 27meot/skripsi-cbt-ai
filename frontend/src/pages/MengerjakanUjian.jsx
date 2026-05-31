import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import api from '../services/api';

export default function MengerjakanUjian() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ujian, setUjian] = useState(null);
  const [soal, setSoal] = useState([]);
  const [jawaban, setJawaban] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [showWarningOverlay, setShowWarningOverlay] = useState(false);

  useEffect(() => {
    const fetchSoal = async () => {
      try {
        const response = await api.get(`/siswa/ujian/${id}/mulai`);
        setUjian(response.data.ujian);
        setSoal(response.data.soal);
        
        // Inisialisasi waktu dari memori lokal (jika ada) atau durasi awal
        const savedTime = localStorage.getItem(`ujian_${id}_time`);
        const durasi = response.data.ujian.durasi_menit || 60;
        setTimeLeft(savedTime ? parseInt(savedTime, 10) : durasi * 60);

        // Auto-restore jawaban dari memori lokal
        const savedJawaban = localStorage.getItem(`ujian_${id}_jawaban`);
        if (savedJawaban) {
          try {
            setJawaban(JSON.parse(savedJawaban));
          } catch (e) {
            console.error('Gagal membaca local storage jawaban', e);
          }
        }
      } catch (err) {
        console.error(err);
        alert('Gagal memuat ujian atau Anda sudah mengerjakannya.');
        navigate('/siswa/ujian');
      } finally {
        setLoading(false);
      }
    };
    fetchSoal();
  }, [id, navigate]);

  // Auto-save Jawaban ke Local Storage setiap kali berubah
  useEffect(() => {
    if (Object.keys(jawaban).length > 0) {
      localStorage.setItem(`ujian_${id}_jawaban`, JSON.stringify(jawaban));
    }
  }, [jawaban, id]);

  // Auto-save Waktu ke Local Storage setiap 5 detik
  useEffect(() => {
    if (timeLeft > 0 && timeLeft % 5 === 0) {
      localStorage.setItem(`ujian_${id}_time`, timeLeft.toString());
    }
  }, [timeLeft, id]);

  // Timer effect
  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, loading, submitting]);

  // Anti-Cheat System
  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) return;

    const handleContextMenu = (e) => e.preventDefault();
    const handleCopyPaste = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) || e.key === 'F12') {
        e.preventDefault();
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatWarnings(prev => prev + 1);
        setShowWarningOverlay(true);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading, submitting, timeLeft]);

  // Eksekusi Hukuman Pelanggaran
  useEffect(() => {
    if (cheatWarnings >= 3 && !submitting && timeLeft > 0) {
      alert("PELANGGARAN MAKSIMAL TERDETEKSI! Ujian Anda disubmit secara otomatis.");
      handleSubmit();
    }
  }, [cheatWarnings, submitting, timeLeft]);

  const handlePilihJawaban = (soalId, opsi) => {
    setJawaban({
      ...jawaban,
      [soalId]: opsi
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    if (timeLeft > 0 && Object.keys(jawaban).length < soal.length) {
      if (!window.confirm('Masih ada soal yang belum dijawab. Yakin ingin mengumpulkan?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.post(`/siswa/ujian/${id}/submit`, { jawaban });
      
      // Clear auto-save data karena sudah berhasil submit
      localStorage.removeItem(`ujian_${id}_jawaban`);
      localStorage.removeItem(`ujian_${id}_time`);

      navigate('/siswa/riwayat');
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengumpulkan ujian.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><p>Memuat Ujian...</p></div>;
  if (!ujian || soal.length === 0) return <div className="p-8"><p>Ujian tidak ditemukan.</p></div>;

  const currentSoal = soal[currentIndex];

  if (showWarningOverlay && cheatWarnings < 3) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-600 text-white p-8 z-50 fixed inset-0 flex-col text-center">
        <AlertTriangle className="w-24 h-24 mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold mb-4">Peringatan Pelanggaran!</h1>
        <p className="text-xl mb-2">Anda terdeteksi meninggalkan halaman ujian atau membuka tab lain.</p>
        <p className="text-lg font-bold mb-8 text-yellow-300">Peringatan ke-{cheatWarnings} dari 3 maksimal.</p>
        <button 
          onClick={() => setShowWarningOverlay(false)}
          className="bg-white text-red-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-lg"
        >
          Saya Mengerti, Kembali ke Ujian
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{ujian.title}</h1>
          <p className="text-sm text-gray-500">Soal {currentIndex + 1} dari {soal.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${
          timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-[#1176b6]'
        }`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden select-none">
        {/* Area Utama */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-10 h-10 shrink-0 bg-[#1176b6] text-white rounded-full flex items-center justify-center font-bold text-lg">
                {currentIndex + 1}
              </div>
              <div className="pt-1 text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                {currentSoal.question_text}
              </div>
            </div>

            <div className="space-y-3 pl-14">
              {currentSoal.options && Array.isArray(currentSoal.options) && currentSoal.options.length > 0 ? (
                currentSoal.options.map((opt, i) => {
                  const isSelected = jawaban[currentSoal.id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handlePilihJawaban(currentSoal.id, opt)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center gap-4 ${
                        isSelected 
                          ? 'border-[#1176b6] bg-blue-50' 
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#1176b6] bg-[#1176b6]' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`${isSelected ? 'text-[#1176b6] font-medium' : 'text-gray-700'}`}>
                        {opt}
                      </span>
                    </button>
                  );
                })
              ) : (
                <textarea 
                  className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-[#1176b6] focus:ring-1 focus:ring-[#1176b6] min-h-[150px]"
                  placeholder="Tuliskan jawaban Anda di sini..."
                  value={jawaban[currentSoal.id] || ''}
                  onChange={(e) => handlePilihJawaban(currentSoal.id, e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Navigasi Soal */}
        <div className="w-72 bg-white border-l shadow-sm flex flex-col shrink-0">
          <div className="p-4 border-b font-medium text-gray-700">Navigasi Soal</div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {soal.map((s, idx) => {
                const isAnswered = !!jawaban[s.id];
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-12 rounded-lg font-medium border-2 flex items-center justify-center transition ${
                      isActive 
                        ? 'border-[#1176b6] text-[#1176b6] bg-blue-50' 
                        : isAnswered
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 rounded-sm bg-green-500"></div> Sudah dijawab
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 rounded-sm border-2 border-gray-200"></div> Belum dijawab
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 flex flex-col gap-3">
            <div className="flex gap-2">
              <button 
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                disabled={currentIndex === soal.length - 1}
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50"
            >
              {submitting ? 'Mengumpulkan...' : 'Selesai & Kumpulkan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
