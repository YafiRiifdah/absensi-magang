'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, User, LogIn, Mail, GitBranch } from "lucide-react" // Import ikon tambahan

// Import UserRole dari utils/api.ts
import { UserRole } from '@/app/utils/api';

// Definisikan tipe untuk rekap absensi yang akan diterima oleh komponen ini
// Ini harus sesuai dengan format data yang Anda transformasikan di DashboardPage
interface AttendanceSummary {
  nama: string;
  nim: string | null; // Tambahkan
  divisi: string | null; // Tambahkan
  email: string; // Tambahkan
  tanggal: string;
  jamMasuk: string;
  jamPulang: string | null; // <-- PASTIKAN INI string | null (karena bisa '-')
  status: string;
  komentar: string | null; // Tambahkan
}

interface AttendanceSummaryTableProps {
  data: AttendanceSummary[];
  role: UserRole | null; // Menerima role dari DashboardPage
}

export default function AttendanceSummaryTable({ data, role }: AttendanceSummaryTableProps) {
  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Menggunakan `id-ID` untuk format lokal Indonesia (contoh: 24 Jun 2025)
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString; // Fallback jika string tanggal tidak valid
    }
  };

  // Function to get status badge based on time (assuming standard start time for now)
  const getStatusBadge = (status: string, jamMasuk: string | null, jamPulang: string | null) => {
    // Sesuaikan logika badge agar sesuai dengan 'status' dari backend ('Hadir', 'Izin', 'Sakit', 'Alpha')
    if (status === 'Hadir') {
      if (!jamMasuk) return <Badge variant="destructive">Tidak Hadir</Badge>; // Seharusnya tidak terjadi jika status Hadir

      // Logika terlambat/tepat waktu hanya jika statusnya Hadir dan ada jamMasuk
      const masukTime = new Date(`2000-01-01T${jamMasuk}`);
      // Asumsi jam masuk standar 08:00, ini bisa diambil dari jadwal API jika mau
      const standardTime = new Date(`2000-01-01T08:00:00`); 

      if (masukTime > standardTime) {
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Terlambat</Badge>;
      }
      return <Badge variant="default" className="bg-green-600">Tepat Waktu</Badge>;
    } else if (status === 'Izin') {
      return <Badge variant="secondary" className="bg-blue-500">Izin</Badge>;
    } else if (status === 'Sakit') {
      return <Badge variant="secondary" className="bg-orange-500">Sakit</Badge>;
    } else if (status === 'Alpha') {
      return <Badge variant="destructive">Alpha</Badge>;
    }
    return <Badge variant="outline">Belum Absen</Badge>; // Default atau status tidak dikenal
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Ringkasan Absensi
        </CardTitle>
        <CardDescription>
          Data absensi magang dengan status kehadiran.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tanggal
                  </div>
                </TableHead>
                {/* Kolom tambahan untuk Mentor/Admin */}
                {role !== 'mahasiswa' && (
                  <>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nama
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 text-primary">#</span> {/* Ikon placeholder untuk NIM */}
                        NIM
                      </div>
                    </TableHead>
                     <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Divisi
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </TableHead>
                  </>
                )}
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Jam Masuk
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Jam Pulang
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Komentar</TableHead>
                {(role === 'mentor' || role === 'admin') && <TableHead className="font-semibold">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(item.tanggal)}
                      </div>
                    </TableCell>
                    {/* Kolom tambahan untuk Mentor/Admin */}
                    {role !== 'mahasiswa' && (
                      <>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            {item.nama}
                          </div>
                        </TableCell>
                        <TableCell>{item.nim || '-'}</TableCell>
                        <TableCell>{item.divisi || '-'}</TableCell>
                        <TableCell>{item.email || '-'}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">
                          {item.jamMasuk || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">
                          {item.jamPulang || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status, item.jamMasuk, item.jamPulang)}
                    </TableCell>
                    <TableCell>{item.komentar || '-'}</TableCell>
                    {(role === 'mentor' || role === 'admin') && (
                      <TableCell>
                        {/* Contoh tombol Verifikasi/Edit/Delete untuk Mentor/Admin */}
                        <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                          Detail
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  {/* colspan disesuaikan dengan jumlah kolom (10 untuk non-mahasiswa, 7 untuk mahasiswa) */}
                  <TableCell colSpan={role !== 'mahasiswa' ? 10 : 7} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <User className="h-8 w-8" />
                      <p>Tidak ada data absensi.</p>
                      <p className="text-sm">Data akan muncul setelah absensi tercatat.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Stats (perlu disesuaikan agar hanya untuk Admin/Mentor, dan data dihitung ulang) */}
        {role !== 'mahasiswa' && data.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Hitung total karyawan unik */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Karyawan Magang (unik)</p>
                    <p className="text-2xl font-bold">{new Set(data.map(item => item.email)).size}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Contoh perhitungan tepat waktu / terlambat / tidak hadir */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tepat Waktu</p>
                    <p className="text-2xl font-bold text-green-600">
                      {data.filter(item => item.status === 'Hadir' && item.jamMasuk && new Date(`2000-01-01T${item.jamMasuk}`) <= new Date(`2000-01-01T08:00:00`)).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Terlambat</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {data.filter(item => item.status === 'Hadir' && item.jamMasuk && new Date(`2000-01-01T${item.jamMasuk}`) > new Date(`2000-01-01T08:00:00`)).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tidak Hadir (Alpha/Izin/Sakit)</p>
                    <p className="text-2xl font-bold text-red-600">
                      {data.filter(item => item.status === 'Alpha' || item.status === 'Izin' || item.status === 'Sakit').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}