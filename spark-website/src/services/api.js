import axios from 'axios';

// Base URL akan mengarah ke server Railway atau localhost backend kamu
const api = axios.create({
  baseURL: 'http://localhost:8000', // Ganti dengan URL backend jika sudah di-deploy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token JWT secara otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spark_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;