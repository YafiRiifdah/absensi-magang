// your-nextjs-project/utils/api.ts

const BASE_URL = 'http://localhost:5001/api'; // Ganti dengan URL backend Anda jika di-deploy

// --- TIPE DATA YANG DIGUNAKAN DI API ---
// Sesuaikan ini agar sesuai dengan respons yang Anda harapkan dari backend

export type UserRole = 'mahasiswa' | 'mentor' | 'admin';

export type UserData = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  token?: string; // Hanya saat login
  nim: string | null;
  division: string | null;
  domicile_address: string | null;
  internship_start_date: string | null; // Format Moreau-MM-DD
  phone_number: string | null; // Tambahkan ini
  foto?: string | null;
};

export type AttendanceItemBackend = {
  id: string;
  user_id: string;
  check_in_time: string; // ISO string
  check_out_time: string | null; // ISO string
  date: string; // Moreau-MM-DD
  status: string; // 'Hadir', 'Izin', 'Sakit', 'Alpha'
  comment: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    nim: string | null;
    division: string | null;
    domicile_address: string | null;
    internship_start_date: string | null;
    phone_number: string | null; // Tambahkan ini
  };
};

export type ScheduleItem = {
  check_in: string;
  check_out: string;
};

export type Schedule = {
  monday_thursday: ScheduleItem;
  friday: ScheduleItem;
  saturday: ScheduleItem;
  sunday: ScheduleItem;
};

export type LocationCoords = {
  latitude: number;
  longitude: number;
};

export type AllowedLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
};

// --- FUNGSI UTAMA UNTUK FETCH API ---

/**
 * Fungsi dasar untuk melakukan permintaan terautentikasi ke backend.
 * @param endpoint - Bagian endpoint setelah BASE_URL (misal: '/auth/login')
 * @param method - Metode HTTP (GET, POST, PUT, DELETE)
 * @param body - Data yang akan dikirim dalam body permintaan (untuk POST/PUT/PATCH)
 * @param requiresAuth - Apakah endpoint ini memerlukan token autentikasi (default: true)
 */
export async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  requiresAuth: boolean = true
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Autentikasi diperlukan. Mohon login.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorData: any = {};
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData.message = await response.text();
      }
      throw new Error(errorData.message || `Permintaan gagal dengan status ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    if (contentType && contentType.includes("application/json")) {
      return await response.json() as T;
    } else {
      return null as T;
    }

  } catch (error: any) {
    console.error(`Error saat melakukan permintaan ke ${url}:`, error);
    throw error;
  }
}


// --- FUNGSI SPESIFIK UNTUK SETIAP ENDPOINT API ---

// Auth Endpoints
export const auth = {
  login: async (credentials: { email: string; password: string }): Promise<UserData & { token: string }> => {
    return apiRequest('/auth/login', 'POST', credentials, false);
  },
  register: async (userData: {
    full_name: string;
    email: string;
    password: string;
    role: UserRole;
    nim?: string | null;
    division?: string | null;
    domicile_address?: string | null;
    internship_start_date?: string | null;
    phone_number?: string | null; // Tambahkan phone_number di sini juga
  }): Promise<UserData> => {
    return apiRequest('/auth/register', 'POST', userData, true);
  },
  getMe: async (): Promise<UserData> => {
    return apiRequest('/auth/me', 'GET', undefined, true);
  },
  // Hapus updateProfile dari sini
};

// Student Endpoints
export const student = {
  checkIn: async (location?: LocationCoords): Promise<{ message: string; attendance: AttendanceItemBackend }> => {
    return apiRequest('/student/checkin', 'POST', location ? { latitude: location.latitude, longitude: location.longitude } : {});
  },
  checkOut: async (): Promise<{ message: string; attendance: AttendanceItemBackend }> => {
    return apiRequest('/student/checkout', 'POST', {});
  },
  getMyAttendance: async (): Promise<AttendanceItemBackend[]> => {
    return apiRequest('/student/attendance/me', 'GET');
  },
};

// Mentor Endpoints
export const mentor = {
  getAllAttendances: async (): Promise<AttendanceItemBackend[]> => {
    return apiRequest('/mentor/attendances', 'GET');
  },
  verifyAttendance: async (id: string, updateData: { status?: string; comment?: string }): Promise<{ message: string; attendance: AttendanceItemBackend }> => {
    return apiRequest(`/mentor/attendances/${id}/verify`, 'PUT', updateData);
  },
};

// Admin Endpoints
export const admin = {
  getAllUsers: async (): Promise<UserData[]> => {
    return apiRequest('/admin/users', 'GET');
  },
  createUser: async (userData: {
    full_name: string;
    email: string;
    password: string;
    role: UserRole;
    nim?: string | null;
    division?: string | null;
    domicile_address?: string | null;
    internship_start_date?: string | null;
    phone_number?: string | null; // Tambahkan phone_number di sini juga
  }): Promise<UserData> => {
    return apiRequest('/admin/users', 'POST', userData);
  },
  updateUserRole: async (id: string, role: UserRole): Promise<UserData> => {
    return apiRequest(`/admin/users/${id}/role`, 'PUT', { role });
  },
  resetUserPassword: async (id: string, newPassword: string): Promise<UserData> => {
    return apiRequest(`/admin/users/${id}/reset-password`, 'PUT', { newPassword });
  },
  getAllAttendanceRecords: async (): Promise<AttendanceItemBackend[]> => {
    return apiRequest('/admin/attendance-records', 'GET');
  },
};

// Schedule Endpoints
export const schedule = {
  getCurrentSchedule: async (): Promise<{ message: string; schedule: Schedule; isRamadan: boolean }> => {
    return apiRequest('/schedule/current', 'GET');
  },
};

// Location Endpoints (jika diaktifkan nanti)
export const locations = {
  getAllowed: async (): Promise<AllowedLocation[]> => {
    return apiRequest('/locations', 'GET');
  },
  create: async (locationData: Omit<AllowedLocation, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; location: AllowedLocation }> => {
    return apiRequest('/locations', 'POST', locationData);
  },
  update: async (id: string, locationData: Partial<Omit<AllowedLocation, 'id' | 'created_at' | 'updated_at'>>): Promise<{ message: string; location: AllowedLocation }> => {
    return apiRequest(`/locations/${id}`, 'PUT', locationData);
  },
  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/locations/${id}`, 'DELETE');
  },
};

// --- FUNGSI SPESIFIK UNTUK MANAGEMENT USER UMUM (termasuk update profile) ---
// Ini adalah objek 'user' yang sudah kita definisikan sebelumnya untuk update profile
export const user = {
  updateProfile: async (id: string, updateData: {
    full_name?: string;
    division?: string | null;
    domicile_address?: string | null;
    internship_start_date?: string | null;
    nim?: string | null; // Admin bisa update NIM
    phone_number?: string | null; // Tambahkan phone_number
    email?: string; // Admin bisa update email
  }): Promise<{ message: string; user: UserData }> => {
    // Parameter `updateData` akan disesuaikan di komponen frontend yang memanggilnya
    return apiRequest(`/users/${id}`, 'PUT', updateData);
  },
};