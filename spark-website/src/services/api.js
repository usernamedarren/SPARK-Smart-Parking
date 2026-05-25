import axios from 'axios';

// 1. Samakan dengan API_BASE_URL yang ada di spark-mobile
const API_BASE_URL = "https://prowling-unkind-arbitrate.ngrok-free.dev";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    // 2. SANGAT PENTING: Header ini wajib agar request dari browser 
    // tidak dicegat oleh halaman peringatan (HTML) bawaan ngrok
    'ngrok-skip-browser-warning': 'true' 
  },
});

// 3. Interceptor untuk menyisipkan token
api.interceptors.request.use((config) => {
  // Mengambil token dari sessionStorage (Sesuai dengan sistem Satpam/Protected Route yang kita buat)
  // Jika backend kamu membutuhkan token beneran, pastikan Login.jsx menyimpan tokennya ke key ini:
  const token = sessionStorage.getItem('spark_access_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;