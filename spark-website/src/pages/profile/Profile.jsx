import React, { useState } from 'react';
import { LogOut, Mail, Lock, User, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  const [userData] = useState({
    name: 'Andi Makmur',
    email: 'andimakmur22@gmail.com',
    role: 'Student'
  });

  // State yang mengontrol ON (true) / OFF (false)
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [morningUpdatesEnabled, setMorningUpdatesEnabled] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col relative h-full">
      <div className="absolute top-0 right-4 z-10">
        <h2 className="text-3xl font-extrabold text-[#C82A2A]">Profile</h2>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-3xl flex gap-16 items-center">
          
          <div className="flex flex-col items-center">
            <div className="relative mb-5">
              <div className="w-40 h-40 bg-[#FFEDD5] rounded-full border-[6px] border-white shadow-xl flex items-center justify-center overflow-hidden">
                <img src="/avatar-placeholder.png" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-1 right-1 bg-white text-[#C82A2A] p-2.5 rounded-full shadow-md border border-gray-100 hover:bg-red-50 transition cursor-pointer">
                ✎
              </button>
            </div>
            
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">{userData.name}</h2>
            
            <span className="bg-[#FBE8E8] text-[#C82A2A] text-xs font-extrabold px-4 py-1.5 rounded-full flex items-center gap-2">
              🎓 {userData.role}
            </span>
          </div>

          <div className="flex-1 space-y-8 bg-white/50 p-6 rounded-3xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-red-100 pb-3">
                <span className="text-sm text-gray-500 flex items-center gap-3 font-semibold"><Mail size={16}/> Email</span>
                <span className="text-sm font-bold text-gray-700">{userData.email} {'>'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-red-100 pb-3">
                <span className="text-sm text-gray-500 flex items-center gap-3 font-semibold"><Lock size={16}/> Password</span>
                <span className="text-sm font-bold text-gray-700">******** {'>'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-red-100 pb-3">
                <span className="text-sm text-gray-500 flex items-center gap-3 font-semibold"><User size={16}/> Role</span>
                <span className="text-sm font-bold text-gray-700">{userData.role} {'>'}</span>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-bold text-[#C82A2A] flex items-center gap-2 mb-4">
                <Bell size={16} /> Notifications
              </h3>
              
              <div className="space-y-3">
                
                {/* INTERAKTIF TOGGLE: Parking Alerts */}
                <div 
                  onClick={() => setAlertsEnabled(!alertsEnabled)}
                  className="flex items-center justify-between bg-white border border-red-100 px-5 py-3 rounded-2xl shadow-sm cursor-pointer select-none"
                >
                  <span className={`text-sm font-bold transition-colors ${alertsEnabled ? 'text-gray-700' : 'text-gray-400'}`}>
                    Parking Alerts
                  </span>
                  {/* Struktur Switch Button */}
                  <div className={`w-11 h-6 rounded-full relative shadow-inner transition-colors duration-200 ease-in-out ${alertsEnabled ? 'bg-[#C82A2A]' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md transform transition-transform duration-200 ease-in-out ${alertsEnabled ? 'translate-x-5.5 left-0' : 'translate-x-0 left-0.5'}`}></div>
                  </div>
                </div>
                
                {/* INTERAKTIF TOGGLE: Morning Updates */}
                <div 
                  onClick={() => setMorningUpdatesEnabled(!morningUpdatesEnabled)}
                  className="flex items-center justify-between bg-white border border-red-100 px-5 py-3 rounded-2xl shadow-sm cursor-pointer select-none"
                >
                  <span className={`text-sm font-bold transition-colors ${morningUpdatesEnabled ? 'text-gray-700' : 'text-gray-400'}`}>
                    Morning Updates
                  </span>
                  {/* Struktur Switch Button */}
                  <div className={`w-11 h-6 rounded-full relative shadow-inner transition-colors duration-200 ease-in-out ${morningUpdatesEnabled ? 'bg-[#C82A2A]' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md transform transition-transform duration-200 ease-in-out ${morningUpdatesEnabled ? 'translate-x-5.5 left-0' : 'translate-x-0 left-0.5'}`}></div>
                  </div>
                </div>

              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full bg-[#C82A2A] hover:bg-red-800 text-white font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-md mt-4"
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}