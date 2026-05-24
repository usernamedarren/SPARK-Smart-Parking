import React, { useState, useEffect } from 'react';
import { LogOut, Mail, Lock, User, Bell, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Profile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(() => {
    try {
      const savedUser = localStorage.getItem('spark_user');
      return savedUser ? JSON.parse(savedUser) : {
        name: 'Andi Makmur',
        email: 'andimakmur22@gmail.com',
        role: 'mahasiswa'
      };
    } catch {
      return {
        name: 'Andi Makmur',
        email: 'andimakmur22@gmail.com',
        role: 'mahasiswa'
      };
    }
  });

  // State yang mengontrol ON (true) / OFF (false)
  const alertsEnabled = userData.notification_preference ?? true;
  const [morningUpdatesEnabled, setMorningUpdatesEnabled] = useState(false);

  // Edit Mode States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(userData.name);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        setUserData(res.data);
        setEditedName(res.data.name);
        localStorage.setItem('spark_user', JSON.stringify(res.data));
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    fetchUserProfile();
  }, []);

  const getRoleLabel = (role) => {
    if (!role) return 'Mahasiswa';
    const cleanRole = role.toLowerCase();
    if (cleanRole === 'mahasiswa') return 'Mahasiswa';
    if (cleanRole === 'tenaga_didik') return 'Tenaga Didik';
    return role;
  };

  // Change Password States
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // Popups & Toast
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    localStorage.removeItem('spark_token');
    localStorage.removeItem('spark_user');
    
    console.log('User logged out');
    navigate('/login');
  };

  const handleSaveClick = () => {
    if (!editedName.trim()) {
      showToast('Name cannot be empty.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    try {
      const res = await api.put('/user/profile', { name: editedName });
      setUserData(prev => ({ ...prev, name: res.data.name }));
      localStorage.setItem('spark_user', JSON.stringify(res.data));
      window.dispatchEvent(new Event('spark_user_updated'));
      setIsEditingProfile(false);
      showToast('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile. Make sure server is connected.');
    }
  };

  const handleSavePassword = async () => {
    if (newPassword.length < 6) {
      setPassError('Password minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Password dan Konfirmasi Password tidak cocok!');
      return;
    }

    setPassLoading(true);
    setPassError('');
    try {
      await api.put('/user/password', { new_password: newPassword });
      setPassSuccess(true);
      setTimeout(() => {
        setIsChangingPassword(false);
        setPassSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setPassError(err.response?.data?.detail || 'Failed to change password. Make sure server is connected.');
    } finally {
      setPassLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="flex-1 flex flex-col relative h-full">
      <div className="absolute top-0 right-4 z-10">
        <h2 className="text-3xl font-extrabold text-[#C82A2A]">Profile</h2>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-4 py-2.5 rounded-full shadow-lg z-50 font-semibold animate-pulse">
          {toastMsg}
        </div>
      )}

      {/* Save Profile Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-xl w-full max-w-sm space-y-4 text-center">
            <h3 className="text-lg font-bold text-gray-800 flex items-center justify-center gap-2">
              ⚠️ Confirm Changes
            </h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Apakah Anda yakin ingin menyimpan perubahan nama profil Anda menjadi <span className="text-red-600 font-extrabold">"{editedName}"</span>?
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleConfirmSave}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Ya, Simpan
              </button>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              🔐 Change Password
            </h3>
            
            {passError && (
              <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-xl border border-red-100 font-semibold">
                ⚠️ {passError}
              </div>
            )}
            {passSuccess && (
              <div className="bg-green-50 text-green-600 text-xs px-3 py-2 rounded-xl border border-green-100 font-semibold">
                ✔️ Password changed successfully!
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleSavePassword}
                disabled={passLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-sm transition"
              >
                {passLoading ? 'Saving...' : 'Save Password'}
              </button>
              <button 
                onClick={() => { setIsChangingPassword(false); setPassError(''); setPassSuccess(false); setNewPassword(''); setConfirmPassword(''); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-3xl flex gap-16 items-center">
          
          <div className="w-64 flex flex-col items-center shrink-0">
            <div className="relative mb-5">
              <div className="w-40 h-40 bg-[#FFEDD5] rounded-full border-[6px] border-white shadow-xl flex items-center justify-center overflow-hidden">
                <img src="/avatar-placeholder.png" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              {!isEditingProfile && (
                <button 
                  onClick={() => { setIsEditingProfile(true); setEditedName(userData.name); }}
                  className="absolute bottom-1 right-1 bg-white text-[#C82A2A] p-2.5 rounded-full shadow-md border border-gray-100 hover:bg-red-50 transition cursor-pointer"
                >
                  ✎
                </button>
              )}
            </div>
            
            <div className="h-10 flex items-center justify-center mb-2">
              {isEditingProfile ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="border border-red-200 rounded-xl px-3 py-1.5 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-red-500 w-48"
                  placeholder="Enter name"
                />
              ) : (
                <h2 className="text-2xl font-extrabold text-gray-800">
                  {userData.name}
                </h2>
              )}
            </div>
            
            <span className="bg-[#FBE8E8] text-[#C82A2A] text-xs font-extrabold px-4 py-1.5 rounded-full flex items-center gap-2 capitalize">
              🎓 {getRoleLabel(userData.role)}
            </span>
          </div>

          <div className="flex-1 space-y-8 bg-white/50 p-6 rounded-3xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-red-100 pb-3">
                <span className="text-sm text-gray-500 flex items-center gap-3 font-semibold"><Mail size={16}/> Email</span>
                <span className="text-sm font-bold text-gray-700">{userData.email}</span>
              </div>

              <div className="flex items-center justify-between border-b border-red-100 pb-3">
                <span className="text-sm text-gray-500 flex items-center gap-3 font-semibold"><Lock size={16}/> Password</span>
                {isEditingProfile ? (
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="text-sm font-extrabold text-[#C82A2A] hover:text-red-800 hover:underline transition-colors"
                  >
                    Change Password
                  </button>
                ) : (
                  <span className="text-sm font-bold text-gray-400 tracking-widest">********</span>
                )}
              </div>

              <div className="flex items-center justify-between border-b border-red-100 pb-3">
                <span className="text-sm text-gray-500 flex items-center gap-3 font-semibold"><User size={16}/> Role</span>
                <span className="text-sm font-bold text-gray-700 capitalize">{getRoleLabel(userData.role)}</span>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-bold text-[#C82A2A] flex items-center gap-2 mb-4">
                <Bell size={16} /> Notifications
              </h3>
              
              <div className="space-y-3">
                
                {/* INTERAKTIF TOGGLE: Parking Alerts */}
                <div 
                  onClick={async () => {
                    const newValue = !alertsEnabled;
                    try {
                      const res = await api.put('/user/notifications', { notification_preference: newValue });
                      setUserData(res.data);
                      localStorage.setItem('spark_user', JSON.stringify(res.data));
                      showToast(newValue ? 'Parking alerts enabled.' : 'Parking alerts disabled.');
                    } catch (err) {
                      console.error(err);
                      showToast('Failed to update notification preference.');
                    }
                  }}
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

            {isEditingProfile ? (
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => { setIsEditingProfile(false); setEditedName(userData.name); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold h-12 rounded-2xl transition flex items-center justify-center gap-2 shadow-md text-sm"
                >
                  <X size={16} /> Cancel
                </button>
                <button 
                  onClick={handleSaveClick}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-2xl transition flex items-center justify-center gap-2 shadow-md text-sm"
                >
                  <Check size={16} /> Confirm Changes
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogout}
                className="w-full bg-[#C82A2A] hover:bg-red-800 text-white font-bold h-12 rounded-2xl transition flex items-center justify-center gap-2 shadow-md mt-4 text-sm"
              >
                <LogOut size={18} /> Log Out
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}