import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Home, Map as MapIcon, Video, Sparkles, User, Settings } from 'lucide-react';
import sparkLogo from '../assets/logo.png'; 
import bgInternal from '../assets/background-internal.jpg'; 
import api from '../services/api';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [userData, setUserData] = useState(() => {
    try {
      const savedUser = localStorage.getItem('spark_user');
      return savedUser ? JSON.parse(savedUser) : {
        name: 'Andi Makmur',
        role: 'mahasiswa'
      };
    } catch {
      return {
        name: 'Andi Makmur',
        role: 'mahasiswa'
      };
    }
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        setUserData(res.data);
        localStorage.setItem('spark_user', JSON.stringify(res.data));
      } catch (err) {
        console.error('Error fetching profile in MainLayout:', err);
      }
    };

    fetchUserProfile();

    const handleProfileUpdate = () => {
      try {
        const savedUser = localStorage.getItem('spark_user');
        if (savedUser) {
          setUserData(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('spark_user_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('spark_user_updated', handleProfileUpdate);
    };
  }, []);

  const getRoleLabel = (role) => {
    if (!role) return 'Mahasiswa';
    const cleanRole = role.toLowerCase();
    if (cleanRole === 'mahasiswa') return 'Mahasiswa';
    if (cleanRole === 'tenaga_didik') return 'Tenaga Didik';
    return role;
  };

  const isProfilePage = location.pathname === '/profile';

  // Format nama disamakan menjadi huruf kapital agar sinkron dengan state halaman lain
  const allLocations = [
    { name: 'LABTEK 5', campus: 'Ganesha' },
    { name: 'LABTEK 8', campus: 'Ganesha' },
    { name: 'FSRD', campus: 'Ganesha' },
    { name: 'GKUB', campus: 'Ganesha' },
    { name: 'GKUT', campus: 'Ganesha' },
    { name: 'CADL', campus: 'Ganesha' },
    { name: 'ALBAR', campus: 'Ganesha' },
    { name: 'ALTIM', campus: 'Ganesha' },
    { name: 'GKU 1', campus: 'Jatinangor' },
    { name: 'GKU 2', campus: 'Jatinangor' },
    { name: 'GKU 3', campus: 'Jatinangor' },
    { name: 'REKTORAT', campus: 'Jatinangor' },
  ];

  const filteredLocations = allLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (locName) => {
    setSearchQuery(''); // Kosongkan input setelah memilih
    setShowDropdown(false);

    // LOGIKA KONDISIONAL PENCARIAN
    if (location.pathname === '/view') {
      // Jika di halaman View, ganti kamera
      navigate('/view', { state: { selectedLocation: locName } });
    } else {
      // Sisanya, arahkan ke Map
      navigate('/map', { state: { selectedLocation: locName } });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/map', label: 'Map', icon: MapIcon },
    { path: '/view', label: 'View', icon: Video }, 
  ];

  return (
    <div 
      className="flex h-screen w-full font-sans overflow-hidden bg-[#FCF9F2]"
      style={{
        backgroundImage: `url(${bgInternal})`,
        backgroundSize: 'cover',
        backgroundPosition: 'right bottom',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <aside className="w-[280px] flex flex-col justify-between py-8 px-6 bg-[#FCF9F2] z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full">
        <div>
          <Link to="/" className="flex items-center gap-3 mb-12 pl-2 no-underline">
            <img src={sparkLogo} alt="SPARK Logo" className="h-15 w-auto object-contain" />
          </Link>

          <nav className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all text-sm no-underline"
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-red-600 rounded-r-md"></div>
                  )}
                  <Icon size={20} className={isActive ? 'text-red-600' : 'text-gray-500'} />
                  <span className={isActive ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-5">
          <div className="bg-gradient-to-b from-white to-red-50/50 border border-red-100 p-5 rounded-2xl text-center shadow-sm">
            <div className="flex justify-center mb-3">
              <Sparkles className="text-red-600" size={24} />
            </div>
            <h3 className="text-red-600 font-bold text-sm mb-4">AI for Parking<br/>Prediction</h3>
            <button 
              onClick={() => navigate('/prediction')}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl w-full transition shadow-md"
            >
              Try Now {'>'}
            </button>
          </div>

          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 w-full p-2.5 border border-red-600 bg-white rounded-2xl hover:bg-red-50 transition"
          >
            <div className="bg-red-600 text-white p-2 rounded-full">
              <User size={20} />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-red-700 leading-tight">{userData.name}</p>
              <p className="text-xs text-red-700/70 font-medium">{getRoleLabel(userData.role)}</p>
            </div>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden p-8 relative">
        {!isProfilePage && (
          <>
            <div className="flex justify-end items-end mb-4">
              <div className="text-right">
                <h1 className="text-[2.5rem] font-extrabold text-red-600 leading-none mb-1">Good Morning!</h1>
                <p className="text-red-400/90 text-sm font-semibold">Find & spot your parking space</p>
              </div>
            </div>

            <div className="relative w-full mb-6 z-30" ref={dropdownRef}>
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search location (e.g., LABTEK 5, GKU 1)" 
                className="w-full pl-12 pr-12 py-3.5 bg-white border border-red-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 text-sm shadow-sm font-medium text-gray-700"
              />
              <Settings className="absolute right-5 top-1/2 -translate-y-1/2 text-red-400" size={18} />

              {showDropdown && searchQuery && filteredLocations.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50 p-2">
                  {filteredLocations.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectLocation(loc.name)}
                      className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl flex justify-between items-center transition"
                    >
                      <span>{loc.name}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-400 font-bold px-2 py-0.5 rounded-md uppercase">{loc.campus}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex-1 bg-white/80 backdrop-blur-md border border-red-200 rounded-[2rem] p-6 shadow-sm overflow-hidden flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}