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
import { Calendar, Clock, Briefcase, Sun } from "lucide-react"

// Import tipe ApiSchedule dari utils/api.ts
import { Schedule as ApiSchedule } from '@/app/utils/api';

// Antarmuka ScheduleTableProps harus menerima ApiSchedule
interface ScheduleTableProps {
  schedule: ApiSchedule; // Data jadwal dari API
  isRamadan?: boolean; // Opsional, status apakah sedang bulan Ramadhan
}

export default function ScheduleTable({ schedule, isRamadan }: ScheduleTableProps) {
  // Fungsi untuk mendapatkan nama hari saat ini dalam Bahasa Indonesia
  const getCurrentDay = (): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
  };

  // Fungsi untuk menghitung durasi jam kerja dari jam masuk dan pulang
  const calculateWorkHours = (checkInTime: string, checkOutTime: string): number => {
    if (checkInTime === 'Libur' || checkOutTime === 'Libur') return 0; // Jika libur, durasi 0

    try {
      const [inHour, inMinute] = checkInTime.split(':').map(Number);
      const [outHour, outMinute] = checkOutTime.split(':').map(Number);

      const startTime = inHour * 60 + inMinute; // Total menit dari tengah malam
      const endTime = outHour * 60 + outMinute; // Total menit dari tengah malam

      let durationMinutes = endTime - startTime;
      if (durationMinutes < 0) { // Menangani kasus jika pulang di hari berikutnya (misal: shift malam)
          durationMinutes += 24 * 60;
      }

      return durationMinutes / 60; // Konversi ke jam
    } catch {
      return 0; // Fallback jika format waktu tidak valid
    }
  };

  // Fungsi untuk mendapatkan badge status jadwal
  const getScheduleTypeBadge = (checkInTime: string, checkOutTime: string) => {
    if (checkInTime === 'Libur') return <Badge variant="destructive">Libur</Badge>;

    const hours = calculateWorkHours(checkInTime, checkOutTime);
    if (hours === 8) {
      return <Badge variant="default" className="bg-blue-600">Full Time</Badge>;
    } else if (hours <= 4) { // Contoh: 4 jam atau kurang dianggap Half Day
      return <Badge variant="secondary">Half Day</Badge>;
    } else {
      return <Badge variant="outline">Custom</Badge>;
    }
  };

  // Fungsi untuk mendapatkan ikon hari
  const getDayIcon = (dayName: string) => {
    const currentDay = getCurrentDay();
    if (dayName === currentDay) {
      return <Sun className="h-4 w-4 text-orange-500" />;
    }
    return <Calendar className="h-4 w-4 text-muted-foreground" />;
  };

  // Fungsi untuk mengecek apakah hari ini
  const isToday = (dayName: string): boolean => {
    return dayName === getCurrentDay();
  };

  // Data jadwal sekarang diambil dari prop 'schedule'
  const scheduleRows = [
    { hari: 'Senin', jamMasuk: schedule.monday_thursday.check_in, jamPulang: schedule.monday_thursday.check_out },
    { hari: 'Selasa', jamMasuk: schedule.monday_thursday.check_in, jamPulang: schedule.monday_thursday.check_out },
    { hari: 'Rabu', jamMasuk: schedule.monday_thursday.check_in, jamPulang: schedule.monday_thursday.check_out },
    { hari: 'Kamis', jamMasuk: schedule.monday_thursday.check_in, jamPulang: schedule.monday_thursday.check_out },
    { hari: 'Jumat', jamMasuk: schedule.friday.check_in, jamPulang: schedule.friday.check_out },
    { hari: 'Sabtu', jamMasuk: schedule.saturday.check_in, jamPulang: schedule.saturday.check_out },
    { hari: 'Minggu', jamMasuk: schedule.sunday.check_in, jamPulang: schedule.sunday.check_out }, // Minggu adalah 'Libur'
  ];

  // Total jam kerja per minggu (hanya hari kerja)
  const totalWeeklyHours = scheduleRows.reduce((total, item) => {
    if (item.jamMasuk !== 'Libur' && item.jamPulang !== 'Libur') {
      return total + calculateWorkHours(item.jamMasuk, item.jamPulang);
    }
    return total;
  }, 0);

  // Hitung jumlah hari kerja (hari yang bukan 'Libur')
  const workingDaysCount = scheduleRows.filter(item => item.jamMasuk !== 'Libur').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Jadwal Kerja
        </CardTitle>
        <CardDescription>
          Jadwal kerja mingguan untuk karyawan magang
          {isRamadan !== undefined && ( // Tampilkan status Ramadhan jika prop ada
            <span className="ml-2 font-medium">
              {isRamadan ? "(Periode Bulan Puasa)" : "(Periode Non-Puasa)"}
            </span>
          )}
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
                    Hari
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Jam Kerja
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Durasi
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Tipe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleRows.map((item, index) => (
                <TableRow
                  key={index}
                  className={`hover:bg-muted/50 ${isToday(item.hari) ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''}`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getDayIcon(item.hari)}
                      <span className={isToday(item.hari) ? 'font-bold text-orange-700' : ''}>
                        {item.hari}
                      </span>
                      {isToday(item.hari) && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                          Hari Ini
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">
                        {item.jamMasuk !== 'Libur' ? `${item.jamMasuk} - ${item.jamPulang}` : 'Libur'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.jamMasuk !== 'Libur' ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="font-semibold">
                            {calculateWorkHours(item.jamMasuk, item.jamPulang)} jam
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getScheduleTypeBadge(item.jamMasuk, item.jamPulang)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Weekly Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Hari Kerja</p>
                  <p className="text-2xl font-bold">{workingDaysCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Jam/Minggu</p>
                  <p className="text-2xl font-bold text-green-600">{totalWeeklyHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Rata-rata/Hari</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {workingDaysCount > 0 ? (totalWeeklyHours / workingDaysCount).toFixed(1) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule Highlight - Disesuaikan dengan data prop */}
        {scheduleRows.some(item => isToday(item.hari)) && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Jadwal Hari Ini</h3>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-mono text-orange-700">
                  {scheduleRows.find(item => isToday(item.hari))?.jamMasuk !== 'Libur' ?
                   `${scheduleRows.find(item => isToday(item.hari))?.jamMasuk} - ${scheduleRows.find(item => isToday(item.hari))?.jamPulang}` :
                   'Libur'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-orange-600" />
                <span className="text-orange-700">
                  {scheduleRows.find(item => isToday(item.hari))?.jamMasuk !== 'Libur' ?
                   `${calculateWorkHours(
                      scheduleRows.find(item => isToday(item.hari))?.jamMasuk || '0:00',
                      scheduleRows.find(item => isToday(item.hari))?.jamPulang || '0:00'
                   )} jam kerja` :
                   'Libur'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}