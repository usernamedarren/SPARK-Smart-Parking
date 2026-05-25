import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Layers, AlertTriangle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function View() {
  const routeLocation = useLocation();
  const navigate = useNavigate();
  
  const [selectedFeed, setSelectedFeed] = useState('LABTEK 5');
  const [areas, setAreas] = useState([]);
  const [currentArea, setCurrentArea] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [imageBlobUrl, setImageBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Menangkap navigasi dari input luaran komponen
  useEffect(() => {
    if (routeLocation.state?.selectedLocation) {
      setSelectedFeed(routeLocation.state.selectedLocation);
    }
  }, [routeLocation.state]);

  // sinkronisasi pooling data status total komponen setiap 5 detik
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/parking/status');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAreas(data);
      } catch (err) {
        console.error('Gagal mengambil status feed kamera:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
      setRefreshTrigger(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Mencocokkan data area aktif
  useEffect(() => {
    const found = areas.find(a => a.name.toUpperCase() === selectedFeed.toUpperCase());
    setCurrentArea(found || null);
    setImageError(false);
  }, [selectedFeed, areas]);

  // Proses unduh file snapshot biner via Axios untuk mem-bypass proteksi ngrok
  useEffect(() => {
    let objectUrl = null;
    const fetchImageBlob = async () => {
      if (currentArea && currentArea.camera_device_id) {
        try {
          const response = await api.get(`/static/snapshots/${currentArea.camera_device_id}.jpg`, {
            responseType: 'blob',
            params: { t: refreshTrigger } 
          });
          objectUrl = URL.createObjectURL(response.data);
          setImageBlobUrl(objectUrl);
          setImageError(false);
        } catch (error) {
          console.error("Gambar gagal dimuat:", error);
          setImageError(true);
        }
      } else {
        setImageBlobUrl(null);
      }
    };
    fetchImageBlob();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [currentArea, refreshTrigger]);

  const campusFeeds = {
    Ganesha: ['LABTEK 5', 'LABTEK 8', 'FSRD', 'GKUB', 'GKUT', 'CADL', 'ALBAR', 'ALTIM'],
    Jatinangor: ['GKU 1', 'GKU 2', 'GKU 3', 'REKTORAT']
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Kiri: Live Video Monitor Stream Card */}
        <div className="flex-[3] bg-gray-900 border border-gray-800 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
          <div className="flex-1 w-full bg-black relative flex items-center justify-center">
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest animate-pulse flex items-center gap-1.5 z-10">
              <span className="w-2 h-2 rounded-full bg-white"></span> Live Cam
            </div>
            
            {currentArea && (
              <div className="absolute top-4 right-4 bg-black/60 text-white/80 px-3 py-1 rounded-md text-[10px] font-bold z-10">
                CAM ID: {currentArea.camera_device_id || 'UNASSIGNED'}
              </div>
            )}

            {imageBlobUrl && !imageError ? (
              <img
                src={imageBlobUrl}
                alt={`${selectedFeed} Live Feed`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="text-center text-white/40 space-y-2 px-6">
                <Camera size={48} className="mx-auto text-gray-700 animate-pulse" />
                <p className="text-xs font-bold font-mono tracking-wider text-red-500">FEED OFFLINE OR NO SNAPSHOT CAPTURED</p>
                <p className="text-[11px] font-bold text-gray-500 font-mono uppercase">
                  WAITING FOR ESP32-CAM IMAGE TRANSMISSION AT {selectedFeed}...
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-4 border-t border-red-100 flex justify-between items-center px-6">
            <span className="text-xs font-extrabold text-gray-800">Monitoring Zone: <span className="text-red-600">{selectedFeed}</span></span>
            <div className="flex gap-4">
              <button onClick={() => navigate('/map', { state: { selectedLocation: selectedFeed } })} className="text-xs font-bold text-[#3A5A40] flex items-center gap-1.5 hover:text-green-800 transition">
                <Layers size={14} /> View Layout Map
              </button>
              <button onClick={handleRefresh} className="text-xs font-bold text-red-600 flex items-center gap-1.5 hover:text-red-800 transition">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Kanan: Panel Selektor Kamera & Integrasi Ketersediaan Slot */}
        <div className="flex-[2] bg-white border border-red-100 rounded-3xl p-5 shadow-xs flex flex-col">
          <h3 className="font-extrabold text-red-600 text-base mb-4 flex items-center gap-2">
            📹 Parking Live Feed
          </h3>

          {/* Integrated Realtime Availability Summary Card */}
          <div className="mb-4 bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-around shadow-inner">
            <div className="text-center">
              <span className="text-[10px] text-gray-500 font-bold block uppercase">Available</span>
              <span className="text-lg font-black text-[#3A5A40]">{currentArea?.available_slots || 0}</span>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="text-center">
              <span className="text-[10px] text-gray-500 font-bold block uppercase">Occupied</span>
              <span className="text-lg font-black text-gray-700">{currentArea?.occupied_slots || 0}</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div>
              <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">ITB Ganesha</h4>
              <div className="grid grid-cols-2 gap-2">
                {campusFeeds.Ganesha.map((feed) => (
                  <button
                    key={feed}
                    onClick={() => setSelectedFeed(feed)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition ${
                      selectedFeed.toUpperCase() === feed.toUpperCase() ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-transparent border-gray-200 text-gray-600 hover:border-red-600 hover:text-red-600'
                    }`}
                  >
                    {feed}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 pb-4">
              <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">ITB Jatinangor</h4>
              <div className="grid grid-cols-2 gap-2">
                {campusFeeds.Jatinangor.map((feed) => (
                  <button
                    key={feed}
                    onClick={() => setSelectedFeed(feed)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition ${
                      selectedFeed.toUpperCase() === feed.toUpperCase() ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-transparent border-gray-200 text-gray-600 hover:border-red-600 hover:text-red-600'
                    }`}
                  >
                    {feed}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}