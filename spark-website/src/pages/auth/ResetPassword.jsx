import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password minimal harus 8 karakter.";
    if (!/\d/.test(pwd)) return "Password harus mengandung minimal 1 angka.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password harus mengandung karakter unik (misal: @, ., !, dll).";
    return ""; 
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validasi kekuatan password
    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    // 2. Validasi kecocokan password baru dan konfirmasi
    if (password !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok!');
      return;
    }

    setError('');
    // Arahkan ke login setelah sukses mereset
    console.log('Password berhasil diubah untuk:', email);
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative flex items-center justify-center w-full mb-6">
        <button 
          type="button"
          onClick={() => navigate('/verify-otp', { state: { email } })}
          className="absolute left-0 border border-red-200 rounded-lg p-2 text-red-600 hover:bg-red-50 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-red-600">Reset Password</h1>
      </div>
      
      <div className="w-40 h-32 mb-6 flex justify-center items-center">
         <img 
            src="/reset-illustration.png" 
            alt="Reset Password Illustration" 
            className="w-full h-full object-contain"
         />
      </div>

      <p className="text-sm text-red-800/70 text-center mb-8">
        Now you can reset your old password.
      </p>

      <form className="w-full space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-red-600 mb-1 ml-1">Enter a new password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-600">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="****************"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full pl-11 pr-12 py-3 rounded-xl border border-red-300 bg-transparent text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-red-600 hover:text-red-800">
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-red-600 mb-1 ml-1">Confirm new password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-600">
              <Lock size={18} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="****************"
              required
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              className="w-full pl-11 pr-12 py-3 rounded-xl border border-red-300 bg-transparent text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-red-600 hover:text-red-800">
              {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 text-center font-medium mt-2">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition duration-200 mt-4"
        >
          Submit
        </button>
      </form>
    </div>
  );
}