'use client'

import {
  Home,
  Users,
  Calendar,
  Clock,
  FileText,
  Settings,
  ClipboardList, // Tambahkan ikon untuk Laporan atau rekap absensi
  MapPin, // Jika nanti ada fitur lokasi
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'; // Import useRouter

// Import UserRole dari utils/api.ts
import { UserRole } from '@/app/utils/api';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  href: string;
  roles?: UserRole[]; // Tambahkan properti roles untuk membatasi akses menu
}

interface SidebarProps {
  activeMenu?: string;
  // onMenuClick?: (menuId: string, href: string) => void; // Tidak lagi diperlukan karena navigasi langsung
  userRole?: UserRole | null; // Tambahkan prop userRole
}

export default function Sidebar({
  activeMenu = 'dashboard',
  userRole, // Terima prop userRole
}: SidebarProps) {
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      href: '/dashboard',
      roles: ['mahasiswa', 'mentor', 'admin'] // Semua bisa akses dashboard
    },
    {
      id: 'absensi',
      title: 'Absensi',
      icon: <Clock className="w-5 h-5" />,
      href: '/absensi', // Ini bisa jadi link langsung ke tabel absensi
      roles: ['mahasiswa'] // Hanya mahasiswa yang fokus ke absen pribadi
    },
    {
      id: 'jadwal',
      title: 'Jadwal Kerja',
      icon: <Calendar className="w-5 h-5" />,
      href: '/jadwal', // Ini bisa jadi link langsung ke jadwal
      roles: ['mahasiswa', 'mentor', 'admin']
    },
    {
      id: 'data-mahasiswa',
      title: 'Data Mahasiswa',
      icon: <Users className="w-5 h-5" />,
      href: '/admin/mahasiswa', // Contoh halaman admin/mentor untuk mengelola data mahasiswa
      roles: ['mentor', 'admin'] // Hanya mentor dan admin yang bisa melihat data mahasiswa
    },
    {
      id: 'rekap-absensi',
      title: 'Rekap Absensi',
      icon: <ClipboardList className="w-5 h-5" />,
      href: '/mentor/rekap-absensi', // Contoh halaman mentor/admin untuk rekap absensi
      roles: ['mentor', 'admin']
    },
    {
      id: 'laporan',
      title: 'Laporan',
      icon: <FileText className="w-5 h-5" />,
      href: '/laporan',
      roles: ['admin'] // Hanya admin yang bisa melihat laporan
    },
    {
      id: 'pengaturan',
      title: 'Pengaturan',
      icon: <Settings className="w-5 h-5" />,
      href: '/pengaturan',
      roles: ['admin'] // Pengaturan mungkin hanya untuk admin
    }
  ];

  const handleMenuClick = (href: string) => {
    router.push(href); // Menggunakan useRouter untuk navigasi langsung
  };

  // Filter menu berdasarkan peran pengguna
  const filteredMenuItems = menuItems.filter(item =>
    item.roles ? userRole && item.roles.includes(userRole) : true // Jika roles tidak didefinisikan, anggap bisa diakses semua
  );

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-40">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SM</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Sistem Magang</h2>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredMenuItems.map((item) => ( // Gunakan filteredMenuItems
              <Button
                key={item.id}
                variant={activeMenu === item.id ? "default" : "ghost"}
                className={`
                  w-full justify-start gap-3 h-12 text-left
                  ${activeMenu === item.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => handleMenuClick(item.href)} // Panggil dengan href saja
              >
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2025 Sistem Magang
          </div>
        </div>
      </div>
    </div>
  );
}