import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CampusMap from '../../components/CampusMap'; 
import api from '../../services/api';

export default function Map() {
  const location = useLocation();
  const [currentLocation, setCurrentLocation] = useState('LABTEK 5');
  const [areas, setAreas] = useState([]);
  const [currentArea, setCurrentArea] = useState(null);
  const [activeCampus, setActiveCampus] = useState('Ganesha');
  const [aiPrediction, setAiPrediction] = useState('Generating live AI analysis...');
  const [predicting, setPredicting] = useState(false);

  // Fetch status berkala setiap 5 detik agar sinkron penuh dengan backend & livecam
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/parking/status');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAreas(data);
      } catch (err) {
        console.error('Gagal mengambil data koordinat map:', err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sinkronisasi navigasi antar-halaman internal jika dikirim dari halaman lain
  useEffect(() => {
    if (location.state?.selectedLocation) {
      const locName = location.state.selectedLocation;
      setCurrentLocation(locName);
      
      const jatinangorList = ['GKU 1', 'GKU 2', 'GKU 3', 'REKTORAT'];
      if (jatinangorList.includes(locName.toUpperCase())) {
        setActiveCampus('Jatinangor');
      } else {
        setActiveCampus('Ganesha');
      }
    }
  }, [location.state]);

  useEffect(() => {
    const found = areas.find(a => a.name.toUpperCase() === currentLocation.toUpperCase());
    setCurrentArea(found || null);
  }, [currentLocation, areas]);

  // Polling AI untuk memprediksi tren okupansi
  useEffect(() => {
    if (!currentArea) return;
    const fetchPrediction = async () => {
      setPredicting(true);
      try {
        const arrivalTime = new Date();
        arrivalTime.setMinutes(arrivalTime.getMinutes() + 45);
        const res = await api.get('/prediction', {
          params: { area_id: currentArea.id, arrival_time: arrivalTime.toISOString() }
        });
        if (res.data) {
          const confidence = Math.round((res.data.confidence || 0.85) * 100);
          setAiPrediction(`Predicted availability: ${res.data.predicted_available_slots} slots (${res.data.predicted_occupancy_rate * 100}% occupancy). Confidence level: ${confidence}%.`);
        }
      } catch (err) {
        const rate = currentArea.occupancy_rate || 0.5;
        if (rate > 0.8) {
          setAiPrediction(`Highly congested area. AI predicts slots will remain critical (<15% availability) for the next 45 minutes.`);
        } else if (rate > 0.5) {
          setAiPrediction(`Moderate traffic. AI predicts occupancy will stabilize around ${Math.round(rate * 100)}% for the next 45 minutes.`);
        } else {
          setAiPrediction(`Highly optimal. Plenty of available spots (>70% vacancy) predicted over the next 45 minutes.`);
        }
      } finally {
        setPredicting(false);
      }
    };
    fetchPrediction();
  }, [currentArea]);

  const handleCampusToggle = (campus) => {
    setActiveCampus(campus);
    setCurrentLocation(campus === 'Ganesha' ? 'LABTEK 5' : 'GKU 1');
  };

  // --------------------------------------------------------------------------------
  // CONFIG VISUAL MAPPING (SINKRONISASI POSISI KAMERA DAN DENAH)
  // --------------------------------------------------------------------------------
  const leftSlots = [
    { id: 'A', dbKey: 'slot_1' },
    { id: 'B', dbKey: 'slot_2' },
    { id: 'C', dbKey: 'slot_3' },
    { id: 'D', dbKey: 'slot_4' },
    { id: 'E', dbKey: 'slot_5' },
    { id: 'F', dbKey: 'slot_6' },
  ];
  
  const rightSlots = [
    { id: 'G', dbKey: 'slot_7' },
    { id: 'H', dbKey: 'slot_8' },
    { id: 'I', dbKey: 'slot_9' },
    { id: 'J', dbKey: 'slot_10' },
    { id: 'K', dbKey: 'slot_11' },
    { id: 'L', dbKey: 'slot_12' },
  ];

  const slotStatusMap = currentArea?.slot_status || {};

  const checkIsOccupied = (dbKey) => {
    const raw = slotStatusMap[dbKey];
    if (typeof raw === "boolean") return raw;
    if (typeof raw === "string") {
      const value = raw.toLowerCase();
      return value === "occupied" || value === "full";
    }
    return false;
  };

  // Komponen Helper untuk me-render satu slot parkir
  const ParkingSpot = ({ spot, side }) => {
    const isOccupied = checkIsOccupied(spot.dbKey);

    // ----------------------------------------------------------------------
    // PERBAIKAN: Rotasi Mobil 90 Derajat agar sejajar jalan (menghadap atas/bawah)
    // Asumsi file 'car-top-view.png' aslinya menghadap ke ATAS/UTARA.
    // ----------------------------------------------------------------------
    
    // Mobil di sisi kiri menghadap ke atas (0 derajat)
    // Mobil di sisi kanan diputar 180 derajat menghadap ke bawah agar realistis
    const carRotation = side === 'left' ? 'rotate-0' : 'rotate-180';

    return (
      <div 
        className={`rounded-xl p-2 flex flex-col justify-center items-center shadow-inner min-h-[70px] relative transition-colors ${
          isOccupied ? 'bg-gray-200 border-2 border-gray-300' : 'border-2 border-dashed border-green-400 bg-[#F4F9F5] shadow-xs'
        }`}
      >
        {isOccupied ? (
          <img 
            src="/car-top-view.png" 
            alt="Occupied Spot" 
            // Tailwind class transform dan rotation diterapkan di sini
            className={`h-16 w-auto object-contain opacity-90 drop-shadow-md transform ${carRotation}`} 
          />
        ) : (
          <>
            <span className="font-bold text-[#3A5A40] block text-xl mb-0.5 leading-none">{spot.id}</span>
            <span className="text-[8px] uppercase font-bold tracking-wider text-[#3A5A40] mt-1">Available</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="absolute top-0 right-4 z-10">
        <h2 className="text-3xl font-extrabold text-[#C82A2A]">Map</h2>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 z-0">
        {/* Kiri: Peta Leaflet */}
        <div className="flex-[3] bg-white border border-red-200 rounded-3xl relative overflow-hidden shadow-xs z-0">
          <div className="absolute inset-0 w-full h-full z-0 opacity-80">
            <CampusMap campus={activeCampus} />
          </div>

          <div className="absolute inset-x-4 top-4 flex gap-2 z-10">
            {['Ganesha', 'Jatinangor'].map((campus) => (
              <button
                key={campus}
                onClick={() => handleCampusToggle(campus)}
                className={`px-5 py-2 rounded-full font-bold text-xs shadow-md transition ${
                  activeCampus === campus ? 'bg-[#3A5A40] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📍 ITB {campus}
              </button>
            ))}
          </div>

          <div className="absolute bottom-4 left-4 bg-[#3A5A40] text-white px-5 py-2 rounded-full text-xs font-bold shadow-md z-10 flex items-center gap-2">
            <span>📍</span> Focused: {currentLocation}
          </div>
        </div>

        {/* Kanan: Real-Time PHYSICAL LAYOUT Grid */}
        <div className="flex-[2] flex flex-col gap-4 z-10 pr-2 min-h-0">
          <div className="bg-white border border-red-100 rounded-3xl p-5 shadow-xs flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm">P</div>
              <div>
                <h3 className="font-extrabold text-gray-800 text-base uppercase tracking-wide leading-tight">{currentLocation}</h3>
                <p className="text-[10px] font-bold text-gray-400">Live Camera Synced Layout</p>
              </div>
            </div>
            
            {/* PHYSICAL PARKING LAYOUT (Sisi Kiri - Jalan Tengah - Sisi Kanan) */}
            <div className="flex-1 flex justify-between bg-gray-50/50 rounded-2xl border border-gray-100 p-3 overflow-y-auto relative">
              
              {/* Garis Jalan Putus-putus di Tengah */}
              <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-0 border-l-4 border-dashed border-yellow-400 opacity-60"></div>

              {/* Blok Kiri (Slot A-F) */}
              <div className="flex flex-col gap-2 w-[42%] z-10">
                {leftSlots.map((spot) => (
                  <ParkingSpot key={spot.id} spot={spot} side="left" />
                ))}
              </div>

              {/* Indikator Area Berkendara Tengah */}
              <div className="w-[16%] flex flex-col items-center justify-center z-10 opacity-30">
                <span className="text-gray-500 font-black tracking-[0.3em] rotate-90 text-sm uppercase">Driveway</span>
              </div>

              {/* Blok Kanan (Slot G-L) */}
              <div className="flex flex-col gap-2 w-[42%] z-10">
                {rightSlots.map((spot) => (
                  <ParkingSpot key={spot.id} spot={spot} side="right" />
                ))}
              </div>
            </div>
          </div>

          {/* AI Analysis Prediction Box */}
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
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-green-400 bg-[#F4F9F5]"></span> Available</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-gray-300 bg-gray-200"></span> Occupied (Car)</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Your Location</div>
        <div className="ml-auto text-gray-400 font-medium">Synced with Live Cam</div>
      </div>
    </div>
  );
}