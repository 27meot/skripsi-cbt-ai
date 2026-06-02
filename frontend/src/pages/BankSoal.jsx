import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { Search, BookOpen, Eye, Edit3, Copy, Trash2, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function BankSoal() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // State untuk Edit Modal
  const [editingExam, setEditingExam] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDurasi, setEditDurasi] = useState(60);

  const fetchUjian = async () => {
    try {
      const res = await api.get('/ujian');
      setExams(res.data);
    } catch (err) {
      console.error('Gagal mengambil daftar ujian:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUjian();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus ujian ini?')) return;
    try {
      await api.delete(`/ujian/${id}`);
      setExams(exams.filter(e => e.id !== id));
    } catch (err) {
      alert('Gagal menghapus ujian.');
    }
  };

  const handleDuplicate = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menduplikat ujian ini beserta seluruh soalnya?')) return;
    try {
      setLoading(true);
      await api.post(`/ujian/${id}/duplicate`);
      await fetchUjian();
    } catch (err) {
      alert('Gagal menduplikat ujian.');
      setLoading(false);
    }
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setEditTitle(exam.title);
    setEditDurasi(exam.durasi_menit || 60);
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      await api.put(`/ujian/${editingExam.id}`, {
        title: editTitle,
        durasi_menit: editDurasi
      });
      setEditingExam(null);
      await fetchUjian();
    } catch (err) {
      alert('Gagal menyimpan perubahan.');
      setLoading(false);
    }
  };

  const filtered = exams.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="h-14 md:h-16 flex items-center px-4 md:px-8 bg-white border-b border-gray-200 shrink-0">
        <h1 className="font-bold text-gray-800 text-base md:text-lg">Bank Soal</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc] relative">
        
        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Cari ujian..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none shadow-sm text-sm transition"
          />
        </div>

        {/* List of Exams */}
        {loading && !editingExam ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#0ea5e9] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Belum ada ujian yang dibuat.</p>
            <p className="text-gray-400 text-sm mt-1">Buat ujian baru di halaman Buat Ujian.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((exam) => (
              <div key={exam.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex-1 w-full flex flex-col lg:flex-row lg:items-start justify-between gap-3 md:gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{exam.title}</h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {exam.difficulty} <span className="mx-1">•</span> {exam.durasi_menit} Menit <span className="mx-1">•</span> {exam.soal_count || 0} soal <span className="mx-1">•</span> {new Date(exam.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl flex items-center gap-3 shrink-0">
                        <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Token Ujian</div>
                        <div className="text-lg font-mono font-bold text-orange-700 select-all">{exam.token || '------'}</div>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(exam.token); alert('Token berhasil disalin!'); }}
                          className="p-1.5 hover:bg-orange-200 text-orange-600 rounded-lg transition ml-1"
                          title="Salin Token"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-5 mt-3">
                  <Link to={`/review-soal?ujian_id=${exam.id}`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition shadow-sm">
                    <Eye className="w-4 h-4" /> Lihat
                  </Link>
                  <button onClick={() => openEditModal(exam)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDuplicate(exam.id)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm">
                    <Copy className="w-4 h-4" /> Duplikat
                  </button>
                  <button 
                    onClick={() => handleDelete(exam.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Edit Modal */}
      {editingExam && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 text-xl">Edit Ujian</h3>
              <button onClick={() => setEditingExam(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ujian</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (Menit)</label>
                <input 
                  type="number" 
                  min={1}
                  value={editDurasi} 
                  onChange={(e) => setEditDurasi(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditingExam(null)} className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">Batal</button>
              <button onClick={handleSaveEdit} className="flex-1 py-2.5 px-4 bg-[#0ea5e9] text-white rounded-xl font-medium hover:bg-[#0284c7] transition">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
