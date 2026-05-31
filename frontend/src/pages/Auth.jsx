import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, User, Building, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'siswa';

  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');

  useEffect(() => {
    setMode(searchParams.get('mode') === 'register' ? 'register' : 'login');
  }, [searchParams]);

  // Hapus error saat mode berubah
  useEffect(() => {
    setError('');
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;

      if (mode === 'login') {
        response = await api.post('/login', { email, password });
      } else {
        response = await api.post('/register', {
          name,
          email,
          password,
          role: role === 'admin' ? 'guru' : 'siswa',
          school: school || null,
        });
      }

      // Simpan token & data user ke localStorage
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect berdasarkan role
      if (response.data.user.role === 'siswa') {
        navigate('/siswa/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.errors) {
          // Ambil pesan error pertama dari validasi Laravel
          const firstKey = Object.keys(data.errors)[0];
          setError(data.errors[firstKey][0]);
        } else if (data.message) {
          setError(data.message);
        }
      } else {
        setError('Terjadi kesalahan. Pastikan server Laravel sudah berjalan.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#c8e4e7] flex flex-col items-center justify-center font-sans p-4 relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#0e839e] p-2 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Masuk untuk melanjutkan</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === 'login' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setMode('login')}
          >
            Masuk
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === 'register' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setMode('register')}
          >
            Daftar
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daftar sebagai</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-medium rounded-md border ${role === 'admin' ? 'border-[#0e839e] text-[#0e839e] bg-[#f0f9fa]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    onClick={() => setRole('admin')}
                  >
                    Guru / Admin
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-medium rounded-md border ${role === 'siswa' ? 'border-[#0e839e] text-[#0e839e] bg-[#f0f9fa]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    onClick={() => setRole('siswa')}
                  >
                    Siswa
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0e839e] focus:border-[#0e839e] sm:text-sm outline-none" placeholder="Budi Santoso" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sekolah (opsional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0e839e] focus:border-[#0e839e] sm:text-sm outline-none" placeholder="SD Negeri 1" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0e839e] focus:border-[#0e839e] sm:text-sm outline-none" placeholder="nama@sekolah.id" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0e839e] focus:border-[#0e839e] sm:text-sm outline-none" 
                placeholder="Minimal 6 karakter" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1176b6] hover:bg-[#0f649a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1176b6] mt-4 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Masuk' : 'Buat Akun'}
          </button>
        </form>
      </div>
    </div>
  );
}
