import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, LayoutDashboard, FileText, CheckCircle, LogOut } from 'lucide-react';
import api from '../services/api';

export default function StudentLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { name: 'Dashboard', path: '/siswa/dashboard', icon: LayoutDashboard },
    { name: 'Daftar Ujian', path: '/siswa/ujian', icon: FileText },
    { name: 'Riwayat Nilai', path: '/siswa/riwayat', icon: CheckCircle },
  ];

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <aside className="w-64 bg-[#1a2b3c] text-white flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-white/10 mb-6">
            <div className="bg-[#1176b6] p-1.5 rounded-lg mr-3">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wide">ExamSiswa</span>
          </div>
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/siswa/dashboard');
              return (
                <Link
                  key={item.name}
                  to={item.path}
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
        <div className="p-4 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-400 truncate">{user.name || 'Siswa'}</p>
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
