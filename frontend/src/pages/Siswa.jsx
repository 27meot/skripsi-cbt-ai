import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { Search, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Siswa() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/guru/laporan');
        setStudents(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="h-14 md:h-16 flex items-center px-4 md:px-8 bg-white border-b border-gray-200 shrink-0">
        <h1 className="font-bold text-gray-800 text-base md:text-lg">Siswa</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">
        
        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Cari siswa..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none shadow-sm text-sm transition"
          />
        </div>

        {/* Tabel untuk Desktop */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Kelas</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ujian Selesai</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Rata-rata Nilai</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Memuat data siswa...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Belum ada data nilai siswa.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full text-blue-500">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600 font-medium">{student.class}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600 font-medium">{student.exams}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${student.avg >= 90 ? 'text-green-600' : student.avg >= 80 ? 'text-blue-600' : 'text-orange-500'}`}>
                        {student.avg}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/siswa/${student.id}`} className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-600 hover:text-[#0ea5e9] hover:border-[#0ea5e9] px-3 py-1.5 rounded-lg text-sm font-medium transition shadow-sm">
                        Detail <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tampilan Kartu untuk HP */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data siswa...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada data nilai siswa.</div>
          ) : (
            filteredStudents.map((student) => (
              <Link 
                key={student.id} 
                to={`/siswa/${student.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full text-blue-500">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 text-sm block">{student.name}</span>
                      <span className="text-xs text-gray-500">{student.class}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-lg font-bold ${student.avg >= 90 ? 'text-green-600' : student.avg >= 80 ? 'text-blue-600' : 'text-orange-500'}`}>
                        {student.avg}
                      </span>
                      <p className="text-xs text-gray-400">{student.exams} ujian</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
