import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

// 1. Data Koordinat Asli / Tiruan untuk penyebaran titik di peta
const parkingData = {
  Ganesha: [
    { id: 'LABTEK 5', name: 'LABTEK 5', spots: 20, lat: -6.8905, lng: 107.6100 },
    { id: 'LABTEK 8', name: 'LABTEK 8', spots: 15, lat: -6.8910, lng: 107.6115 },
    { id: 'FSRD', name: 'FSRD', spots: 18, lat: -6.8920, lng: 107.6105 },
    { id: 'GKUB', name: 'GKUB', spots: 25, lat: -6.8915, lng: 107.6120 },
    { id: 'GKUT', name: 'GKUT', spots: 30, lat: -6.8918, lng: 107.6110 },
    { id: 'CADL', name: 'CADL', spots: 12, lat: -6.8908, lng: 107.6108 },
    { id: 'ALBAR', name: 'ALBAR', spots: 40, lat: -6.8925, lng: 107.6100 },
    { id: 'ALTIM', name: 'ALTIM', spots: 35, lat: -6.8925, lng: 107.6115 },
  ],
  Jatinangor: [
    { id: 'GKU 1', name: 'GKU 1', spots: 40, lat: -6.9270, lng: 107.7735 },
    { id: 'GKU 2', name: 'GKU 2', spots: 35, lat: -6.9280, lng: 107.7745 },
    { id: 'GKU 3', name: 'GKU 3', spots: 45, lat: -6.9275, lng: 107.7750 },
    { id: 'REKTORAT', name: 'REKTORAT', spots: 20, lat: -6.9265, lng: 107.7740 },
  ]
};

// 2. Fungsi untuk membuat Custom Marker bergaya Figma
const createCustomIcon = (name, spots) => {
  return L.divIcon({
    className: 'bg-transparent border-none', // Hilangkan background bawaan leaflet
    html: `
      <div class="flex flex-col items-center -mt-8 cursor-pointer hover:scale-105 transition-transform duration-200">
        <div class="bg-[#3A5A40] text-white w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs shadow-md z-20 relative">P</div>
        
        <div class="bg-white px-4 py-1.5 rounded-xl shadow-lg border border-gray-100 text-center min-w-[100px] z-10 -mt-2">
          <div class="font-extrabold text-gray-800 text-xs pt-1">${name}</div>
          <div class="text-[10px] text-gray-500 font-medium">${spots} spots</div>
        </div>
        
        <div class="w-[2px] h-3 bg-gray-400"></div>
        <div class="w-3 h-3 bg-[#2d4732] rounded-full shadow-md border-2 border-white"></div>
      </div>
    `,
    iconSize: [100, 80],
    iconAnchor: [50, 80], // Titik fokus (jangkar) pas di titik hijau bawah
  });
};

// 3. Efek Transisi Kamera Peta
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16.5, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function CampusMap({ campus = 'Ganesha' }) {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);

  // Ambil data status ter-update
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/parking/status');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAreas(data);
      } catch (err) {
        console.error('Gagal mengambil status map:', err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Titik tengah kamera
  const centerCoordinates = {
    Ganesha: [-6.8915, 107.6107],
    Jatinangor: [-6.9275, 107.7739]
  };

  const center = centerCoordinates[campus] || centerCoordinates.Ganesha;
  const rawMarkers = parkingData[campus] || [];

  // Map markers to use real database spots
  const currentMarkers = rawMarkers.map(marker => {
    const matched = areas.find(a => a.name.toUpperCase() === marker.id.toUpperCase());
    return {
      ...marker,
      spots: matched ? matched.available_slots : marker.spots
    };
  });

  return (
    <MapContainer 
      center={center} 
      zoom={16.5} 
      className="w-full h-full z-0" 
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">Carto</a>'
      />
      <MapUpdater center={center} />
      
      {/* 4. Render seluruh marker kustom di atas peta */}
      {currentMarkers.map((location) => (
        <Marker 
          key={location.id} 
          position={[location.lat, location.lng]}
          icon={createCustomIcon(location.name, location.spots)}
          eventHandlers={{
            click: () => {
              // Jika penanda di peta diklik, otomatis pindah ke halaman Map Detail
              navigate('/map', { state: { selectedLocation: location.id } });
            },
          }}
        />
      ))}
    </MapContainer>
  );
}