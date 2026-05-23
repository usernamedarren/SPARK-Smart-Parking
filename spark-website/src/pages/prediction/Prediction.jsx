import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CampusMap from '../../components/CampusMap'; // Menggunakan komponen peta interaktif asli

export default function Prediction() {
  const navigate = useNavigate();
  const [campus, setCampus] = useState('Ganesha');
  const [location, setLocation] = useState('');

  // Pembagian wilayah sesuai poin 2
  const campusData = {
    Ganesha: ['LABTEK 5', 'LABTEK 8', 'FSRD', 'GKUB', 'GKUT', 'CADL', 'ALBAR', 'ALTIM'],
    Jatinangor: ['GKU 1', 'GKU 2', 'GKU 3', 'REKTORAT']
  };

  // Poin 3: Data rekomendasi otomatis muncul berdasarkan area yang dipilih
  const recommendations = location ? [
    { name: `${location} Main Parking`, spots: 24, walk: '1 min walk' },
    { name: campus === 'Ganesha' ? 'GKU Timur Parking' : 'GKU 2 Parking', spots: 12, walk: '3 min walk' },
  ] : [];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Poin 2: Menyamakan bagian map agar interaktif dengan pilihan ITB Ganesha dan Jatinangor */}
        <div className="flex-[3] bg-white border border-red-200 rounded-3xl relative overflow-hidden shadow-xs z-0">
          <div className="absolute inset-0 w-full h-full opacity-80">
            <CampusMap campus={campus} />
          </div>
          <div className="absolute top-6 left-6 bg-[#3A5A40] text-white px-5 py-2 rounded-full text-xs font-bold shadow-md z-10">
            📍 Map View: ITB {campus}
          </div>
        </div>

        {/* Right Input & Recommendation Panel */}
        <div className="flex-[2] flex flex-col gap-5">
          {/* Predict Selector Form */}
          <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-[#C82A2A] text-lg mb-5">Predict Parking Availability</h3>
            
            {/* Poin 3: Memilih ITB Ganesha atau Jatinangor terlebih dahulu */}
            <div className="border border-red-200 rounded-2xl p-3 mb-4">
              <label className="text-[11px] text-[#C82A2A] font-bold block mb-1.5 uppercase tracking-wide">🏫 Select Campus</label>
              <select 
                value={campus} 
                onChange={(e) => { setCampus(e.target.value); setLocation(''); }}
                className="w-full text-sm outline-none text-gray-700 font-semibold bg-transparent cursor-pointer"
              >
                <option value="Ganesha">ITB Ganesha</option>
                <option value="Jatinangor">ITB Jatinangor</option>
              </select>
            </div>

            {/* Poin 3: Memilih wilayah yang ingin dituju */}
            <div className="border border-red-200 rounded-2xl p-3">
              <label className="text-[11px] text-[#C82A2A] font-bold block mb-1.5 uppercase tracking-wide">📍 Where?</label>
              <select 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm outline-none text-gray-700 font-semibold bg-transparent cursor-pointer"
              >
                <option value="" disabled>Select destination area...</option>
                {campusData[campus].map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            {/* Poin 4: Tombol predict dan pilihan tanggal/jam sudah dihapus dari sini */}
          </div>

          {/* Poin 3: Bagian rekomendasi wilayah parkir di bagian bawah */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="font-extrabold text-[#C82A2A] text-lg mb-1">Recommend Parking</h3>
            <p className="text-[10px] font-bold text-gray-400 mb-4">
              {location ? 'Optimal parking spots based on your destination' : 'Please select a destination area above to generate recommendations'}
            </p>
            
            {location && (
              <div className="space-y-4 overflow-y-auto pr-2 flex-1 max-h-[42vh]">
                {recommendations.map((item, index) => (
                  <div key={index} className="bg-white border border-[#A3B8A8] rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-[#3A5A40] text-white w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold">P</div>
                        <h4 className="font-extrabold text-gray-800 text-sm">{item.name}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">🚶 {item.walk}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-[#3A5A40] bg-[#E8F0E9] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Available</span>
                      <span className="text-sm font-extrabold text-gray-800">24 <span className="font-semibold text-gray-400 text-xs">spots</span></span>
                    </div>
                    {/* Saat diklik, langsung diarahkan ke halaman slot parkiran */}
                    <button 
                      onClick={() => navigate('/map', { state: { selectedLocation: location } })}
                      className="w-full py-2.5 text-[#3A5A40] border border-[#3A5A40]/30 rounded-xl text-xs font-bold hover:bg-[#F4F9F5] transition flex justify-center items-center gap-2"
                    >
                      <span className="text-lg leading-none">📍</span> Navigate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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