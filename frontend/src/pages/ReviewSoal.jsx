import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { ArrowLeft, CheckCircle2, Edit3, Trash2, Sparkles, CheckSquare, Square, Loader2 } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ReviewSoal() {
  const [searchParams] = useSearchParams();
  const ujianId = searchParams.get('ujian_id');
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [ujianTitle, setUjianTitle] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Evaluation State
  const [evalScores, setEvalScores] = useState({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 });
  const [komentar, setKomentar] = useState('');
  const [evalSubmitting, setEvalSubmitting] = useState(false);
  const [evalSubmitted, setEvalSubmitted] = useState(false);

  const evaluationQuestions = [
    { id: 'q1', text: 'Soal yang dihasilkan oleh sistem 100% bersumber dari dokumen materi yang saya unggah' },
    { id: 'q2', text: 'Sistem tidak memunculkan istilah asing atau materi di luar dokumen referensi (tidak berhalusinasi)' },
    { id: 'q3', text: 'Opsi jawaban pengecoh (distractor) sangat masuk akal dan mengecoh' },
    { id: 'q4', text: 'Tata bahasa soal yang disusun oleh sistem mudah dipahami oleh peserta didik' },
    { id: 'q5', text: 'Menu pengaturan (dashboard guru) untuk membuat dan mengelola ujian sangat mudah dipahami' },
    { id: 'q6', text: 'Sistem ujian (CBT) ini dapat menghemat waktu dan beban kerja saya secara signifikan' }
  ];

  const submitEvaluation = async () => {
    try {
      setEvalSubmitting(true);
      await api.post('/ai-evaluation', {
        ujian_id: ujianId,
        ...evalScores,
        komentar: komentar
      });
      setEvalSubmitted(true);
    } catch (err) {
      alert('Gagal mengirim penilaian. Pastikan semua pertanyaan telah diisi (1-5).');
    } finally {
      setEvalSubmitting(false);
    }
  };

  useEffect(() => {
    if (!ujianId) {
      navigate('/bank-soal');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch detail ujian untuk mendapatkan title
        const resUjian = await api.get(`/ujian/${ujianId}`);
        setUjianTitle(resUjian.data.title);

        // Fetch soal dari database
        const resSoal = await api.get(`/ujian/${ujianId}/soal`);
        
        // Tambahkan property selected ke setiap soal untuk UI
        const soalWithSelection = resSoal.data.map(q => ({
          ...q,
          selected: true
        }));
        
        setQuestions(soalWithSelection);
      } catch (err) {
        console.error('Gagal mengambil data:', err);
        setError('Gagal memuat data soal. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ujianId, navigate]);

  const toggleSelect = (id) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, selected: !q.selected } : q));
  };

  const selectedCount = questions.filter(q => q.selected).length;

  const handleSimpan = () => {
    // Di aplikasi nyata, kita mungkin ingin mengirim update soal mana yang dipertahankan
    // atau menghapus soal yang tidak dipilih (selected === false)
    // Untuk saat ini, kita langsung arahkan ke bank soal.
    navigate('/bank-soal');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-12 h-12 text-[#0ea5e9] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="h-16 flex items-center justify-between px-8 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/buat-ujian" className="text-gray-400 hover:text-[#0ea5e9] transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">Review Soal: {ujianTitle}</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Pilih soal yang ingin dipertahankan atau edit sebelum disimpan</p>
            {!evalSubmitted && (
              <p className="text-xs text-[#0ea5e9] font-bold mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded">
                * Mohon berikan penilaian evaluasi AI di bagian bawah halaman ini setelah selesai meninjau soal.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 relative bg-[#f8fafc]">
        {error && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-50 text-red-600 p-4 rounded-lg font-medium">
            {error}
          </div>
        )}


        <div className="max-w-4xl mx-auto space-y-6 pb-24">
          {questions.length === 0 && !error ? (
            <div className="text-center py-12 text-gray-500 font-medium">Belum ada soal untuk ujian ini.</div>
          ) : (
            questions.map((q, index) => {
              // Pastikan options berupa array, karena dari database mungkin berupa string JSON
              let options = [];
              try {
                options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
              } catch (e) {
                options = [];
              }
              
              // Cari index jawaban yang benar
              let correctIndex = -1;
              if (Array.isArray(options)) {
                correctIndex = options.findIndex(opt => opt === q.correct_answer);
              }

              return (
                <div 
                  key={q.id} 
                  className={`bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all duration-200 ${q.selected ? 'border-[#30D29E]' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#f0f9fa] text-[#0ea5e9] px-4 py-1.5 rounded-lg text-sm font-extrabold tracking-wide">
                          SOAL {index + 1}
                        </span>
                      </div>
                      <button onClick={() => toggleSelect(q.id)} className="text-gray-300 hover:text-[#30D29E] transition">
                        {q.selected ? <CheckSquare className="w-8 h-8 text-[#30D29E]" /> : <Square className="w-8 h-8" />}
                      </button>
                    </div>

                    <p className="text-gray-900 font-semibold mb-6 text-lg leading-relaxed">{q.question_text}</p>

                    {Array.isArray(options) && options.length > 0 ? (
                      <div className="space-y-3 mb-8">
                        {options.map((opt, i) => (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${i === correctIndex ? 'bg-green-50/50 border-green-200' : 'border-gray-100 bg-gray-50'}`}>
                            <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${i === correctIndex ? 'bg-[#30D29E] text-white shadow-sm shadow-[#30d29e]/30' : 'bg-gray-200 text-gray-500'}`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className={i === correctIndex ? 'text-green-800 font-semibold' : 'text-gray-600 font-medium'}>
                              {opt}
                            </span>
                            {i === correctIndex && <CheckCircle2 className="w-5 h-5 text-[#30D29E] ml-auto" />}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-8 p-5 rounded-xl border border-blue-100 bg-blue-50/30">
                        <h5 className="text-sm font-bold text-[#0ea5e9] mb-2 uppercase tracking-wider">Kunci Jawaban Essay</h5>
                        <p className="text-gray-700 leading-relaxed">{q.correct_answer}</p>
                      </div>
                    )}

                    {q.explanation && (
                      <div className="bg-[#f0f9fa] border border-[#c5e6ec] rounded-xl p-5 flex gap-4 mb-6">
                        <div className="bg-white p-2 rounded-lg h-fit shadow-sm">
                          <Sparkles className="w-5 h-5 text-[#0ea5e9]" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-[#0ea5e9] mb-1.5">Penjelasan AI</h5>
                          <p className="text-sm text-gray-700 leading-relaxed font-medium">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* AI Evaluation Banner (Dipindahkan ke bawah) */}
        {questions.length > 0 && (
          <div className="max-w-4xl mx-auto mb-32 mt-12">
            <div className="flex items-center gap-2 mb-4 px-2">
              <h3 className="font-bold text-gray-800 text-lg">Evaluasi Hasil Ujian</h3>
              <div className="h-px bg-gray-200 flex-1 ml-4"></div>
            </div>
            
            {!evalSubmitted ? (
              <div className="bg-white rounded-2xl shadow-sm border border-[#0ea5e9]/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <Sparkles className="w-6 h-6 text-[#0ea5e9]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">Bantu Evaluasi Kualitas AI</h3>
                    <p className="text-gray-500 text-sm mb-5">Seberapa baik AI menghasilkan soal berdasarkan materi Anda? Penilaian Anda membantu dalam validasi UAT.</p>
                    
                    <div className="space-y-4 mb-6">
                      {evaluationQuestions.map((q, idx) => (
                        <div key={q.id} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4">
                          <p className="text-sm font-semibold text-gray-800 mb-3">{idx + 1}. {q.text}</p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((score) => (
                              <button
                                key={score}
                                onClick={() => setEvalScores(prev => ({ ...prev, [q.id]: score }))}
                                className={`w-10 h-10 rounded-full font-bold text-sm transition-all shadow-sm flex items-center justify-center
                                  ${evalScores[q.id] === score 
                                    ? 'bg-[#0ea5e9] text-white ring-2 ring-[#0ea5e9] ring-offset-2' 
                                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                                  }`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <textarea 
                      value={komentar}
                      onChange={(e) => setKomentar(e.target.value)}
                      placeholder="Ada saran atau kritik tambahan tentang ujian ini? (Opsional)"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none mb-4 shadow-sm"
                      rows="3"
                    ></textarea>

                    <button 
                      onClick={submitEvaluation}
                      disabled={evalSubmitting || Object.values(evalScores).includes(0)}
                      className="bg-[#0ea5e9] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#0284c7] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full justify-center shadow-md"
                    >
                      {evalSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kirim Penilaian UAT'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm text-green-700 font-medium">
                <CheckCircle2 className="w-5 h-5" /> Terima kasih! Penilaian Anda sangat berharga untuk Uji Validasi (UAT).
              </div>
            )}
          </div>
        )}

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-[0_20px_40px_rgb(0,0,0,0.12)] border border-gray-100 p-2 pr-2.5 flex items-center gap-6 z-50">
          <div className="pl-6">
            <p className="text-sm font-medium text-gray-500">Terpilih: <span className="font-extrabold text-gray-900 text-lg mx-1">{selectedCount}</span> / {questions.length} Soal</p>
          </div>
          <button onClick={handleSimpan} className="bg-[#0ea5e9] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#0284c7] transition shadow-lg shadow-sky-200/50 block">
            Selesai & Simpan
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
