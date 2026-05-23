import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Poin 2: Mengirimkan email ke halaman berikutnya lewat state router
    navigate('/verify-otp', { state: { email } });
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Poin 1: Tombol Back dan Judul Sejajar secara Horizontal */}
      <div className="relative flex items-center justify-center w-full mb-6">
        <button 
          type="button"
          onClick={() => navigate('/login')}
          className="absolute left-0 border border-red-200 rounded-lg p-2 text-red-600 hover:bg-red-50 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-red-600">Forgot Password</h1>
      </div>
      
      {/* Illustration */}
      <div className="w-40 h-32 mb-6 flex justify-center items-center">
         <img 
            src="/forgot-illustration.png" 
            alt="Forgot Password Illustration" 
            className="w-full h-full object-contain"
         />
      </div>

      <p className="text-sm text-red-800/70 text-center mb-6 px-2">
        Don't worry! it happens. Please enter email associated with your account.
      </p>

      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-600">
            <Mail size={18} />
          </div>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-red-300 bg-transparent text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition duration-200 mt-6"
        >
          Send OTP Code
        </button>
      </form>
    </div>
  );
}