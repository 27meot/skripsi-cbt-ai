import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { Upload, Search, FileText, Eye, Trash2, Loader2, X } from 'lucide-react';
import api from '../services/api';

export default function Materi() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Ambil daftar materi dari API
  const fetchMateri = async () => {
    try {
      const res = await api.get('/materi');
      setMaterials(res.data);
    } catch (err) {
      console.error('Gagal mengambil materi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateri();
  }, []);

  // Proses upload file PDF
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Hanya file PDF yang diperbolehkan.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Ukuran file tidak boleh melebihi 20MB.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace('.pdf', ''));

    try {
      await api.post('/materi', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Materi berhasil diunggah!');
      fetchMateri();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal mengunggah file.');
      }
    } finally {
      setUploading(false);
      // Reset input file supaya bisa upload ulang
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Buka file PDF di tab baru
  const handleView = (item) => {
    if (item.file_path) {
      const backendURL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
      window.open(`${backendURL}/storage/${item.file_path}`, '_blank');
    } else {
      setError('File PDF tidak ditemukan.');
    }
  };

  // Hapus materi
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus materi ini?')) return;

    try {
      await api.delete(`/materi/${id}`);
      setSuccess('Materi berhasil dihapus.');
      setMaterials(materials.filter(m => m.id !== id));
    } catch (err) {
      setError('Gagal menghapus materi.');
    }
  };

  // Format ukuran file jadi KB/MB
  const formatSize = (bytes) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  // Filter berdasarkan pencarian
  const filtered = materials.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="h-14 md:h-16 flex items-center px-4 md:px-8 bg-white border-b border-gray-200 shrink-0">
        <h1 className="font-bold text-gray-800 text-base md:text-lg">Materi</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {/* Pesan Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 font-medium flex justify-between items-center">
            {error}
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}
        {/* Pesan Sukses */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg mb-4 font-medium flex justify-between items-center">
            {success}
            <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Area Upload */}
        <div className="bg-white border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors rounded-2xl p-6 md:p-12 flex flex-col items-center justify-center mb-8 shadow-sm">
          <div className="bg-blue-50 text-blue-500 p-4 rounded-full mb-5">
            {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {uploading ? 'Mengunggah...' : 'Upload Materi Pembelajaran'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">Drag & drop file PDF di sini, atau klik tombol di bawah</p>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".pdf" 
            onChange={handleUpload} 
            className="hidden" 
            id="file-upload"
            disabled={uploading}
          />
          <label 
            htmlFor="file-upload" 
            className={`flex items-center gap-2 bg-[#0ea5e9] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#0284c7] transition shadow-md shadow-sky-200 cursor-pointer ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Upload className="w-4 h-4" /> Pilih File PDF
          </label>
          <p className="text-gray-400 text-xs mt-5">Maksimal 20MB per file • Format: PDF</p>
        </div>

        {/* Kolom Pencarian */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Cari materi..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none shadow-sm text-sm transition"
          />
        </div>

        {/* Daftar Materi */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#0ea5e9] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Belum ada materi yang diunggah.</p>
            <p className="text-gray-400 text-sm mt-1">Upload file PDF pertama Anda di atas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm hover:border-[#0ea5e9] hover:shadow-md transition group">
                <div className="flex items-center gap-4">
                  <div className="bg-red-50 p-3 rounded-lg text-red-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-[#0ea5e9] transition cursor-pointer">{item.title}</h4>
                    <p className="text-xs text-gray-500 font-medium">
                      {formatSize(item.metadata?.size)} <span className="mx-1">•</span> {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleView(item)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
                  >
                    <Eye className="w-4 h-4" /> Lihat
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-100 hover:border-red-200 rounded-lg hover:bg-red-50 transition shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
