import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const emailTerdaftar = location.state?.email || 'email anda';

  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  
  // State untuk timer hitung mundur (60 detik)
  const [timer, setTimer] = useState(60);

  // useEffect untuk menjalankan hitung mundur setiap 1 detik
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    // Membersihkan interval saat komponen dibongkar atau timer berubah
    return () => clearInterval(interval);
  }, [timer]);

  // Fungsi untuk memformat detik menjadi MM:SS (contoh: 60 -> 01:00, 59 -> 00:59)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value !== '' && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleResendOTP = () => {
    if (timer === 0) {
      // Reset timer kembali ke 60 detik
      setTimer(60);
      // Di sini nantinya kamu bisa memanggil fungsi API untuk mengirim ulang OTP ke email
      console.log('OTP Resent!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isOtpLengkap = otp.every(digit => digit !== '');
    
    if (!isOtpLengkap) {
      setError('Silakan isi seluruh digit kode OTP terlebih dahulu!');
      return;
    }

    navigate('/reset-password', { state: { email: emailTerdaftar } });
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative flex items-center justify-center w-full mb-6">
        <button 
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="absolute left-0 border border-red-200 rounded-lg p-2 text-red-600 hover:bg-red-50 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-red-600">Verify OTP</h1>
      </div>
      
      <div className="w-40 h-32 mb-6 flex justify-center items-center">
         <img 
            src="/verify-illustration.png" 
            alt="Verify OTP Illustration" 
            className="w-full h-full object-contain"
         />
      </div>

      <p className="text-sm text-red-800/70 text-center mb-8 px-4">
        A 4 digit OTP has been sent to <br/>
        <span className="font-semibold text-red-600 break-all">{emailTerdaftar}</span>
      </p>

      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex justify-center gap-4 mb-2">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={data}
              ref={inputRefs[index]}
              onChange={e => handleChange(e.target.value, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              className="w-14 h-14 text-center text-2xl font-bold text-red-700 bg-transparent border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-600 text-center mb-4 font-medium">{error}</p>
        )}

        <div className="text-center mb-8">
          {/* Logika Tampilan Tombol Resend OTP */}
          <button 
            type="button" 
            onClick={handleResendOTP}
            disabled={timer > 0}
            className={`text-sm font-semibold transition ${
              timer > 0 
                ? 'text-red-400 cursor-not-allowed' 
                : 'text-red-600 hover:text-red-800'
            }`}
          >
            Resend OTP <span className="font-normal">({formatTime(timer)})</span>
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition duration-200"
        >
          Verify
        </button>
      </form>
    </div>
  );
}