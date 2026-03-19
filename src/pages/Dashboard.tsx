import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, ThermometerSun, Truck as TruckIcon, CheckCircle } from 'lucide-react';

const getMarkerColorClass = (status: string) => {
  if (status === 'SAFE') return 'bg-green-500';
  if (status === 'WARNING') return 'bg-yellow-500';
  if (status === 'REROUTING') return 'bg-blue-500';
  return 'bg-red-500';
};

const createIcon = (colorClass: string, isPulsing: boolean) => L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-6 h-6 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center ${colorClass} ${isPulsing ? 'animate-pulse scale-125' : ''} transition-all duration-300"><div class="w-2 h-2 rounded-full bg-white relative z-10"></div>${isPulsing ? `<div class="absolute inset-0 rounded-full ${colorClass} opacity-50 animate-ping"></div>` : ''}</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const getStatusStyle = (status: string) => {
  if (status === 'SAFE') return 'bg-green-500/20 text-green-400 border-green-500/50';
  if (status === 'WARNING') return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
  if (status === 'REROUTING') return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
  return 'bg-red-500/20 text-red-500 border-red-500/50';
};

type Truck = {
  id: string;
  cargo: string;
  temp: number;
  status: 'SAFE' | 'WARNING' | 'BREACH' | 'REROUTING';
  locationStr: string;
  coords: [number, number];
};

const initialTrucks: Truck[] = [
  { id: 'Truck 1', cargo: 'Covid-19 Vaccines', temp: 3.2, status: 'SAFE', locationStr: 'Guindy Ind. Estate', coords: [13.0067, 80.2206] },
  { id: 'Truck 2', cargo: 'Fresh Produce', temp: 4.1, status: 'SAFE', locationStr: 'Koyambedu Market', coords: [13.0694, 80.1948] },
  { id: 'Truck 3', cargo: 'Hepatitis B Vaccines', temp: 6.8, status: 'WARNING', locationStr: 'T Nagar', coords: [13.0418, 80.2341] },
  { id: 'Truck 4', cargo: 'Insulin Supplies', temp: 2.9, status: 'SAFE', locationStr: 'Adyar', coords: [13.0033, 80.2555] },
  { id: 'Truck 5', cargo: 'Frozen Meat', temp: 3.5, status: 'SAFE', locationStr: 'Velachery', coords: [12.9786, 80.2185] },
];

