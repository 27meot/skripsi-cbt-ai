import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { ArrowLeft, CheckCircle2, Save, User, BrainCircuit, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function KoreksiUjian() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [soal, setSoal] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newSkor, setNewSkor] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/guru/koreksi/${id}`);
        setData(response.data.hasil);
        setSoal(response.data.soal);
        setNewSkor(response.data.hasil.skor);
      } catch (error) {
        console.error(error);
        alert('Gagal mengambil data atau Anda tidak berhak melihat ini.');
        navigate('/siswa');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handleSaveSkor = async () => {
    if (newSkor === '' || newSkor < 0 || newSkor > 100) {
      alert('Skor harus berada di antara 0 dan 100');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/guru/koreksi/${id}`, { skor: newSkor });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan skor baru.');
    } finally {
      setSaving(false);
    }
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

  // Parse jawaban JSON
  let jawabanSiswa = {};
  try {
    jawabanSiswa = typeof data.jawaban === 'string' ? JSON.parse(data.jawaban) : data.jawaban;
  } catch(e) {}

  return (
    <AdminLayout>
      <div className="h-16 flex items-center justify-between px-8 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <Link to={`/siswa/${data?.user_id}`} className="text-gray-400 hover:text-[#0ea5e9] transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">Koreksi: {data?.user?.name}</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{data?.ujian?.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-200">
          <div className="text-sm font-semibold text-gray-600">Skor Akhir:</div>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              min="0" max="100" 
              value={newSkor} 
              onChange={(e) => setNewSkor(e.target.value)}
              className="w-20 px-3 py-1.5 border-2 border-[#0ea5e9] rounded-lg text-center font-bold text-[#0ea5e9] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
            />
            <button 
              onClick={handleSaveSkor}
              disabled={saving}
              className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white p-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
          </div>
          {saveSuccess && <span className="text-green-600 text-sm font-bold animate-pulse">Disimpan!</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 relative bg-[#f8fafc]">
        
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
          {soal.map((q, index) => {
            const jwb = jawabanSiswa[q.id];
            
            // Cek tipe soal
            let options = [];
            try { options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options; } catch(e) {}
            const isEssay = !options || options.length === 0;

            // Cek benar/salah otomatis
            let isBenarOtomatis = false;
            if (jwb && q.correct_answer && String(jwb).toLowerCase().trim() === String(q.correct_answer).toLowerCase().trim()) {
              isBenarOtomatis = true;
            }

            return (
              <div key={q.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold tracking-wide uppercase">
                    Soal {index + 1} • {isEssay ? 'Essay' : 'Pilihan Ganda'}
                  </span>
                  
                  {!isEssay && (
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded ${isBenarOtomatis ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isBenarOtomatis ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {isBenarOtomatis ? 'BENAR' : 'SALAH'}
                    </span>
                  )}
                  {isEssay && (
                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded bg-orange-100 text-orange-700">
                      <BrainCircuit className="w-4 h-4" /> BUTUH KOREKSI MANUAL
                    </span>
                  )}
                </div>
                
                <div className="p-6">
                  <p className="font-semibold text-gray-900 text-lg mb-6 leading-relaxed">{q.question_text}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3 text-red-600">
                        <User className="w-5 h-5" />
                        <h4 className="font-bold text-sm uppercase tracking-wide">Jawaban Siswa</h4>
                      </div>
                      {jwb ? (
                        <p className="text-gray-800 font-medium bg-white p-4 rounded-lg border border-red-50 shadow-sm leading-relaxed whitespace-pre-wrap">{jwb}</p>
                      ) : (
                        <p className="text-gray-400 italic bg-white p-4 rounded-lg border border-red-50 text-sm">Tidak dijawab</p>
                      )}
                    </div>
                    
                    <div className="bg-green-50/50 border border-green-100 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3 text-green-600">
                        <Sparkles className="w-5 h-5" />
                        <h4 className="font-bold text-sm uppercase tracking-wide">Kunci Jawaban AI</h4>
                      </div>
                      <p className="text-gray-800 font-medium bg-white p-4 rounded-lg border border-green-50 shadow-sm leading-relaxed whitespace-pre-wrap">{q.correct_answer}</p>
                    </div>
                  </div>
                  
                  {q.explanation && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm text-gray-600 border border-gray-100">
                      <span className="font-bold text-gray-700 mr-2">Penjelasan Tambahan:</span> {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
