import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CampusMap from '../../components/CampusMap'; // Import komponen peta

export default function Home() {
  const navigate = useNavigate();
  const [activeCampus, setActiveCampus] = useState('Ganesha');

  const parkingCards = [
    { name: 'GKU Timur Parking', spots: 24, walk: '3 min walk' },
    { name: 'Labtek 5 Parking', spots: 12, walk: '2 min walk' },
    { name: 'GKU 1 Parking', spots: 18, walk: '4 min walk' },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Cards Availability Top Section */}
      <div className="bg-white border border-red-100 rounded-3xl p-4 shadow-xs z-10">
        <div className="flex items-center gap-6 mb-4">
          <div className="bg-red-600 text-white w-11 h-11 flex items-center justify-center rounded-xl font-bold text-lg shadow-xs">P</div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Parking Availability</h2>
            <p className="text-[11px] text-gray-400">Updated just now</p>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-extrabold text-red-600">62%</h2>
            <p className="text-[11px] text-gray-400">Campus Availability</p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {parkingCards.map((area, idx) => (
            <div key={idx} className="min-w-[210px] border border-gray-100 rounded-2xl p-4 bg-white shadow-xs">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="bg-[#3A5A40] text-white w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs">P</div>
                <h3 className="font-bold text-gray-800 text-xs leading-tight">{area.name}</h3>
              </div>
              <div className="flex justify-between items-end mb-2 pb-2 border-b border-gray-100">
                <span className="text-[9px] text-[#3A5A40] bg-[#E8F0E9] px-2 py-0.5 rounded font-bold uppercase">Available</span>
                <div className="text-right leading-none">
                  <span className="text-lg font-extrabold text-gray-800">{area.spots}</span>
                  <span className="text-[10px] text-gray-400 ml-1">spots</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 font-medium mb-1">🚶 {area.walk}</p>
              <p className="text-[9px] text-[#3A5A40] font-bold flex items-center gap-1 mb-2">✔️ Available on arrival</p>
              <button 
                onClick={() => navigate('/map', { state: { selectedLocation: area.name.replace(' Parking', '') } })}
                className="w-full py-1.5 text-red-600 border border-red-100 rounded-lg text-[11px] font-bold hover:bg-red-50 transition"
              >
                View Details
              </button>
            </div>
          ))}
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