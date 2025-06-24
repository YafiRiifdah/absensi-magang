'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { auth } from '@/app/utils/api';

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email || !password) {
      setError('Email dan password harus diisi.')
      setIsLoading(false)
      return
    }

    try {
      console.log("DEBUG LoginPage: Memulai panggilan auth.login dengan email:", email); // Log 1
      const response = await auth.login({ email, password }); // 'response' di sini adalah UserData & { token: string }
      console.log("DEBUG LoginPage: Respon dari auth.login:", response); // Log 2

      // Jika login berhasil, simpan token dan role ke localStorage
      localStorage.setItem('token', response.token);
      console.log("DEBUG LoginPage: Token disimpan ke localStorage."); // Log 3

      // Validasi dan simpan role ke localStorage
      if (response.role) {
        localStorage.setItem('userRole', response.role);
        console.log("DEBUG LoginPage: UserRole valid ('" + response.role + "') disimpan ke localStorage."); // Log 4a
      } else {
        console.warn("DEBUG LoginPage: Role tidak ditemukan dalam respons login, disimpan sebagai default 'Pengguna'."); // Log 4b
        localStorage.setItem('userRole', 'Pengguna'); // Fallback default
      }
      
      console.log("DEBUG LoginPage: Meredirect ke dashboard."); // Log 5
      router.push('/dashboard');

    } catch (err: any) {
      console.error('DEBUG LoginPage: Login gagal:', err); // Log 6 (error)
      setError(err.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 sm:p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Selamat Datang</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Masukkan email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Masukkan password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-blue-400 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Memproses...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Daftar
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}