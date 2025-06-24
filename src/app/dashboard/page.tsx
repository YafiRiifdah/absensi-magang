'use client'

import Navbar from '@/components/navbar'
import Sidebar from '@/components/Sidebar'
import ProfileCard from '@/components/ProfileCard'
import CardDashboard from '@/components/CardDashboard'
import CardAbsensi from '@/components/CardAbsensi'
import ScheduleTable from '@/components/ScheduleTable'
import AttendanceSummaryTable from '@/components/AttendanceSummaryTable'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';

import {
  auth,
  student,
  mentor,
  admin,
  schedule,
  UserRole,
  UserData,
  AttendanceItemBackend,
  Schedule as ApiSchedule,
} from '@/app/utils/api'; // Pastikan path impor ini benar (misal: '@/utils/api' atau '../../utils/api')

interface AttendanceItemDisplay {
  day: string;
  date: string;
  status: string | null;
  time: string | null; // Check-in time (HH:MM)
  checkOutTime?: string | null; // Jam Pulang
  id?: string; // ID Absensi dari backend
  // Untuk tampilan Mentor/Admin (dari join `users` di AttendanceItemBackend):
  fullName?: string;
  userEmail?: string;
  nim?: string | null;
  division?: string | null;
  domicileAddress?: string | null;
  internshipStartDate?: string | null;
  comment?: string | null;
  verifiedBy?: string | null; // ID user yang verifikasi
}

interface AttendanceSummary {
  nama: string;
  nim: string | null;
  divisi: string | null;
  email: string;
  tanggal: string;
  jamMasuk: string;
  jamPulang: string | null;
  status: string;
  komentar: string | null;
}


