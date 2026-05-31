import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Materi from './pages/Materi'
import BuatUjian from './pages/BuatUjian'
import BankSoal from './pages/BankSoal'
import ReviewSoal from './pages/ReviewSoal'
import Siswa from './pages/Siswa'
import SiswaDashboard from './pages/SiswaDashboard'
import DaftarUjian from './pages/DaftarUjian'
import MengerjakanUjian from './pages/MengerjakanUjian'
import HasilUjian from './pages/HasilUjian'
import DetailSiswa from './pages/DetailSiswa'
import KoreksiUjian from './pages/KoreksiUjian'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/materi" element={<Materi />} />
        <Route path="/buat-ujian" element={<BuatUjian />} />
        <Route path="/bank-soal" element={<BankSoal />} />
        <Route path="/review-soal" element={<ReviewSoal />} />
        <Route path="/siswa" element={<Siswa />} />
        <Route path="/siswa/:id" element={<DetailSiswa />} />
        <Route path="/koreksi/:id" element={<KoreksiUjian />} />
        {/* Rute Siswa */}
        <Route path="/siswa/dashboard" element={<SiswaDashboard />} />
        <Route path="/siswa/ujian" element={<DaftarUjian />} />
        <Route path="/siswa/ujian/:id/kerjakan" element={<MengerjakanUjian />} />
        <Route path="/siswa/riwayat" element={<HasilUjian />} />
      </Routes>
    </Router>
  )
}

export default App
