import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CampusMap from '../../components/CampusMap'; 
import api from '../../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [activeCampus, setActiveCampus] = useState('Ganesha');
  const [areas, setAreas] = useState([]);

  // Fetch status secara real-time dari backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/parking/status');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAreas(data);
      } catch (err) {
        console.error('Gagal memuat status parking dashboard:', err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); 
    return () => clearInterval(interval);
  }, []);

  // Filter area berdasarkan klaster koordinat wilayah kampus
  const displayedAreas = areas.filter(a => 
    activeCampus === 'Ganesha' ? a.latitude > -6.92 : a.latitude <= -6.92
  );

  // Kalkulasi persentase ketersediaan wilayah kampus aktif
  const totalSlots = displayedAreas.reduce((sum, a) => sum + (a.total_slots || 0), 0);
  const availableSlots = displayedAreas.reduce((sum, a) => sum + (a.available_slots || 0), 0);
  const availabilityPercent = totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Cards Availability Top Section */}
      <div className="bg-white border border-red-100 rounded-3xl p-4 shadow-xs z-10">
        <div className="flex items-center gap-6 mb-4">
          <div className="bg-red-600 text-white w-11 h-11 flex items-center justify-center rounded-xl font-bold text-lg shadow-xs">P</div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Parking Availability</h2>
            <p className="text-[11px] text-gray-400">Live Campus Update</p>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-extrabold text-red-600">{availabilityPercent}%</h2>
            <p className="text-[11px] text-gray-400">Total Availability</p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {displayedAreas.length > 0 ? displayedAreas.map((area) => (
            <div key={area.id} className="min-w-[210px] border border-gray-100 rounded-2xl p-4 bg-white shadow-xs">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="bg-[#3A5A40] text-white w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs">P</div>
                <h3 className="font-bold text-gray-800 text-xs leading-tight">{area.name}</h3>
              </div>
              <div className="flex justify-between items-end mb-2 pb-2 border-b border-gray-100">
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                  area.status_label === 'full' ? 'bg-red-100 text-red-600' : 'bg-[#E8F0E9] text-[#3A5A40]'
                }`}>
                  {area.status_label || 'Available'}
                </span>
                <div className="text-right leading-none">
                  <span className="text-lg font-extrabold text-gray-800">{area.available_slots}</span>
                  <span className="text-[10px] text-gray-400 ml-1">spots</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 font-medium mb-1">🚗 Occupied: {area.occupied_slots}</p>
              <button 
                onClick={() => navigate('/map', { state: { selectedLocation: area.name } })}
                className="w-full mt-2 py-1.5 text-red-600 border border-red-100 rounded-lg text-[11px] font-bold hover:bg-red-50 transition"
              >
                View Details
              </button>
            </div>
          )) : (
            <p className="text-sm text-gray-400 italic py-2 px-4">Loading campus data information...</p>
          )}
        </div>
      </div>

      {/* Map Section Box */}
      <div className="flex-1 flex gap-6 min-h-0 mt-1">
        <div className="flex-1 rounded-3xl overflow-hidden border border-red-200 bg-gray-50 relative flex flex-col z-0">
          <div className="absolute inset-0 w-full h-full z-0 opacity-95">
            <CampusMap campus={activeCampus} />
          </div>
          <div className="absolute inset-x-4 top-4 flex gap-2 z-10">
            {['Ganesha', 'Jatinangor'].map((campus) => (
              <button
                key={campus}
                onClick={() => setActiveCampus(campus)}
                className={`px-5 py-2 rounded-full font-bold text-xs shadow-md transition ${
                  activeCampus === campus ? 'bg-[#3A5A40] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📍 ITB {campus}
              </button>
            ))}
          </div>
        </div>

        <div className="w-[280px] flex flex-col justify-center pr-2">
          <h3 className="text-xl font-extrabold text-red-600 mb-2 leading-tight">Monitor Map in Real-Time</h3>
          <p className="text-xs text-red-900/70 leading-relaxed font-medium">
            Sistem dasbor cerdas terintegrasi penuh dengan pemrosesan komputer visi model YOLOv8 langsung dari simpul tangkapan kamera ESP32-CAM di area parkir luar ruangan ITB Ganesha dan Jatinangor.
          </p>
        </div>
      </div>
    </div>
  );
}