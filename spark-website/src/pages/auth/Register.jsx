import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, EyeOff, Eye, UserPlus, User, ChevronDown } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State untuk form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  // Fungsi pengecekan Password yang kuat
  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password minimal harus 8 karakter.";
    if (!/\d/.test(pwd)) return "Password harus mengandung minimal 1 angka.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password harus mengandung karakter unik (misal: @, ., !, dll).";
    return ""; // Kosong berarti lolos validasi
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok!');
      return;
    }

    if (!role) {
      setError('Silakan pilih role Anda terlebih dahulu.');
      return;
    }

    setError('');
    console.log('Register sukses:', { name, email, role });
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center">
      <div className="border border-red-200 rounded-xl p-3 mb-4 text-red-600">
        <UserPlus size={28} />
      </div>

      <h1 className="text-2xl font-bold text-red-600 mb-1">Sign Up</h1>
      <p className="text-sm text-red-800/70 text-center mb-6 px-4">
        Find available parking faster with real-time smart guidance
      </p>

      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-600">
            <User size={18} />
          </div>
          <input type="text" placeholder="Name" required value={name} onChange={(e) => {setName(e.target.value); setError('');}} className="w-full pl-11 pr-4 py-3 rounded-xl border border-red-300 bg-transparent text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-600">
            <Mail size={18} />
          </div>
          <input type="email" placeholder="Email" required value={email} onChange={(e) => {setEmail(e.target.value); setError('');}} className="w-full pl-11 pr-4 py-3 rounded-xl border border-red-300 bg-transparent text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-600">
            <Lock size={18} />
          </div>
          <input type={showPassword ? "text" : "password"} placeholder="Password" required value={password} onChange={(e) => {setPassword(e.target.value); setError('');}} className="w-full pl-11 pr-12 py-3 rounded-xl border border-red-300 bg-transparent text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-red-600 hover:text-red-800">
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-600">
            <Lock size={18} />
          </div>
          <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" required value={confirmPassword} onChange={(e) => {setConfirmPassword(e.target.value); setError('');}} className="w-full pl-11 pr-12 py-3 rounded-xl border border-red-300 bg-transparent text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-red-600 hover:text-red-800">
            {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-600 z-10">
            <User size={18} />
          </div>
          <select required value={role} onChange={(e) => {setRole(e.target.value); setError('');}} className={`w-full pl-11 pr-10 py-3 rounded-xl border border-red-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer ${role === "" ? 'text-red-400' : 'text-red-900'}`}>
            <option value="" disabled>Choose role..</option>
            <option value="mahasiswa">Mahasiswa</option>
            <option value="dosen">Dosen</option>
            <option value="staf">Staf</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-red-600">
            <ChevronDown size={18} />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 text-center font-medium">{error}</p>
        )}

        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition duration-200 mt-2">
          Sign Up
        </button>
      </form>

      <p className="text-sm text-red-800/70 mt-6">
        Already have an account? <Link to="/login" className="text-red-600 font-bold hover:underline">Sign In</Link>
      </p>
    </div>
  );
}