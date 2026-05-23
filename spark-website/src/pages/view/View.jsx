import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function View() {
  const routeLocation = useLocation();
  const [selectedFeed, setSelectedFeed] = useState('LABTEK 5');

  // Menangkap perubahan data dari Search bar
  useEffect(() => {
    if (routeLocation.state?.selectedLocation) {
      setSelectedFeed(routeLocation.state.selectedLocation);
    }
  }, [routeLocation.state]);

  // Daftar lengkap wilayah yang sama dengan Search bar
  const campusFeeds = {
    Ganesha: ['LABTEK 5', 'LABTEK 8', 'FSRD', 'GKUB', 'GKUT', 'CADL', 'ALBAR', 'ALTIM'],
    Jatinangor: ['GKU 1', 'GKU 2', 'GKU 3', 'REKTORAT']
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Left Side: Live Video Monitor Stream Card */}
        <div className="flex-[3] bg-gray-900 border border-gray-800 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
          <div className="flex-1 w-full bg-black relative flex items-center justify-center">
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white"></span> Live Cam
            </div>
            <div className="absolute top-4 right-4 bg-black/60 text-white/80 px-3 py-1 rounded-md text-[10px] font-bold">
              CAMERA FEED ID: CAM_{selectedFeed.replace(/ /g, '_')}
            </div>

            <div className="text-center text-white/40 space-y-2">
              <Camera size={48} className="mx-auto text-gray-700 animate-pulse" />
              <p className="text-xs font-bold font-mono tracking-wider">CONNECTING TO STREAM FEED SITE...</p>
              <p className="text-[11px] font-bold text-gray-500 font-mono uppercase">{selectedFeed} PARKING COMPLEX</p>
            </div>
          </div>
          
          <div className="bg-white p-4 border-t border-red-100 flex justify-between items-center px-6">
            <span className="text-xs font-extrabold text-gray-800">Monitoring Zone: <span className="text-red-600">{selectedFeed}</span></span>
            <button className="text-xs font-bold text-red-600 flex items-center gap-1.5 hover:text-red-800 transition">
              <RefreshCw size={14} /> Refresh Feed
            </button>
          </div>
        </div>

        {/* Right Side: Campus Live Camera Selector Panel */}
        <div className="flex-[2] bg-white border border-red-100 rounded-3xl p-5 shadow-xs flex flex-col">
          <h3 className="font-extrabold text-red-600 text-base mb-4 flex items-center gap-2">
            📹 Parking Live Feed
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Section Ganesha */}
            <div>
              <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">ITB Ganesha Station</h4>
              <div className="grid grid-cols-2 gap-2">
                {campusFeeds.Ganesha.map((feed) => (
                  <button
                    key={feed}
                    onClick={() => setSelectedFeed(feed)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition ${
                      selectedFeed === feed 
                        ? 'bg-red-600 border-red-600 text-white shadow-sm' 
                        : 'bg-transparent border-gray-200 text-gray-600 hover:border-red-600 hover:text-red-600'
                    }`}
                  >
                    {feed}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Jatinangor */}
            <div className="pt-2 pb-4">
              <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">ITB Jatinangor Station</h4>
              <div className="grid grid-cols-2 gap-2">
                {campusFeeds.Jatinangor.map((feed) => (
                  <button
                    key={feed}
                    onClick={() => setSelectedFeed(feed)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition ${
                      selectedFeed === feed 
                        ? 'bg-red-600 border-red-600 text-white shadow-sm' 
                        : 'bg-transparent border-gray-200 text-gray-600 hover:border-red-600 hover:text-red-600'
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