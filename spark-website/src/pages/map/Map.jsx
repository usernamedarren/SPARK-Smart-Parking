import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CampusMap from '../../components/CampusMap'; // Sinkronisasi peta Leaflet interaktif

export default function Map() {
  const location = useLocation();
  // Ambil data lokasi dari rute sebelumnya, default ke 'LABTEK 5'
  const [currentLocation, setCurrentLocation] = useState('LABTEK 5');

  // 1. DATA SIMULASI SLOT PARKIR (Akan diganti dengan API nanti)
  // Data ini menentukan apakah slot kosong atau berisi mobil.
  const [parkingSpots, setParkingSpots] = useState([
    { id: 'A', status: 'available' },
    { id: 'B', status: 'occupied' }, // Penuh
    { id: 'C', status: 'occupied' }, // Penuh
    { id: 'D', status: 'available' },
    { id: 'E', status: 'available' },
    { id: 'F', status: 'occupied' }, // Penuh (Sebelumnya tulisan 'Full', sekarang jadi Mobil)
    { id: 'G', status: 'occupied' }, // Simulasi slot tambahan
    { id: 'H', status: 'occupied' }, // Simulasi slot tambahan
  ]);

  useEffect(() => {
    if (location.state?.selectedLocation) {
      setCurrentLocation(location.state.selectedLocation);
      // Di sini nantinya kamu bisa memanggil API untuk mengambil data parkingSpots 
      // yang sebenarnya berdasarkan currentLocation (misal: Labtek 5)
    }
  }, [location.state]);

  // Logika penentuan fokus peta kampus
  const jatinangorLocations = ['GKU 1', 'GKU 2', 'GKU 3', 'REKTORAT'];
  const mapFocusCampus = jatinangorLocations.includes(currentLocation) ? 'Jatinangor' : 'Ganesha';

  return (
    <div className="flex flex-col h-full gap-4 relative">
      
      {/* Title Halaman Melayang di Pojok Kanan Atas */}
      <div className="absolute top-0 right-4 z-10">
        <h2 className="text-3xl font-extrabold text-[#C82A2A]">Map</h2>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 z-0">
        
        {/* Main Map Visual (Left Side) */}
        <div className="flex-[3] bg-white border border-red-200 rounded-3xl relative overflow-hidden shadow-xs z-0">
          
          {/* Implementasi Peta Leaflet Asli */}
          <div className="absolute inset-0 w-full h-full z-0 opacity-80">
            <CampusMap campus={mapFocusCampus} />
          </div>

          <div className="absolute top-6 left-6 bg-[#3A5A40] text-white px-5 py-2 rounded-full text-xs font-bold shadow-md z-10 flex items-center gap-2">
            <span className="text-base leading-none">📍</span> Current Selection: {currentLocation}
          </div>
        </div>

        {/* Slot Grid Allocation Side Panel (Right Side) */}
        <div className="flex-[2] flex flex-col gap-4 z-10 pr-2">
          <div className="bg-white border border-red-100 rounded-3xl p-5 shadow-xs flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm">P</div>
              <h3 className="font-extrabold text-gray-800 text-base uppercase tracking-wide">{currentLocation}</h3>
            </div>
            
            {/* 2. TAMPILAN GRID SLOT DINAMIS MENGGUNAKAN MAP & KONDISI */}
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3 content-start overflow-y-auto pr-1">
              
              {parkingSpots.map((spot) => (
                <div 
                  key={spot.id}
                  // Styling wadah luar disesuaikan berdasarkan status
                  className={`rounded-xl p-2 flex flex-col justify-center items-center shadow-inner min-h-[80px] transition-colors ${
                    spot.status === 'occupied'
                      ? 'bg-gray-100 border border-gray-200' // Styling Penuh
                      : 'border border-green-200 bg-[#F4F9F5] shadow-xs' // Styling Kosong
                  }`}
                >
                  {/* LOGIKA KONDISIONAL: MOBIL ATAU TULISAN AVAILABLE */}
                  {spot.status === 'occupied' ? (
                    // JIKA PENUH/ADA MOBIL: Tampilkan GAMBAR MOBIL
                    <img 
                      src="/car-top-view.png" // Mengambil dari folder public/
                      alt="Occupied" 
                      className="h-14 w-auto object-contain opacity-90" 
                    />
                  ) : (
                    // JIKA KOSONG: Tampilkan Huruf Blok & Tulisan AVAILABLE
                    <>
                      <span className="font-bold text-[#3A5A40] block text-xl mb-0.5 leading-none">
                        {spot.id}
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#3A5A40] mt-1">
                        Available
                      </span>
                    </>
                  )}
                </div>
              ))}

            </div>
          </div>

          {/* AI Prediction Box */}
          <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-2xl p-4 shadow-xs">
            <h4 className="font-bold text-red-600 text-xs mb-1.5 flex items-center gap-1.5">
               <span className="text-sm">✨</span> AI Analysis Prediction
            </h4>
            <p className="text-[11px] text-red-900/80 leading-relaxed font-medium">
              Real-time calculations estimate slots for <span className="font-bold text-red-700">{currentLocation}</span> will remain optimal for the next 45 minutes.
            </p>
          </div>
        </div>

      </div>

      {/* Legend Footer */}
      <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500 pt-2 border-t border-gray-100 z-10">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3A5A40]"></span> Available</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Limited</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Full</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Your Location</div>
        <div className="ml-auto text-gray-400 font-medium">Peak hours: 09.00 - 12.00</div>
      </div>
    </div>
  );
}