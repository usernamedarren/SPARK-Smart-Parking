import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CampusMap from '../../components/CampusMap';
import api from '../../services/api';

// Fungsi bantuan untuk menghitung jarak Haversine
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius Bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCampusFilter(campus) {
  return campus === 'Ganesha'
    ? (area) => area.latitude > -6.92
    : (area) => area.latitude <= -6.92;
}

function sortRecommendations(items) {
  return [...items].sort((a, b) => {
    const availabilityDiff = Number(a.spots === 0) - Number(b.spots === 0);
    if (availabilityDiff !== 0) return availabilityDiff;

    const distanceDiff = a.distanceKm - b.distanceKm;
    if (distanceDiff !== 0) return distanceDiff;

    return a.name.localeCompare(b.name);
  });
}

export default function Prediction() {
  const navigate = useNavigate();
  const [campus, setCampus] = useState('Ganesha');
  const [targetBuilding, setTargetBuilding] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const campusData = {
    Ganesha: ['LABTEK 5', 'LABTEK 8', 'FSRD', 'GKUB', 'GKUT', 'CADL', 'ALBAR', 'ALTIM'],
    Jatinangor: ['GKU 1', 'GKU 2', 'GKU 3', 'REKTORAT']
  };

useEffect(() => {
    const fetchRecommendations = async () => {
      if (!targetBuilding) {
        setRecommendations([]);
        return;
      }

      setLoading(true);
      try {
        const [recommendationRes, statusRes] = await Promise.all([
          api.get('/recommendation', { params: { destination: targetBuilding, top_n: 20 } }),
          api.get('/parking/status')
        ]);

        const allAreas = Array.isArray(statusRes.data) ? statusRes.data : [];
        const campusFilter = getCampusFilter(campus);

        const normalized = (Array.isArray(recommendationRes.data?.recommendations) ? recommendationRes.data.recommendations : [])
          .map((item) => {
            const matchingArea = allAreas.find((area) => area.name === item.area_name);
            return {
              name: item.area_name,
              spots: item.available_slots,
              total: item.total_slots,
              distanceKm: item.distance_km,
              walkMinutes: item.estimated_walk_minutes,
              status: item.status_label,
              latitude: matchingArea?.latitude,
            };
          })
          .filter((item) => item.latitude === undefined || campusFilter(item))
          .map(({ latitude, ...item }) => item);

        setRecommendations(sortRecommendations(normalized));
      } catch (err) {
        console.error("Gagal memuat rekomendasi:", err);

        try {
          const statusRes = await api.get('/parking/status');
          const allAreas = Array.isArray(statusRes.data) ? statusRes.data : [];

          const buildingCoords = { 
              'LABTEK 5': [-6.8915, 107.6105], 'LABTEK 8': [-6.8920, 107.6110], 
              'FSRD': [-6.890, 107.610], 'GKUB': [-6.893, 107.612],
              'GKUT': [-6.894, 107.613], 'CADL': [-6.890, 107.611],
              'ALBAR': [-6.895, 107.614], 'ALTIM': [-6.896, 107.615],
              'GKU 1': [-6.927, 107.774], 'GKU 2': [-6.928, 107.775],
              'GKU 3': [-6.929, 107.776], 'REKTORAT': [-6.926, 107.773]
          };
          const targetCoord = buildingCoords[targetBuilding] || (campus === 'Ganesha' ? [-6.8915, 107.6107] : [-6.9275, 107.7740]);
          const campusFilter = getCampusFilter(campus);

          const fallback = allAreas
            .filter(campusFilter)
            .map((a) => {
              const distanceKm = haversineDistance(a.latitude, a.longitude, targetCoord[0], targetCoord[1]);
              return {
                name: a.name,
                spots: a.available_slots,
                total: a.total_slots,
                distanceKm,
                walkMinutes: (distanceKm / 5) * 60,
                status: a.status_label,
              };
            });

          setRecommendations(sortRecommendations(fallback));
        } catch (fallbackErr) {
          console.error("Gagal memuat fallback rekomendasi:", fallbackErr);
          setRecommendations([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [targetBuilding, campus]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-[3] bg-white border border-red-200 rounded-3xl relative overflow-hidden shadow-xs">
          <div className="absolute inset-0 w-full h-full opacity-80">
            <CampusMap campus={campus} />
          </div>
          <div className="absolute top-6 left-6 bg-[#3A5A40] text-white px-5 py-2 rounded-full text-xs font-bold shadow-md">
            📍 Map View: ITB {campus}
          </div>
        </div>

        <div className="flex-[2] flex flex-col gap-5">
          <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-[#C82A2A] text-lg mb-5">Find Nearby Parking</h3>
            
            <div className="border border-red-200 rounded-2xl p-3 mb-4">
              <label className="text-[11px] text-[#C82A2A] font-bold block mb-1.5 uppercase">Select Campus</label>
              <select value={campus} onChange={(e) => { setCampus(e.target.value); setTargetBuilding(''); }} className="w-full text-sm font-semibold cursor-pointer">
                <option value="Ganesha">ITB Ganesha</option>
                <option value="Jatinangor">ITB Jatinangor</option>
              </select>
            </div>

            <div className="border border-red-200 rounded-2xl p-3">
              <label className="text-[11px] text-[#C82A2A] font-bold block mb-1.5 uppercase">Where?</label>
              <select value={targetBuilding} onChange={(e) => setTargetBuilding(e.target.value)} className="w-full text-sm font-semibold cursor-pointer">
                <option value="" disabled>Select building...</option>
                {campusData[campus].map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="font-extrabold text-[#C82A2A] text-lg mb-1">Recommend Parking</h3>
            {loading ? <p className="text-xs text-gray-400">Loading...</p> : (
              <div className="space-y-4 overflow-y-auto pr-2">
                {recommendations.map((item, index) => (
                  <div key={index} className="bg-white border border-[#A3B8A8] rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-extrabold text-gray-800 text-sm">{item.name}</h4>
                      <span className="text-[10px] font-bold text-gray-500">{Math.max(1, Math.round(item.walkMinutes))} min walk</span>
                    </div>
                    <div className="flex justify-between items-center mb-3 text-[10px] text-gray-500 font-semibold">
                      <span>{item.distanceKm.toFixed(2)} km away</span>
                      <span>{item.spots === 0 ? 'Not available' : 'Available'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${item.spots === 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                        {item.spots === 0 ? 'Full' : 'Available'}
                      </span>
                      <span className="text-sm font-extrabold">{item.spots} <span className="text-[10px] text-gray-400">/ {item.total} spots</span></span>
                    </div>
                    <button onClick={() => navigate('/map', { state: { selectedLocation: item.name } })} className="w-full mt-3 py-2 text-[#3A5A40] border border-[#3A5A40]/30 rounded-xl text-xs font-bold hover:bg-[#F4F9F5]">Navigate</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}