'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, MapPin, Calendar, Building, GraduationCap } from 'lucide-react'

// Import tipe UserData dari utils/api.ts
import { UserData, UserRole } from '@/app/utils/api'; // Pastikan path impor ini benar

// Antarmuka ProfileCardProps harus menggunakan UserData dari API
interface ProfileCardProps {
  profile: UserData; // Menggunakan tipe UserData dari API
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  // Fungsi untuk mendapatkan warna badge status (sekarang berdasarkan role)
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'mahasiswa':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mentor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Fungsi untuk format tanggal (jika internship_start_date ada)
  const formatTanggal = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString; // Fallback jika string tanggal tidak valid
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.foto ? ( // Menggunakan profile.foto jika ada
              <img
                src={profile.foto}
                alt={profile.full_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                <User className="w-8 h-8 text-blue-600" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900 truncate">
                  {profile.full_name}
                </h3>
                {profile.nim && <p className="text-sm text-gray-600">NIM: {profile.nim}</p>}
              </div>
              <Badge
                variant="outline"
                className={getRoleBadgeColor(profile.role)}
              >
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Badge>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>

              {/* Telepon (Opsional, karena belum ada di UserData backend) */}
              {/* Anda bisa tambahkan kolom 'telepon' di tabel users di Supabase jika ingin menyimpan ini */}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{'N/A'}</span> {/* Placeholder atau gunakan profile.telepon jika ada */}
              </div>

              {profile.division && ( // <-- GUNAKAN 'division' (bukan 'divisi')
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{profile.division}</span>
                </div>
              )}

              {profile.domicile_address && ( // <-- GUNAKAN 'domicile_address' (bukan 'alamat')
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{profile.domicile_address}</span>
                </div>
              )}

              {profile.internship_start_date && ( // <-- GUNAKAN 'internship_start_date' (bukan 'tanggalMulai')
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Mulai Magang: {formatTanggal(profile.internship_start_date)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}