export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [attendance, setAttendance] = useState<AttendanceItemDisplay[]>([]);
  const [currentDate] = useState(new Date());
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [currentSchedule, setCurrentSchedule] = useState<ApiSchedule | null>(null);
  const [isRamadan, setIsRamadan] = useState<boolean>(false);

  const [showSchedule, setShowSchedule] = useState(true);
  const [showAttendance, setShowAttendance] = useState(true);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      // --- START: KODE KRUSIAL UNTUK KOREKSI "UNDEFINED" ---
      let storedRoleFromLocalStorage = localStorage.getItem('userRole') as UserRole | null | string; 
      if (storedRoleFromLocalStorage === 'undefined') { // Jika string "undefined" yang tersimpan
          storedRoleFromLocalStorage = null; // Perlakukan sebagai null
          localStorage.removeItem('userRole'); // Hapus entri yang salah dari localStorage
          console.warn("DEBUG Dashboard: userRole dari localStorage adalah string 'undefined', dikoreksi menjadi null dan dihapus dari localStorage.");
      }
      // --- END: KODE KRUSIAL UNTUK KOREKSI "UNDEFINED" ---

      console.log("DEBUG Dashboard: Token dari localStorage:", token);
      console.log("DEBUG Dashboard: Stored Role dari localStorage (setelah koreksi):", storedRoleFromLocalStorage);

      // 1. Pengecekan Autentikasi Awal (gunakan storedRoleFromLocalStorage yang sudah dikoreksi)
      if (!token || !storedRoleFromLocalStorage) {
        console.log("Token atau role tidak ditemukan (atau dikoreksi menjadi null), mengarahkan ke halaman login.");
        localStorage.removeItem('token'); // Pastikan dihapus jika ada parsial/salah
        localStorage.removeItem('userRole'); // Pastikan dihapus
        router.push('/login');
        return;
      }
      
      try {
        // 2. Fetch Data Profil Pengguna (Ini adalah sumber kebenaran untuk role dan detail lainnya)
        const userDetails = await auth.getMe();
        console.log("1. Data Profil Pengguna (auth.getMe):", userDetails);
        setProfileData(userDetails);
        
        // --- START: PENGATURAN userRole STATE DAN SINKRONISASI localStorage ---
        // Atur state userRole dari data yang di-fetch dari API, ini lebih terpercaya
        setUserRole(userDetails.role); 
        console.log("DEBUG Dashboard: User Role diatur ke state dari API (userDetails.role):", userDetails.role);
        
        // Sinkronkan localStorage dengan role dari API jika ada perbedaan atau jika sebelumnya null/undefined
        if (localStorage.getItem('userRole') !== userDetails.role) {
            console.log("DEBUG Dashboard: Mengupdate userRole di localStorage agar sinkron dengan API.");
            localStorage.setItem('userRole', userDetails.role);
        }
        // --- END: PENGATURAN userRole STATE DAN SINKRONISASI localStorage ---


        // 3. Fetch Jadwal
        const scheduleResponse = await schedule.getCurrentSchedule();
        console.log("2. Respon Jadwal (schedule.getCurrentSchedule):", scheduleResponse);
        setCurrentSchedule(scheduleResponse.schedule);
        setIsRamadan(scheduleResponse.isRamadan);

        let backendAttendanceData: AttendanceItemBackend[] = [];
        let transformedAttendanceForDisplay: AttendanceItemDisplay[] = [];
        let transformedAttendanceForSummary: AttendanceSummary[] = [];

        // Gunakan userDetails.role untuk semua logika fetching absensi dan tampilan
        const effectiveUserRole = userDetails.role; 
        console.log("DEBUG Dashboard: Effective Role untuk fetching absensi:", effectiveUserRole);

        if (effectiveUserRole === 'mahasiswa') {
          backendAttendanceData = await student.getMyAttendance();
          console.log("3. Data Absensi Backend Mahasiswa (student.getMyAttendance):", backendAttendanceData);

          const today = new Date(currentDate);
          const dayOfWeek = today.getDay();
          const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          const startOfWeek = new Date(today.setDate(today.getDate() + diffToMonday));

          const weekDaysNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          const newAttendanceForWeek: AttendanceItemDisplay[] = [];

          for (let i = 1; i <= 6; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + (i - 1));
            const formattedDate = date.toISOString().split('T')[0];

            const matchingRecord = backendAttendanceData.find(item => item.date === formattedDate);

            newAttendanceForWeek.push({
              day: weekDaysNames[i],
              date: formattedDate,
              status: matchingRecord?.status || null,
              time: matchingRecord?.check_in_time ? new Date(matchingRecord.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
              checkOutTime: matchingRecord?.check_out_time ? new Date(matchingRecord.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
              id: matchingRecord?.id,
            });
          }
          transformedAttendanceForDisplay = newAttendanceForWeek;
          console.log("4. Absensi Transformasi untuk CardAbsensi (Mingguan Mahasiswa):", transformedAttendanceForDisplay);

          transformedAttendanceForSummary = backendAttendanceData
            .filter(item => item.status)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(item => ({
              nama: userDetails.full_name,
              nim: userDetails.nim,
              divisi: userDetails.division,
              email: userDetails.email,
              tanggal: item.date,
              jamMasuk: item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
              jamPulang: item.check_out_time ? new Date(item.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
              status: item.status,
              komentar: item.comment || null,
            }));
          console.log("5. Absensi Transformasi untuk Rekap (Mahasiswa):", transformedAttendanceForSummary);

        } else if (effectiveUserRole === 'mentor' || effectiveUserRole === 'admin') {
          backendAttendanceData = await mentor.getAllAttendances(); // Atau admin.getAllAttendanceRecords()
          console.log("3. Data Absensi Backend (Mentor/Admin):", backendAttendanceData);

          transformedAttendanceForDisplay = backendAttendanceData.map(item => ({
            day: new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long' }),
            date: item.date,
            status: item.status,
            time: item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
            checkOutTime: item.check_out_time ? new Date(item.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
            id: item.id,
            fullName: item.users?.full_name || 'N/A',
            userEmail: item.users?.email || 'N/A',
            nim: item.users?.nim || null,
            division: item.users?.division || null,
            domicileAddress: item.users?.domicile_address || null,
            internshipStartDate: item.users?.internship_start_date || null,
            comment: item.comment || null,
            verifiedBy: item.verified_by || null,
          }));
          console.log("4. Absensi Transformasi untuk Display (Mentor/Admin):", transformedAttendanceForDisplay);

          transformedAttendanceForSummary = transformedAttendanceForDisplay.map(item => ({
            nama: item.fullName || 'N/A',
            nim: item.nim || null,
            divisi: item.division || null,
            email: item.userEmail || 'N/A',
            tanggal: item.date,
            jamMasuk: item.time || '-',
            jamPulang: item.checkOutTime || '-',
            status: item.status || 'Belum Absen',
            komentar: item.comment || null,
          }));
          console.log("5. Absensi Transformasi untuk Rekap (Mentor/Admin):", transformedAttendanceForSummary);
        }

        setAttendance(transformedAttendanceForDisplay);
        setAttendanceSummary(transformedAttendanceForSummary);

      } catch (err: any) {
        console.error('Error fetching data in DashboardPage:', err);
        setError(err.message || 'Gagal memuat data dashboard.');
        if (err.message.includes('Autentikasi diperlukan') || err.message.includes('token failed')) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [currentDate, router, userRole]); // userRole perlu di dependency array agar re-fetch ketika berubah

  // ...lanjutan kode handleCheckIn, handleCheckOut, tampilan UI, dsb...

  const handleCheckIn = async (index: number) => {
    if (userRole !== 'mahasiswa') {
        alert('Fitur check-in hanya untuk Mahasiswa.');
        return;
    }

    const itemToUpdate = attendance[index];
    const isCurrentDay = new Date(itemToUpdate.date).toDateString() === currentDate.toDateString();

    if (!isCurrentDay) {
        alert('Anda hanya bisa check-in untuk hari ini.');
        return;
    }
    if (itemToUpdate.status === 'Hadir' && itemToUpdate.time) {
        alert('Anda sudah melakukan check-in hari ini.');
        return;
    }

    try {
      const response = await student.checkIn(); // Tidak mengirim lokasi untuk saat ini
      const updatedAttendance = [...attendance];
      updatedAttendance[index] = {
        ...updatedAttendance[index],
        status: 'Hadir',
        time: response.attendance.check_in_time ? new Date(response.attendance.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
        id: response.attendance.id,
      };
      setAttendance(updatedAttendance);
      alert('Check-in berhasil!');

    } catch (err: any) {
      console.error('Error during check-in:', err);
      setError(err.message || 'Gagal melakukan check-in.');
      alert(err.message || 'Terjadi kesalahan saat absensi.');
    }
  };

  const handleCheckOut = async (attendanceId: string, index: number) => {
    if (userRole !== 'mahasiswa') {
        alert('Fitur check-out hanya untuk Mahasiswa.');
        return;
    }
    const itemToUpdate = attendance[index];
    if (itemToUpdate.checkOutTime) {
        alert('Anda sudah melakukan check-out.');
        return;
    }

    try {
      const response = await student.checkOut();
      const updatedAttendance = [...attendance];
      updatedAttendance[index] = {
        ...updatedAttendance[index],
        checkOutTime: response.attendance.check_out_time ? new Date(response.attendance.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
      };
      setAttendance(updatedAttendance);
      alert('Check-out berhasil!');

    } catch (err: any) {
      console.error('Error during check-out:', err);
      setError(err.message || 'Gagal melakukan check-out.');
      alert(err.message || 'Terjadi kesalahan saat absensi.');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Memuat data dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        userName={profileData?.full_name || 'Pengguna'}
        userPhoto={profileData?.foto || undefined}
        isLoggedIn={true}
        userRole={userRole || undefined}
      />

      <Sidebar
        activeMenu="dashboard"
        userRole={userRole}
      />

      <main className="ml-64 p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : ''}
            </h1>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {profileData && userRole === 'mahasiswa' && (
            <>
              {/* Profile Card */}
              <div className="mb-8">
                <ProfileCard profile={profileData} />
              </div>

              {/* Dashboard Cards (jika Anda ingin menggunakan ini untuk filter tampilan) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <CardDashboard
                  title="Jadwal Kerja"
                  onClick={() => { setShowSchedule(true); setShowAttendance(false); }}
                  isActive={showSchedule}
                />
                <CardDashboard
                  title="Absen"
                  onClick={() => { setShowSchedule(false); setShowAttendance(true); }}
                  isActive={showAttendance}
                />
              </div>
            </>
          )}

          {/* Tampilan Jadwal Kerja */}
          {(userRole === 'mahasiswa' && showSchedule) || (userRole !== 'mahasiswa' && currentSchedule) ? (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Jadwal Kerja</h2>
              {isRamadan && <p className="text-orange-600 font-medium mb-2">Saat ini adalah periode Bulan Puasa.</p>}
              {currentSchedule ? (
                <ScheduleTable schedule={currentSchedule} isRamadan={isRamadan} />
              ) : (
                <p className="text-gray-600">Jadwal belum tersedia.</p>
              )}
            </div>
          ) : null}

          {/* Tampilan Absensi */}
          {(userRole === 'mahasiswa' && showAttendance) || (userRole !== 'mahasiswa' && attendance.length > 0) ? (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {userRole === 'mahasiswa' ? 'Absensi Mingguan' : 'Rekap Absensi Semua Magang'}
              </h2>
              {userRole === 'mahasiswa' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {attendance.map((item, index) => {
                    const itemDate = new Date(item.date);
                    const isCurrentDay = itemDate.toDateString() === currentDate.toDateString();
                    return (
                      <CardAbsensi
                        key={item.id || index}
                        day={item.day}
                        date={item.date}
                        status={item.status}
                        time={item.time}
                        onAbsen={() => handleCheckIn(index)}
                        onCheckOut={() => item.id && handleCheckOut(item.id, index)}
                        isCurrentDay={isCurrentDay}
                        disabled={!isCurrentDay || (item.status === 'Hadir' && item.checkOutTime !== null)}
                        showCheckout={isCurrentDay && item.status === 'Hadir' && item.checkOutTime === null}
                      />
                    );
                  })}
                </div>
              )}

              {/* Tabel Rekap Absensi (untuk Mahasiswa jika ada, atau untuk Mentor/Admin) */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Riwayat Absensi</h3>
              <AttendanceSummaryTable data={attendanceSummary} role={userRole} />
            </div>
          ) : null}

          {/* Pesan jika tidak ada data absen untuk mentor/admin dan belum ada filter */}
          {userRole !== 'mahasiswa' && !loading && attendance.length === 0 && (
            <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-600">
              <p>Tidak ada data absensi untuk ditampilkan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}