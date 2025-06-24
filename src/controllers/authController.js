import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register (for Admin to create users)
export const registerUser = async (req, res) => {
  // Ambil juga phone_number dari request body
  const { full_name, email, password, role, nim, division, domicile_address, internship_start_date, phone_number } = req.body;

  // Validasi dasar yang wajib untuk semua role
  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ message: 'Mohon masukkan Nama Lengkap, Email, Password, dan Peran.' });
  }

  // == LOGIKA VALIDASI TAMBAHAN KHUSUS UNTUK MAHASISWA ==
  if (role === 'mahasiswa') {
      if (!nim || !division || !domicile_address || !internship_start_date || !phone_number) { // <-- Tambahkan phone_number di validasi ini
          return res.status(400).json({ message: 'Untuk peran mahasiswa, NIM, Divisi, Alamat Domisili, Tanggal Mulai Magang, dan Nomor Telepon harus diisi lengkap.' });
      }
      // Validasi format tanggal jika perlu
      if (isNaN(new Date(internship_start_date).getTime())) {
          return res.status(400).json({ message: 'Format Tanggal Mulai Magang tidak valid (YYYY-MM-DD).' });
      }
  }
  // ===================================================

  // Validasi phone_number secara umum (jika tidak hanya mahasiswa yang wajib)
  // Jika semua role wajib phone_number dan tidak null di DB:
  // if (!phone_number) {
  //   return res.status(400).json({ message: 'Nomor telepon harus diisi.' });
  // }


  try {
    // Periksa apakah email sudah terdaftar
    const { data: existingUserByEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email ini sudah terdaftar. Mohon gunakan email lain.' });
    }

    // Periksa apakah NIM sudah terdaftar (hanya jika role adalah mahasiswa)
    if (role === 'mahasiswa' && nim) {
        const { data: existingUserByNim } = await supabase
            .from('users')
            .select('id')
            .eq('nim', nim)
            .single();
        if (existingUserByNim) {
            return res.status(400).json({ message: 'NIM ini sudah terdaftar. Mohon periksa kembali.' });
        }
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          full_name,
          email,
          password: hashedPassword,
          role,
          // Masukkan data tambahan HANYA jika role adalah mahasiswa, jika tidak null atau string kosong
          nim: role === 'mahasiswa' ? nim : null,
          division: role === 'mahasiswa' ? division : null,
          domicile_address: role === 'mahasiswa' ? domicile_address : null,
          internship_start_date: role === 'mahasiswa' ? internship_start_date : null,
          phone_number: phone_number || '', // <-- Pastikan ini selalu terisi (string kosong jika tidak diberikan). Jika DB NOT NULL, ini wajib.
        }
      ])
      // Pilih semua kolom yang relevan, termasuk phone_number
      .select('id, full_name, email, role, nim, division, domicile_address, internship_start_date, phone_number')
      .single();

    if (error) {
      console.error('Error inserting user:', error);
      // Penanganan error khusus jika ada unique constraint violation (code '23505')
      if (error.code === '23505') {
          // Anda bisa cek detail error.message untuk membedakan email atau NIM
          if (error.message.includes('email')) {
              return res.status(400).json({ message: 'Email ini sudah terdaftar. Mohon gunakan email lain.' });
          }
          if (error.message.includes('nim')) {
              return res.status(400).json({ message: 'NIM ini sudah terdaftar. Mohon gunakan NIM lain.' });
          }
          // Default jika unique_violation lain (misal phone_number jika di set UNIQUE)
          return res.status(400).json({ message: 'Data duplikat terdeteksi (misalnya email atau NIM).' });
      }
      return res.status(500).json({ message: 'Gagal mendaftarkan pengguna.' });
    }

    res.status(201).json({
      message: 'Pengguna berhasil didaftarkan',
      user: {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        nim: data.nim,
        division: data.division,
        domicile_address: data.domicile_address,
        internship_start_date: data.internship_start_date,
        phone_number: data.phone_number, // <-- Tambahkan di respons
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Mohon masukkan email dan password.' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      // <--- PERBAIKAN DI SINI: Pastikan 'password' juga dipilih
      .select('id, full_name, email, role, nim, division, domicile_address, internship_start_date, phone_number, password')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Kredensial tidak valid.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Kredensial tidak valid.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        nim: user.nim,
        division: user.division,
        domicile_address: user.domicile_address,
        internship_start_date: user.internship_start_date,
        phone_number: user.phone_number, // <-- Tambahkan di respons
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Get User Profile (Get Me)
export const getMe = async (req, res) => {
  if (req.user) {
    try {
      // Pastikan memilih phone_number
      const { data: userDetails, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, nim, division, domicile_address, internship_start_date, phone_number, password') // <-- Tambahkan 'password' di sini untuk getMe juga jika diperlukan oleh logika lain (walaupun biasanya tidak)
        .eq('id', req.user.id)
        .single();

      if (error || !userDetails) {
        return res.status(404).json({ message: 'Detail pengguna tidak ditemukan.' });
      }

      res.status(200).json(userDetails); // Kirim detail lengkap

    } catch (error) {
      console.error('Error fetching user details for /me:', error);
      res.status(500).json({ message: 'Gagal mengambil detail profil.' });
    }
  } else {
    res.status(401).json({ message: 'Tidak terotorisasi, pengguna tidak ditemukan.' });
  }
};