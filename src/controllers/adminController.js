import supabase from '../config/supabase.js'; // Perhatikan ekstensi .js
import bcrypt from 'bcryptjs';

// Get all users (students and mentors)
export const getAllUsers = async (req, res) => {
  try {
    // Tambahkan kolom baru di select agar data detail mahasiswa ikut terambil
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, nim, division, domicile_address, internship_start_date'); // <-- PENAMBAHAN DI SINI

    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Gagal mengambil daftar pengguna.' });
    }

    res.status(200).json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: 'Peran harus diisi.' });
  }
  if (!['mahasiswa', 'mentor', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Peran yang diberikan tidak valid.' });
  }

  try {
    // Pilih semua kolom yang relevan setelah update
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select('id, full_name, email, role, nim, division, domicile_address, internship_start_date') // <-- Tambahkan kolom baru di sini juga
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return res.status(500).json({ message: 'Gagal memperbarui peran pengguna.' });
    }

    if (!data) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    res.status(200).json({
      message: 'Peran pengguna berhasil diperbarui',
      user: data,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

export const resetUserPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password baru minimal harus 6 karakter.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', id)
      .select('id, full_name, email, role, nim, division, domicile_address, internship_start_date') // <-- Tambahkan kolom baru di sini juga
      .single();

    if (error) {
      console.error('Error resetting user password:', error);
      return res.status(500).json({ message: 'Gagal mereset password pengguna.' });
    }

    if (!data) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    res.status(200).json({
      message: 'Password pengguna berhasil direset',
      user: data,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

export const getAllAttendanceRecords = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('attendances')
      .select('*, users!attendances_user_id_fkey(id, full_name, email, nim, division, domicile_address, internship_start_date)') // <-- PASTIKAN KOLOM BARU ADA DI SINI
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all attendance records for admin:', error);
      return res.status(500).json({ message: 'Gagal mengambil semua catatan absensi.' });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};