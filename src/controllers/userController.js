// src/controllers/userController.js
import supabase from '../config/supabase.js';

export const updateProfile = async (req, res) => {
  const { id } = req.params; // ID user yang akan diupdate dari URL (misal: /api/users/:id)
  // Ambil data yang dikirimkan untuk update
  const { full_name, email, phone_number, nim, division, domicile_address, internship_start_date } = req.body;
  const requestingUser = req.user; // User yang sedang login (dari JWT token, disisipkan oleh middleware protect)

  if (!requestingUser) {
    return res.status(401).json({ message: 'Tidak terautentikasi.' });
  }

  const updateData = {}; // Objek untuk menampung data yang valid untuk diupdate

  // --- LOGIKA OTORISASI DAN VALIDASI ---
  if (requestingUser.role === 'mahasiswa') {
    // Mahasiswa hanya boleh update profilnya sendiri
    if (requestingUser.id !== id) {
      return res.status(403).json({ message: 'Tidak diizinkan untuk memperbarui profil pengguna lain.' });
    }
    // Mahasiswa tidak diizinkan mengubah role atau email langsung
    if (email && email !== requestingUser.email) {
      return res.status(403).json({ message: 'Mahasiswa tidak diizinkan mengubah email secara langsung. Hubungi Admin.' });
    }
    // NIM biasanya tidak diupdate oleh mahasiswa sendiri setelah registrasi
    // if (nim && nim !== requestingUser.nim) { return res.status(403).json({ message: 'Mahasiswa tidak diizinkan mengubah NIM.' }); }

    // Validasi phone_number tidak boleh kosong untuk mahasiswa
    if (phone_number === undefined || phone_number === null || phone_number.trim() === '') {
        return res.status(400).json({ message: 'Nomor Telepon harus diisi.' });
    }

    // Hanya izinkan field yang relevan untuk diupdate mahasiswa
    if (full_name) updateData.full_name = full_name;
    updateData.phone_number = phone_number; // Wajib diisi
    if (division) updateData.division = division;
    if (domicile_address) updateData.domicile_address = domicile_address;
    if (internship_start_date) updateData.internship_start_date = internship_start_date;
  }
  else if (requestingUser.role === 'admin') {
    // Admin bisa update profil siapapun
    // Validasi phone_number tidak boleh kosong jika diberikan atau jika admin ingin mengosongkannya
    if (phone_number === undefined || phone_number === null || phone_number.trim() === '') {
        return res.status(400).json({ message: 'Nomor Telepon harus diisi.' });
    }

    if (full_name) updateData.full_name = full_name;
    if (email) updateData.email = email; // Admin bisa update email, tapi hati-hati!
    updateData.phone_number = phone_number; // Wajib diisi
    if (nim) updateData.nim = nim; // Admin bisa update NIM
    if (division) updateData.division = division;
    if (domicile_address) updateData.domicile_address = domicile_address;
    if (internship_start_date) updateData.internship_start_date = internship_start_date;
    // Role tidak diupdate dari endpoint ini (ada endpoint updateUserRole khusus)
  }
  else if (requestingUser.role === 'mentor') {
    // Mentor tidak diizinkan mengubah profil
    return res.status(403).json({ message: 'Mentor tidak diizinkan untuk memperbarui profil.' });
  }

  // Jika tidak ada data yang akan diupdate setelah filter otorisasi dan validasi
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: 'Tidak ada data yang valid untuk diperbarui.' });
  }

  // --- EKSEKUSI UPDATE DATABASE ---
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id) // Update berdasarkan ID yang diberikan di URL
      .select('id, full_name, email, role, nim, division, domicile_address, internship_start_date, phone_number') // Pilih semua kolom yang relevan
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      // Penanganan error khusus jika ada unique constraint violation (misal: NIM atau Email yang sudah ada)
      if (error.code === '23505') {
          return res.status(400).json({ message: 'Data duplikat terdeteksi (misalnya NIM atau Email sudah terdaftar).' });
      }
      return res.status(500).json({ message: 'Gagal memperbarui profil pengguna.' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Profil pengguna tidak ditemukan.' });
    }

    res.status(200).json({
      message: 'Profil pengguna berhasil diperbarui',
      user: data,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};