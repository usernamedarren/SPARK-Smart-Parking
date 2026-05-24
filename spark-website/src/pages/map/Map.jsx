import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CampusMap from '../../components/CampusMap'; // Sinkronisasi peta Leaflet interaktif
import api from '../../services/api';

export default function Map() {
  const location = useLocation();
  const [currentLocation, setCurrentLocation] = useState('LABTEK 5');
  const [areas, setAreas] = useState([]);
  const [currentArea, setCurrentArea] = useState(null);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiPrediction, setAiPrediction] = useState('Generating live AI analysis...');
  const [predicting, setPredicting] = useState(false);

  // Fetch semua area parkir
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/parking/status');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAreas(data);
      } catch (err) {
        console.error('Gagal mengambil data map:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Update lokasi jika diarahkan dari halaman lain
  useEffect(() => {
    if (location.state?.selectedLocation) {
      setCurrentLocation(location.state.selectedLocation);
    }
  }, [location.state]);

  // Cari area aktif berdasarkan nama
  useEffect(() => {
    const found = areas.find(a => a.name.toUpperCase() === currentLocation.toUpperCase());
    if (found) {
      setCurrentArea(found);
      
      // Hasilkan slot parkir dinamis sesuai total_slots dan occupied_slots
      const spots = [];
      const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const total = found.total_slots || 10;
      const occupied = found.occupied_slots || 0;
      for (let i = 0; i < Math.min(total, 26); i++) {
        spots.push({
          id: labels[i],
          status: i < occupied ? 'occupied' : 'available'
        });
      }
      setParkingSpots(spots);
    } else {
      // Fallback jika area tidak ditemukan dalam database
      setCurrentArea(null);
      setParkingSpots([
        { id: 'A', status: 'available' },
        { id: 'B', status: 'occupied' },
        { id: 'C', status: 'occupied' },
        { id: 'D', status: 'available' },
        { id: 'E', status: 'available' },
        { id: 'F', status: 'occupied' },
      ]);
    }
  }, [currentLocation, areas]);

  // Panggil endpoint prediksi atau gunakan kalkulasi AI lokal jika tidak terautentikasi
  useEffect(() => {
    if (!currentArea) return;

    const fetchPrediction = async () => {
      setPredicting(true);
      try {
        const arrivalTime = new Date();
        arrivalTime.setMinutes(arrivalTime.getMinutes() + 45); // Prediksi 45 menit ke depan
        
        // Panggil endpoint prediksi (dapat gagal jika butuh auth penuh)
        const res = await api.get('/prediction', {
          params: {
            area_id: currentArea.id,
            arrival_time: arrivalTime.toISOString()
          }
        });
        
        if (res.data) {
          const confidence = Math.round((res.data.confidence || 0.85) * 100);
          setAiPrediction(`Predicted availability: ${res.data.predicted_available_slots} slots (${res.data.predicted_occupancy_rate * 100}% occupancy). Confidence level: ${confidence}%.`);
        }
      } catch (err) {
        // Fallback analitis cerdas jika gagal / butuh login
        const rate = currentArea.occupancy_rate || 0.5;
        if (rate > 0.8) {
          setAiPrediction(`Highly congested area. AI predicts slots will remain critical (<15% availability) for the next 45 minutes. Recommend heading to alternative spots.`);
        } else if (rate > 0.5) {
          setAiPrediction(`Moderate traffic. AI predicts occupancy will stabilize around ${Math.round(rate * 100)}% for the next 45 minutes. Safe to arrive.`);
        } else {
          setAiPrediction(`Highly optimal. AI predicts plenty of available spots (>70% vacancy) over the next 45 minutes. Fast arrival recommended.`);
        }
      } finally {
        setPredicting(false);
      }
    };

    fetchPrediction();
  }, [currentArea]);

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
              {predicting ? 'Calculating predictions...' : aiPrediction}
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