export default function Dashboard() {
  const [trucks, setTrucks] = useState<Truck[]>(initialTrucks);
  const [showPopup, setShowPopup] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setTrucks(current => current.map(truck => {
        // move by 0.0008 deg slowly and continuously
        return {
          ...truck,
          coords: [truck.coords[0] + 0.0008, truck.coords[1] + 0.0008]
        };
      }));
    }, 2000);

    const tempInterval = setInterval(() => {
      setTrucks(current => current.map(truck => {
        if (truck.status === 'BREACH' && truck.id === 'Truck 3') {
          return { ...truck, temp: Number((truck.temp + 0.3).toFixed(1)) };
        }
        if (truck.status === 'REROUTING') {
          return truck; // keeps it stable when rerouting
        }
        const fluctuation = (Math.random() * 0.4) - 0.2;
        return { ...truck, temp: Number((truck.temp + fluctuation).toFixed(1)) };
      }));
    }, 3000);

    return () => {
      clearInterval(moveInterval);
      clearInterval(tempInterval);
    };
  }, []);

  const triggerBreach = () => {
    setTrucks(current => current.map(t => 
      t.id === 'Truck 3' 
        ? { ...t, temp: 11.4, status: 'BREACH' } 
        : t
    ));
    setTimeout(() => {
      setShowPopup(true);
    }, 1500);
  };

  const acceptBestOption = () => {
    setShowPopup(false);
    setTrucks(current => current.map(t => 
      t.id === 'Truck 3'
        ? { ...t, status: 'REROUTING', locationStr: 'Apollo Cold Storage' }
        : t
    ));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 relative w-full overflow-hidden">
      {/* Toast Notification */}
      <div className={`fixed bottom-6 w-[400px] left-1/2 -translate-x-1/2 z-[2000] bg-green-900/90 border border-green-500/50 text-green-400 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 transition-transform duration-500 ease-in-out ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
        <CheckCircle size={28} className="flex-shrink-0 text-green-400" />
        <div>
          <p className="font-bold text-white mb-1 leading-tight">Truck 3 rerouted to Apollo Cold Storage.</p>
          <p className="text-sm text-green-400 line-clamp-2">Driver notified via WhatsApp.</p>
        </div>
      </div>

      {/* AI Recommendation Popup */}
      <div className={`fixed top-24 right-6 z-[1900] w-[400px] bg-gray-900 border-l-[6px] border-l-red-500 rounded-xl p-5 shadow-2xl transition-transform duration-500 ease-in-out ${showPopup ? 'translate-x-0' : 'translate-x-[150%]'}`}>
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-red-500/20 p-2 rounded-lg mt-1">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight mb-1">⚠️ BREACH DETECTED — Truck 3</h3>
            <p className="text-gray-300 text-sm">Cargo: Hepatitis B Vaccines</p>
            <p className="text-gray-300 text-sm">Current Temp: <span className="text-red-500 font-bold">11.4°C</span> (Safe limit: 8°C)</p>
            <p className="text-gray-400 text-sm mt-1">Predicted full spoilage in: 28 minutes</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <p className="text-xs font-bold text-gray-400 tracking-wider mb-3 text-center">--- AI RECOMMENDED ACTIONS ---</p>
          
          <div className="space-y-3">
            <div className="bg-gray-800 border-2 border-[#EAB308] rounded-xl p-3 cursor-pointer hover:bg-gray-700 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.1)] relative">
              <p className="absolute -top-3 left-3 bg-[#EAB308] text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Best Option</p>
              <p className="text-white font-bold text-[15px] pt-1 leading-snug">Reroute to nearest cold storage</p>
              <p className="text-gray-400 text-sm mt-1">Apollo Cold Storage — 4.2 km away</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-green-400 text-sm font-medium">ETA: 11 minutes ✓ Cargo saved</p>
                <p className="text-[#EAB308] text-sm font-bold">AI Confidence: 94%</p>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 opacity-80 cursor-not-allowed">
              <p className="text-white font-semibold text-sm leading-snug">Send backup refrigerated vehicle</p>
              <p className="text-gray-400 text-xs mt-1">Backup truck available — 8.1 km away</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-yellow-500 text-xs font-medium">ETA: 22 minutes ⚠️ Borderline</p>
                <p className="text-gray-400 text-xs font-bold">AI Confidence: 61%</p>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 opacity-60 cursor-not-allowed">
              <p className="text-white font-semibold text-sm leading-snug">Continue to original destination</p>
              <p className="text-gray-400 text-xs mt-1">Apollo Hospital — 14.3 km away</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-red-500 text-xs font-medium">ETA: 34 minutes ✗ Cargo at risk</p>
                <p className="text-gray-400 text-xs font-bold">AI Confidence: 12%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button 
            onClick={acceptBestOption}
            className="flex-1 bg-[#EAB308] hover:bg-yellow-500 text-black font-bold py-2.5 rounded-lg transition-colors text-sm"
          >
            Accept Best Option
          </button>
          <button 
            onClick={() => setShowPopup(false)}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition-colors border border-gray-700 text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* LEFT SIDE: MAP 60% */}
      <div className="w-[60%] h-full bg-gray-800 rounded-2xl overflow-hidden border border-gray-800 relative shadow-xl shadow-black/50">
        <MapContainer center={[13.04, 80.23]} zoom={11} className="w-full h-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
          />
          {trucks.map(truck => (
             <Marker 
               key={truck.id} 
               position={truck.coords} 
               icon={createIcon(getMarkerColorClass(truck.status), truck.status === 'BREACH')}
             >
               <Popup>
                 <div className="text-gray-900 font-medium">
                   <strong>{truck.id}</strong><br/>
                   Temp: {truck.temp.toFixed(1)}°C
                 </div>
               </Popup>
             </Marker>
          ))}
        </MapContainer>
        
        {/* BREACH BUTTON INSIDE MAP OVERLAY FOR ABSOLUTE POSITIONING BOTTOM RIGHT OF SCREEN BUT WE CAN PUT IT OVER MAP */}
        <button 
          onClick={triggerBreach}
          className="absolute bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-pulse hover:animate-none transition-all z-[400] overflow-hidden flex items-center gap-3 border border-red-500/50"
        >
          <AlertTriangle size={24} />
          <span className="text-lg">Simulate Breach — Truck 3</span>
        </button>
      </div>

      {/* RIGHT SIDE: CARDS 40% */}
      <div className="w-[40%] h-full flex flex-col gap-4 overflow-y-auto pr-2 pb-6 custom-scrollbar">
        {trucks.map(truck => (
          <div key={truck.id} className={`bg-gray-900 border ${truck.status==='BREACH'? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-gray-800'} rounded-2xl p-5 shadow-lg flex-shrink-0 transition-colors`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 p-2.5 rounded-lg text-gray-300 border border-gray-700">
                  <TruckIcon size={20} className={truck.status==='BREACH' ? 'text-red-500' : truck.status==='REROUTING' ? 'text-blue-500' : 'text-gray-300'} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white tracking-wide">{truck.id}</h3>
                  <p className="text-sm text-gray-400 font-medium">{truck.cargo}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-md border ${getStatusStyle(truck.status)} uppercase tracking-wider`}>
                {truck.status}
              </span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-400">Current Location</span>
                 <span className="text-gray-300 font-medium text-right truncate w-[60%]">{truck.locationStr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Live Temperature</span>
                <div className="flex items-center gap-1.5 font-mono text-xl font-bold bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-800">
                  <ThermometerSun size={18} className={truck.status === 'BREACH' ? 'text-red-500' : 'text-[#EAB308]'} />
                  <span className={truck.status === 'BREACH' ? 'text-red-500' : 'text-white'}>
                    {truck.temp.toFixed(1)}°C
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
