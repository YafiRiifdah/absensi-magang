'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Mail, Phone, MapPin, Calendar as CalendarIcon, Building, Edit, Save, X, Loader2 } from 'lucide-react' // Tambah Loader2
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { UserData, UserRole, auth, user } from '@/app/utils/api'

const divisions = [
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'UI/UX Design',
  'Data Science',
  'DevOps',
  'Quality Assurance'
]

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserData | null>(null); // Awalnya null, akan diisi dari API
  const [editedProfile, setEditedProfile] = useState<UserData | null>(null); // Awalnya null
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false); // State untuk loading saat menyimpan

  // --- Fetch Data Profil Saat Halaman Dimuat ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login'); // Redirect jika tidak ada token
        return;
      }

      try {
        const userDetails = await auth.getMe(); // Panggil API untuk mendapatkan profil pengguna
        setProfile(userDetails);
        setEditedProfile(userDetails); // Isi editedProfile dengan data asli
        setSelectedDate(userDetails.internship_start_date ? new Date(userDetails.internship_start_date) : undefined);
      } catch (err: any) {
        console.error('Gagal memuat profil:', err);
        setError(err.message || 'Gagal memuat profil Anda.');
        if (err.message.includes('Autentikasi diperlukan') || err.message.includes('token failed')) {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]); // Router sebagai dependency


  // Fungsi untuk mendapatkan warna badge role
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'mahasiswa':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'mentor':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Fungsi untuk format tanggal
  const formatTanggal = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Handler untuk memulai edit
  const handleEdit = () => {
    if (profile) {
      setEditedProfile({ ...profile });
      setSelectedDate(profile.internship_start_date ? new Date(profile.internship_start_date) : undefined);
      setIsEditing(true);
    }
  }

  // Handler untuk menyimpan perubahan
  const handleSave = async () => {
    if (!editedProfile || !profile) return; // Pastikan ada data

    // Client-side validation
    if (!editedProfile.full_name || editedProfile.full_name.trim() === '') {
        setError('Nama Lengkap tidak boleh kosong.');
        return;
    }
    // Validasi phone_number tidak boleh kosong
    if (!editedProfile.phone_number || editedProfile.phone_number.trim() === '') {
        setError('Nomor Telepon tidak boleh kosong.');
        return;
    }
    // Validasi lain seperti divisi, alamat, tanggal mulai jika wajib untuk mahasiswa
    if (editedProfile.role === 'mahasiswa') {
        if (!editedProfile.division || !editedProfile.domicile_address || !selectedDate) {
            setError('Untuk mahasiswa, Divisi, Alamat, dan Tanggal Mulai Magang harus diisi.');
            return;
        }
    }


    setIsSaving(true);
    setError(null);

    try {
      const updatePayload: Partial<Omit<UserData, 'id' | 'role' | 'email' | 'password' | 'token' | 'nim' | 'created_at' | 'updated_at'>> = {
        full_name: editedProfile.full_name,
        phone_number: editedProfile.phone_number, // Gunakan phone_number
        division: editedProfile.division || null,
        domicile_address: editedProfile.domicile_address || null,
        internship_start_date: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
        // NIM dan email tidak diizinkan diubah oleh mahasiswa dari frontend ini
        // Jika admin edit, payload ini bisa diperluas
      };

      // Panggil API user.updateProfile
      const response = await user.updateProfile(profile.id, updatePayload); // Mengirim ID user ke API
      setProfile(response.user); // Update profile state dengan data terbaru dari backend
      setEditedProfile(response.user);
      setIsEditing(false);
      alert('Profil berhasil diperbarui!');
      console.log('Profile updated:', response.user);

    } catch (err: any) {
      console.error('Gagal menyimpan profil:', err);
      setError(err.message || 'Gagal menyimpan perubahan.');
    } finally {
      setIsSaving(false);
    }
  }

  // Handler untuk membatalkan edit
  const handleCancel = () => {
    if (profile) { // Kembali ke data asli
      setEditedProfile({ ...profile });
      setSelectedDate(profile.internship_start_date ? new Date(profile.internship_start_date) : undefined);
    }
    setIsEditing(false);
    setError(null); // Hapus pesan error saat batal
  }

  // Handler untuk mengubah input field (generic)
  const handleInputChange = (field: keyof UserData, value: string) => {
    setEditedProfile(prev => ({
      ...prev!, // Pastikan prev tidak null
      [field]: value
    }));
  };

  // --- Tampilan Loading dan Error ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
        <p className="text-xl text-gray-700">Memuat profil...</p>
      </div>
    );
  }

  if (error && !isEditing) { // Tampilkan error hanya jika tidak dalam mode edit (error loading data)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Muat Ulang Halaman</Button>
      </div>
    );
  }

  if (!profile) { // Jika tidak ada data profil setelah loading
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
              <p className="text-xl text-gray-700">Profil tidak ditemukan.</p>
              <Button onClick={() => router.push('/dashboard')} variant="outline" className="mt-4">Kembali ke Dashboard</Button>
          </div>
      );
  }


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
        {!isEditing ? (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Profil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="w-4 h-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Batal
            </Button>
          </div>
        )}
      </div>

      {error && isEditing && ( // Tampilkan error saat mode edit (validasi client/API)
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Profile Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar dan Info Dasar */}
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.foto ? (
                <img
                  src={profile.foto}
                  alt={profile.full_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-gray-200">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
              )}
            </div>

            {/* Info Dasar */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                  {profile.nim && <p className="text-gray-600">NIM: {profile.nim}</p>}
                </div>
                <Badge variant="outline" className={getRoleBadgeColor(profile.role)}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{profile.email}</span>
              </div>
            </div>
          </div>

          {/* Form Fields (Baca Saja atau Edit) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              {isEditing ? (
                <Input
                  id="full_name"
                  value={editedProfile?.full_name || ''}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {profile.full_name}
                </div>
              )}
            </div>

            {/* Divisi */}
            <div className="space-y-2">
              <Label htmlFor="division">Divisi</Label>
              {isEditing ? (
                <Select
                  value={editedProfile?.division || ''}
                  onValueChange={(value) => handleInputChange('division', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div} value={div}>
                        {div}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  {profile.division || '-'}
                </div>
              )}
            </div>

            {/* Nomor Telepon */}
            <div className="space-y-2">
              <Label htmlFor="phone_number">Nomor Telepon</Label> {/* Ubah id dan htmlFor ke phone_number */}
              {isEditing ? (
                <Input
                  id="phone_number" // Ubah id ke phone_number
                  value={editedProfile?.phone_number || ''} // Gunakan phone_number
                  onChange={(e) => handleInputChange('phone_number', e.target.value)} // Gunakan phone_number
                  placeholder="Masukkan nomor telepon"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {profile.phone_number || '-'} {/* Gunakan phone_number */}
                </div>
              )}
            </div>

            {/* Tanggal Mulai Magang */}
            <div className="space-y-2">
              <Label>Tanggal Mulai Magang</Label>
              {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP", { locale: id })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  {formatTanggal(profile.internship_start_date || null)}
                </div>
              )}
            </div>
          </div>

          {/* Alamat - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="domicile_address">Alamat Domisili</Label> {/* Ubah id dan htmlFor ke domicile_address */}
            {isEditing ? (
              <Textarea
                id="domicile_address" // Ubah id ke domicile_address
                value={editedProfile?.domicile_address || ''} // Gunakan domicile_address
                onChange={(e) => handleInputChange('domicile_address', e.target.value)} // Gunakan domicile_address
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>{profile.domicile_address || '-'}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}