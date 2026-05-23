import React from 'react';
import { Outlet, Link } from 'react-router-dom';
// 1. Import logo langsung dari folder assets
import sparkLogo from '../assets/logo.png'; 
import bgCity from '../assets/background-city.jpg';

export default function AuthLayout() {
  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center relative p-4"
      style={{
        backgroundImage: `url(${bgCity})`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 2. Bagian Logo di pojok kiri atas (Langsung pakai tag img) */}
      {/* Dibungkus Link agar kalau diklik kembali ke halaman utama (opsional) */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-3 z-20 hover:opacity-90 transition-opacity">
        <img 
          src={sparkLogo} 
          alt="SPARK Logo" 
          className="h-15 w-auto object-contain" 
        />
      </Link>

      {/* Card Container untuk form */}
      <div className="bg-[#FFFDFB] border border-red-200 shadow-xl rounded-[2rem] p-8 w-full max-w-md z-10 relative">
        <Outlet />
      </div>
    </div>
  );
}