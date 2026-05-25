import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CampusMap from '../../components/CampusMap'; 
import api from '../../services/api';

export default function Map() {
  const location = useLocation();
  const [currentLocation, setCurrentLocation] = useState('LABTEK 5');
  const [areas, setAreas] = useState([]);
  const [currentArea, setCurrentArea] = useState(null);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [activeCampus, setActiveCampus] = useState('Ganesha');
  const [aiPrediction, setAiPrediction] = useState('Generating live AI analysis...');
  const [predicting, setPredicting] = useState(false);

  // Fetch status berkala setiap 5 detik agar sinkron penuh dengan visualisasi livecam
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

  // Sinkronisasi navigasi antar-halaman internal
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

  // Pemetaan segmentasi slot fisik biner dari data AI backend
  useEffect(() => {
    const found = areas.find(a => a.name.toUpperCase() === currentLocation.toUpperCase());
    if (found) {
      setCurrentArea(found);
      const spots = [];
      const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const total = found.total_slots || 10;
      const occupied = found.occupied_slots || 0;
      const slotStatusMap = found.slot_status || {};

      const resolveOccupied = (slotIndex, fallback) => {
        const statusKey = `slot_${slotIndex + 1}`;
        const raw = slotStatusMap[statusKey];
        if (typeof raw === "boolean") return raw;
        if (typeof raw === "string") {
          const value = raw.toLowerCase();
          if (value === "empty" || value === "available") return false;
          return value === "occupied" || value === "full";
        }
        return fallback;
      };

      for (let i = 0; i < Math.min(total, 26); i++) {
        spots.push({
          id: labels[i],
          status: resolveOccupied(i, i < occupied) ? 'occupied' : 'available',
        });
      }
      setParkingSpots(spots);
    } else {
      setCurrentArea(null);
      // Fallback lokal apabila koneksi basis data terputus
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

  // Polling AI untuk memprediksi tren okupansi masa depan
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

  const handleCampusToggle = (campus) => {
    setActiveCampus(campus);
    // Auto select lokasi default saat berganti klaster kampus di peta
    setCurrentLocation(campus === 'Ganesha' ? 'LABTEK 5' : 'GKU 1');
  };

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="absolute top-0 right-4 z-10">
        <h2 className="text-3xl font-extrabold text-[#C82A2A]">Map</h2>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 z-0">
        {/* Kiri: Interactive Map Component dengan Pilihan Kampus */}
        <div className="flex-[3] bg-white border border-red-200 rounded-3xl relative overflow-hidden shadow-xs z-0">
          <div className="absolute inset-0 w-full h-full z-0 opacity-80">
            <CampusMap campus={activeCampus} />
          </div>

          {/* Sakelar Peta Kampus Berbasis Desain Utama */}
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

        {/* Kanan: Real-Time Slot Diagram Grid */}
        <div className="flex-[2] flex flex-col gap-4 z-10 pr-2">
          <div className="bg-white border border-red-100 rounded-3xl p-5 shadow-xs flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm">P</div>
              <h3 className="font-extrabold text-gray-800 text-base uppercase tracking-wide">{currentLocation}</h3>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3 content-start overflow-y-auto pr-1">
              {parkingSpots.map((spot) => (
                <div 
                  key={spot.id}
                  className={`rounded-xl p-2 flex flex-col justify-center items-center shadow-inner min-h-[80px] transition-colors ${
                    spot.status === 'occupied' ? 'bg-gray-100 border border-gray-200' : 'border border-green-200 bg-[#F4F9F5] shadow-xs'
                  }`}
                >
                  {spot.status === 'occupied' ? (
                    <img src="/car-top-view.png" alt="Occupied Spot" className="h-14 w-auto object-contain opacity-90" />
                  ) : (
                    <>
                      <span className="font-bold text-[#3A5A40] block text-xl mb-0.5 leading-none">{spot.id}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#3A5A40] mt-1">Available</span>
                    </>
                  )}
                </div>
              ))}
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
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3A5A40]"></span> Available</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Limited</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Full</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Your Location</div>
        <div className="ml-auto text-gray-400 font-medium">Peak hours: 09.00 - 12.00</div>
      </div>
    </div>
  );
}