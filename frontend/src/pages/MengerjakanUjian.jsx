import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Check, LayoutGrid, X } from 'lucide-react';
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
  const [showNavDrawer, setShowNavDrawer] = useState(false);

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

  // Sistem Anti-Curang (kompatibel Windows & macOS)
  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) return;

    // Simpan ukuran awal layar untuk deteksi split screen
    const initialWidth = window.screen.width;

    // Fungsi untuk menambah peringatan
    const addWarning = () => {
      setCheatWarnings(prev => prev + 1);
      setShowWarningOverlay(true);
    };

    // Fungsi untuk masuk fullscreen (kompatibel semua browser)
    const masukFullscreen = () => {
      const el = document.documentElement;
      try {
        if (el.requestFullscreen) {
          el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          // Safari
          el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
          // IE/Edge lama
          el.msRequestFullscreen();
        }
      } catch (err) {}
    };

    // Fungsi untuk keluar fullscreen (kompatibel semua browser)
    const keluarFullscreen = () => {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } catch (err) {}
    };

    // Cek apakah sedang dalam mode fullscreen
    const isFullscreen = () => {
      return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    };

    // 1. Blokir klik kanan
    const handleContextMenu = (e) => e.preventDefault();

    // 2. Blokir copy, cut, paste
    const handleCopyPaste = (e) => e.preventDefault();

    // 3. Blokir shortcut keyboard (Windows: Ctrl, macOS: Cmd)
    const handleKeyDown = (e) => {
      const isMod = e.ctrlKey || e.metaKey; // Ctrl di Windows, Cmd di Mac

      // Blokir Ctrl/Cmd+C/V/X (copy/paste/cut)
      if (isMod && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
      }
      // Blokir F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Blokir Alt+Tab (Windows) & Cmd+Tab (Mac) - pindah aplikasi
      if ((e.altKey && e.key === 'Tab') || (e.metaKey && e.key === 'Tab')) {
        e.preventDefault();
      }
      // Blokir tombol Windows/Cmd
      if (e.key === 'Meta' || e.key === 'OS') {
        e.preventDefault();
      }
      // Blokir Ctrl/Cmd+Tab (pindah tab browser)
      if (isMod && e.key === 'Tab') {
        e.preventDefault();
      }
      // Blokir Ctrl/Cmd+W (tutup tab)
      if (isMod && e.key === 'w') {
        e.preventDefault();
      }
      // Blokir Ctrl/Cmd+N (buka jendela baru)
      if (isMod && e.key === 'n') {
        e.preventDefault();
      }
      // Blokir Ctrl/Cmd+T (buka tab baru)
      if (isMod && e.key === 't') {
        e.preventDefault();
      }
      // Blokir Ctrl/Cmd+Shift+I (DevTools)
      if (isMod && e.shiftKey && e.key === 'I') {
        e.preventDefault();
      }
      // Blokir Cmd+Q (tutup aplikasi di Mac)
      if (e.metaKey && e.key === 'q') {
        e.preventDefault();
      }
      // Blokir Cmd+H (sembunyikan aplikasi di Mac)
      if (e.metaKey && e.key === 'h') {
        e.preventDefault();
      }
      // Blokir Cmd+M (minimize di Mac)
      if (e.metaKey && e.key === 'm') {
        e.preventDefault();
      }
      // Blokir Escape (keluar fullscreen) - minta tetap fullscreen
      if (e.key === 'Escape') {
        e.preventDefault();
        masukFullscreen();
      }
    };

    // 4. Deteksi tab tersembunyi (pindah tab di browser)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addWarning();
      }
    };

    // 5. Deteksi kehilangan fokus (klik ke aplikasi lain, split screen)
    const handleWindowBlur = () => {
      addWarning();
    };

    // 6. Deteksi keluar dari fullscreen (semua browser termasuk Safari)
    const handleFullscreenChange = () => {
      if (!isFullscreen()) {
        addWarning();
        // Coba masuk fullscreen lagi setelah user kembali
        setTimeout(() => {
          masukFullscreen();
        }, 500);
      }
    };

    // 7. Deteksi ukuran layar berubah drastis (split screen/snap)
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // Jika lebar jendela kurang dari 80% layar, kemungkinan split screen
      if (currentWidth < initialWidth * 0.8) {
        addWarning();
      }
    };

    // Aktifkan fullscreen saat ujian dimulai
    masukFullscreen();

    // Pasang semua pendeteksi
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('resize', handleResize);

      // Keluar fullscreen saat selesai
      if (isFullscreen()) {
        keluarFullscreen();
      }
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
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat mengumpulkan ujian.';
      alert('Error Submit: ' + errorMessage);
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

  const handleNavSelect = (idx) => {
    setCurrentIndex(idx);
    setShowNavDrawer(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><p>Memuat Ujian...</p></div>;
  if (!ujian || soal.length === 0) return <div className="p-8"><p>Ujian tidak ditemukan.</p></div>;

  const currentSoal = soal[currentIndex];
  const answeredCount = soal.filter(s => !!jawaban[s.id]).length;

  if (showWarningOverlay && cheatWarnings < 3) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-600 text-white p-8 z-50 fixed inset-0 flex-col text-center">
        <AlertTriangle className="w-16 h-16 md:w-24 md:h-24 mb-6 animate-pulse" />
        <h1 className="text-2xl md:text-4xl font-bold mb-4">Peringatan Pelanggaran!</h1>
        <p className="text-base md:text-xl mb-2">Anda terdeteksi melakukan salah satu hal berikut:</p>
        <ul className="text-sm md:text-base mb-4 text-left max-w-md mx-auto space-y-1">
          <li>• Membuka aplikasi lain / berpindah jendela</li>
          <li>• Membagi layar (split screen)</li>
          <li>• Berpindah tab browser</li>
          <li>• Keluar dari mode layar penuh</li>
        </ul>
        <p className="text-sm md:text-lg font-bold mb-8 text-yellow-300">Peringatan ke-{cheatWarnings} dari 3 maksimal.</p>
        <button
          onClick={() => setShowWarningOverlay(false)}
          className="bg-white text-red-600 px-6 py-3 md:px-8 md:py-3 rounded-xl font-bold text-base md:text-lg hover:bg-gray-100 transition shadow-lg"
        >
          Saya Mengerti, Kembali ke Ujian
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0 gap-2">
        <div className="min-w-0">
          <h1 className="text-base md:text-xl font-bold text-gray-800 truncate">{ujian.title}</h1>
          <p className="text-xs md:text-sm text-gray-500">Soal {currentIndex + 1} dari {soal.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-bold text-base md:text-lg shrink-0 ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-[#1176b6]'
          }`}>
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          {formatTime(timeLeft)}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden select-none">
        {/* Area Utama */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-[#1176b6] text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg">
                {currentIndex + 1}
              </div>
              <div className="pt-0.5 md:pt-1 text-base md:text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                {currentSoal.question_text}
              </div>
            </div>

            <div className="space-y-3 pl-0 md:pl-14">
              {currentSoal.options && Array.isArray(currentSoal.options) && currentSoal.options.length > 0 ? (
                currentSoal.options.map((opt, i) => {
                  const isSelected = jawaban[currentSoal.id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handlePilihJawaban(currentSoal.id, opt)}
                      className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition flex items-center gap-3 md:gap-4 ${isSelected
                          ? 'border-[#1176b6] bg-blue-50'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#1176b6] bg-[#1176b6]' : 'border-gray-300'
                        }`}>
                        {isSelected && <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                      </div>
                      <span className={`text-sm md:text-base ${isSelected ? 'text-[#1176b6] font-medium' : 'text-gray-700'}`}>
                        {opt}
                      </span>
                    </button>
                  );
                })
              ) : (
                <textarea
                  className="w-full p-3 md:p-4 border border-gray-200 rounded-xl outline-none focus:border-[#1176b6] focus:ring-1 focus:ring-[#1176b6] min-h-[120px] md:min-h-[150px] text-sm md:text-base"
                  placeholder="Tuliskan jawaban Anda di sini..."
                  value={jawaban[currentSoal.id] || ''}
                  onChange={(e) => handlePilihJawaban(currentSoal.id, e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Tombol Navigasi untuk HP (di bawah soal) */}
          <div className="lg:hidden mt-4 flex gap-2 max-w-4xl mx-auto">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>
            <button
              disabled={currentIndex === soal.length - 1}
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm"
            >
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigasi Soal (hanya Desktop) */}
        <div className="w-72 bg-white border-l shadow-sm flex-col shrink-0 hidden lg:flex">
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
                    className={`h-12 rounded-lg font-medium border-2 flex items-center justify-center transition ${isActive
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

      {/* Tombol Aksi di bawah layar HP */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_20px_rgb(0,0,0,0.08)] px-4 py-3 flex items-center gap-3 z-30">
        <button
          onClick={() => setShowNavDrawer(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-[#1176b6] rounded-xl font-medium text-sm border border-blue-100"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>{answeredCount}/{soal.length}</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition disabled:opacity-50"
        >
          {submitting ? 'Mengumpulkan...' : 'Selesai & Kumpulkan'}
        </button>
      </div>

      {/* Panel Navigasi Soal dari bawah (HP) */}
      {showNavDrawer && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowNavDrawer(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 lg:hidden max-h-[70vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-800">Navigasi Soal</h3>
              <button onClick={() => setShowNavDrawer(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-5 gap-2">
                {soal.map((s, idx) => {
                  const isAnswered = !!jawaban[s.id];
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleNavSelect(idx)}
                      className={`h-11 rounded-lg font-medium border-2 flex items-center justify-center transition text-sm ${isActive
                          ? 'border-[#1176b6] text-[#1176b6] bg-blue-50'
                          : isAnswered
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-200 text-gray-500'
                        }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t flex gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 rounded-sm bg-green-500"></div> Sudah dijawab
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 rounded-sm border-2 border-gray-200"></div> Belum dijawab
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Animasi CSS */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
