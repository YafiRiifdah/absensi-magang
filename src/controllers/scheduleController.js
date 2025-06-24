// src/controllers/scheduleController.js

export const getSchedule = async (req, res) => {
  const isRamadan = false; // Ganti dengan logika deteksi bulan puasa yang sesungguhnya

  const scheduleBeforeRamadan = {
    monday_thursday: {
      check_in: '07:30',
      check_out: '16:00'
    },
    friday: {
      check_in: '07:30',
      check_out: '15:30'
    },
    saturday: {
      check_in: '09:00',
      check_out: '12:00'
    },
    sunday: {
      check_in: 'Libur',
      check_out: 'Libur'
    }
  };

  const scheduleDuringRamadan = {
    monday_thursday: {
      check_in: '08:00',
      check_out: '15:00'
    },
    friday: {
      check_in: '08:00',
      check_out: '15:30'
    },
    saturday: {
      check_in: '09:00',
      check_out: '12:00'
    },
    sunday: {
      check_in: 'Libur',
      check_out: 'Libur'
    }
  };

  try {
    const currentSchedule = isRamadan ? scheduleDuringRamadan : scheduleBeforeRamadan;
    res.status(200).json({
      message: 'Jadwal berhasil diambil',
      schedule: currentSchedule,
      isRamadan: isRamadan // Memberi tahu frontend apakah sedang bulan puasa
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ message: 'Gagal mengambil jadwal' });
  }
};