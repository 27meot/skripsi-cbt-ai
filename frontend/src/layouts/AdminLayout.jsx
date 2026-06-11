import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, LayoutDashboard, FileText, PlusCircle, BookOpen, Users, LogOut, Menu, X } from 'lucide-react';
import api from '../services/api';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ambil data user dari penyimpanan lokal
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Materi', path: '/materi', icon: FileText },
    { name: 'Buat Ujian', path: '/buat-ujian', icon: PlusCircle },
    { name: 'Bank Soal', path: '/bank-soal', icon: BookOpen },
    { name: 'Siswa', path: '/siswa', icon: Users },
  ];

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      // Tetap logout walau API gagal
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      {/* Header untuk HP/Tablet */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#1a2b3c] text-white flex items-center px-4 z-40 lg:hidden">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-lg transition">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="bg-[#30D29E] p-1 rounded-md">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide">COK-GEN</span>
        </div>
      </div>

      {/* Latar belakang gelap saat sidebar terbuka di HP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1a2b3c] text-white flex flex-col justify-between shrink-0
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 mb-6">
            <div className="flex items-center">
              <div className="bg-[#30D29E] p-1.5 rounded-lg mr-3">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-wide">COK-GEN</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/');
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-white/10 text-white font-medium' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profil & Tombol Keluar */}
        <div className="p-4 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-400 truncate">{user.email || 'user@email.com'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
