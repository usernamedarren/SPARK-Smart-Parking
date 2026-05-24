import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CampusMap from '../../components/CampusMap'; // Import komponen peta
import api from '../../services/api';

const nameMapping = {
  'GKUT': 'GKU Timur Parking',
  'GKUB': 'GKU Barat Parking',
  'LABTEK 5': 'Labtek 5 Parking',
  'LABTEK 8': 'Labtek 8 Parking',
  'FSRD': 'FSRD Parking',
  'GKU 1': 'GKU 1 Parking',
  'GKU 2': 'GKU 2 Parking',
  'GKU 3': 'GKU 3 Parking',
  'REKTORAT': 'Rektorat Parking',
};

const walkMapping = {
  'GKUT': '3 min walk',
  'GKUB': '4 min walk',
  'LABTEK 5': '2 min walk',
  'LABTEK 8': '2 min walk',
  'FSRD': '3 min walk',
  'GKU 1': '4 min walk',
  'GKU 2': '5 min walk',
  'GKU 3': '4 min walk',
  'REKTORAT': '6 min walk',
};

export default function Home() {
  const navigate = useNavigate();
  const [activeCampus, setActiveCampus] = useState('Ganesha');
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/parking/status');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAreas(data);
      } catch (err) {
        console.error('Gagal mengambil status parkir:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // Auto-refresh setiap 15 detik
    return () => clearInterval(interval);
  }, []);

  // Filter area berdasarkan kampus terpilih
  const campusAreas = areas.filter(area => {
    const isJatinangor = area.latitude <= -6.92;
    return activeCampus === 'Jatinangor' ? isJatinangor : !isJatinangor;
  });

  // Jika data masih loading atau gagal, gunakan dummy fallback
  const displayAreas = campusAreas.length > 0 ? campusAreas : (
    activeCampus === 'Ganesha' ? [
      { name: 'LABTEK 5', available_slots: 12, total_slots: 20, status_label: 'available' },
      { name: 'GKUT', available_slots: 24, total_slots: 30, status_label: 'available' },
      { name: 'GKUB', available_slots: 18, total_slots: 25, status_label: 'available' },
    ] : [
      { name: 'GKU 1', available_slots: 22, total_slots: 40, status_label: 'available' },
      { name: 'GKU 2', available_slots: 28, total_slots: 35, status_label: 'available' },
      { name: 'GKU 3', available_slots: 31, total_slots: 45, status_label: 'available' },
    ]
  );

  // Hitung persentase ketersediaan kampus secara dinamis
  const totalSlots = displayAreas.reduce((acc, curr) => acc + (curr.total_slots || 0), 0);
  const totalAvailable = displayAreas.reduce((acc, curr) => acc + (curr.available_slots || 0), 0);
  const availabilityPercentage = totalSlots > 0 ? Math.round((totalAvailable / totalSlots) * 100) : 0;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Cards Availability Top Section */}
      <div className="bg-white border border-red-100 rounded-3xl p-4 shadow-xs z-10">
        <div className="flex items-center gap-6 mb-4">
          <div className="bg-red-600 text-white w-11 h-11 flex items-center justify-center rounded-xl font-bold text-lg shadow-xs">P</div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Parking Availability</h2>
            <p className="text-[11px] text-gray-400">{loading ? 'Loading...' : 'Updated just now'}</p>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-extrabold text-red-600">{availabilityPercentage}%</h2>
            <p className="text-[11px] text-gray-400">Campus Availability</p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {displayAreas.map((area, idx) => {
            const mappedName = nameMapping[area.name] || `${area.name} Parking`;
            const walkTime = walkMapping[area.name] || '3 min walk';
            const isFull = area.available_slots === 0 || area.status_label === 'full';
            
            return (
              <div key={idx} className="min-w-[210px] border border-gray-100 rounded-2xl p-4 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="bg-[#3A5A40] text-white w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs">P</div>
                  <h3 className="font-bold text-gray-800 text-xs leading-tight">{mappedName}</h3>
                </div>
                <div className="flex justify-between items-end mb-2 pb-2 border-b border-gray-100">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    isFull ? 'text-red-600 bg-red-50' : 'text-[#3A5A40] bg-[#E8F0E9]'
                  }`}>
                    {isFull ? 'Full' : 'Available'}
                  </span>
                  <div className="text-right leading-none">
                    <span className="text-lg font-extrabold text-gray-800">{area.available_slots}</span>
                    <span className="text-[10px] text-gray-400 ml-1">/{area.total_slots}</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mb-1">🚶 {walkTime}</p>
                <p className={`text-[9px] font-bold flex items-center gap-1 mb-2 ${
                  isFull ? 'text-red-600' : 'text-[#3A5A40]'
                }`}>
                  {isFull ? '❌ No spots left' : '✔️ Available on arrival'}
                </p>
                <button 
                  onClick={() => navigate('/map', { state: { selectedLocation: area.name } })}
                  className="w-full py-1.5 text-red-600 border border-red-100 rounded-lg text-[11px] font-bold hover:bg-red-50 transition"
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Section Box dengan Switcher Kampus */}
      <div className="flex-1 flex gap-6 min-h-0 mt-1">
        
        {/* Interactive Control Map Area */}
        <div className="flex-1 rounded-3xl overflow-hidden border border-red-200 bg-gray-50 relative flex flex-col z-0">
          
          {/* Implementasi Peta Asli */}
          <div className="absolute inset-0 w-full h-full z-0 opacity-90">
            <CampusMap campus={activeCampus} />
          </div>
          
          {/* Overlay Kontrol Pindah Wilayah Kampus (Ganesha / Jatinangor) */}
          <div className="absolute inset-x-4 top-4 flex gap-2 z-10">
            {['Ganesha', 'Jatinangor'].map((campus) => (
              <button
                key={campus}
                onClick={() => setActiveCampus(campus)}
                className={`px-5 py-2 rounded-full font-bold text-xs shadow-md transition ${
                  activeCampus === campus 
                    ? 'bg-[#3A5A40] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📍 ITB {campus}
              </button>
            ))}
          </div>

          {/* Grid tombol-tombol nama lokasi melayang sebelumnya sudah dihapus dari sini */}
        </div>

        {/* Deskripsi Samping */}
        <div className="w-[280px] flex flex-col justify-center pr-2">
          <h3 className="text-xl font-extrabold text-red-600 mb-2 leading-tight">Monitor Map in Real-Time</h3>
          <p className="text-xs text-red-900/70 leading-relaxed font-medium">
            Select your campus area using the toggle buttons above to switch the map focus. Explore available parking directly by interacting with the custom pointers located straight on the map view. You can freely drag and zoom to check live data!
          </p>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3A5A40]"></span> Available</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Limited</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Full</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Your Location</div>
        <div className="ml-auto text-gray-400 font-medium">Peak hours: 09.00 - 12.00</div>
      </div>
    </div>
  );
}