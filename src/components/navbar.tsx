'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'; // Import useRouter

// Import UserRole dari utils/api.ts jika Anda ingin menggunakannya di sini
// import { UserRole } from '@/utils/api';

interface NavbarProps {
  userName?: string;
  userPhoto?: string; // Tipe ini sudah sesuai jika Anda tambahkan 'foto?: string | null;' ke UserData
  isLoggedIn?: boolean;
  // Jika Anda ingin menampilkan role di Navbar dropdown, Anda bisa tambahkan prop role di sini
  userRole?: string; // Misalnya 'mahasiswa', 'mentor', 'admin'
}

export default function Navbar({ userName, userPhoto, isLoggedIn = false, userRole }: NavbarProps) {
  const router = useRouter();

  // Mendapatkan inisial nama untuk avatar fallback
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fungsi untuk logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Hapus token dari local storage
    localStorage.removeItem('userRole'); // Hapus role dari local storage
    router.push('/login'); // Redirect ke halaman login
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-lg">
      <Link href="/dashboard" className="font-bold text-xl hover:opacity-90 transition-opacity">
        Sistem Magang
      </Link> {/* Menambahkan judul dan link ke dashboard */}

      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <>
            {/* Navigation Links untuk user yang sudah login (opsional) */}
            {/* <Link href="/dashboard" className="hover:underline hover:opacity-90 transition-opacity">
              Dashboard
            </Link> */}
            {/* <Link href="/absensi" className="hover:underline hover:opacity-90 transition-opacity">
              Absensi
            </Link> */}

            {/* User Profile Section */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium hidden sm:block">
                Halo, {userName || 'Pengguna'}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 rounded-full p-0 hover:bg-blue-700">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userPhoto} alt={userName || "User"} />
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {userName ? getInitials(userName) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userPhoto} alt={userName || "User"} />
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {userName ? getInitials(userName) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName || 'Pengguna'}</p>
                      <p className="text-xs text-muted-foreground">
                        {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Pengguna Magang'} {/* Menampilkan role */}
                      </p>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Pengaturan</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600 cursor-pointer"> {/* Tambahkan onClick */}
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <>
            {/* Navigation untuk user yang belum login */}
            <Button variant="ghost" className="text-white hover:bg-blue-700 hover:text-white" asChild>
              <Link href="/login">
                Login
              </Link>
            </Button>

            <Button variant="outline" className="text-blue-600 bg-white hover:bg-gray-100 hover:text-blue-700 border-white" asChild>
              <Link href="/register">
                Register
              </Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}