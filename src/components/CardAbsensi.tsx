'use client'

import React from 'react'; // Penting untuk JSX

interface CardAbsensiProps {
  day: string;
  date: string;
  status: string | null;
  time: string | null; // Jam Masuk
  onAbsen: () => void;
  isCurrentDay: boolean;
  disabled: boolean;
  
  // Props baru untuk Check-out
  onCheckOut?: () => void; // Fungsi yang dipanggil saat check-out
  showCheckout?: boolean; // Boolean untuk menampilkan tombol check-out
}

export default function CardAbsensi({
  day,
  date,
  status,
  time,
  onAbsen,
  isCurrentDay,
  disabled,
  onCheckOut, // Terima prop onCheckOut
  showCheckout, // Terima prop showCheckout
}: CardAbsensiProps) {
  // Logic untuk menentukan teks tombol dan status
  const buttonText = status === 'Hadir' 
    ? (showCheckout ? 'Check-out Sekarang' : 'Sudah Absen')
    : (isCurrentDay ? 'Absen Sekarang' : 'Absen Tidak Tersedia');

  const buttonClass = disabled || (status === 'Hadir' && !showCheckout)
    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
    : (showCheckout
        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700' // Warna untuk Check-out
        : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' // Warna untuk Absen
      );

  return (
    <div className="bg-white shadow-lg rounded-xl p-5 hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">
          {day} ({date})
        </h3>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">Status: <span className={status ? 'font-medium' : 'text-gray-500'}>{status || 'Belum Absen'}</span></p>
          <p className="text-sm text-gray-600">Jam Masuk: {time || '-'}</p>
        </div>
      </div>
      <button
        onClick={showCheckout ? onCheckOut : onAbsen} // Panggil onCheckOut jika showCheckout, else onAbsen
        disabled={disabled} // Disabled sudah dihandle dari parent
        className={`mt-4 w-full py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${buttonClass}`}
      >
        {buttonText}
      </button>
    </div>
  );
}