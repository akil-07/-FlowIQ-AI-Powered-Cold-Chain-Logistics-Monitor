import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CheckCircle, Clock, MapPin, Package, Navigation, ChevronLeft, ChevronRight, Truck as TruckIcon, AlertTriangle } from 'lucide-react';

const createIcon = (colorClass: string) => L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-6 h-6 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center ${colorClass} transition-all duration-1000"><div class="w-2 h-2 rounded-full bg-white"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const destIcon = L.divIcon({
  className: 'custom-dest-icon',
  html: `<div class="w-8 h-8 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center bg-blue-500"><div class="text-white text-[10px] font-bold">H</div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const generateChartData = (baseTemp: number) => {
  const data = [];
  const now = new Date();
  now.setMinutes(Math.floor(now.getMinutes() / 10) * 10);
  
  for (let i = 11; i >= 0; i--) {
    const timePoint = new Date(now.getTime() - i * 10 * 60000);
    const timeStr = `${timePoint.getHours().toString().padStart(2, '0')}:${timePoint.getMinutes().toString().padStart(2, '0')}`;
    const temp = Number((baseTemp + Math.random() * 1.0 - 0.5).toFixed(1));
    data.push({ time: timeStr, temp });
  }
  return data;
};

type Shipment = {
  id: string;
  cargo: string;
  origin: string;
  destination: string;
  destCoords: [number, number];
  startCoords: [number, number];
  baseTemp: number;
  etaBase: number;
  status: 'SAFE' | 'WARNING' | 'BREACH' | 'REROUTING';
};

const shipments: Shipment[] = [
  { 
    id: '#SHP-20482', 
    cargo: 'Hepatitis B Vaccines', 
    origin: 'Ambattur Cold Storage', 
    destination: 'Apollo Hospital, Greams Road', 
    destCoords: [13.0645, 80.2520], 
    startCoords: [13.0827, 80.2000], 
    baseTemp: 6.8, 
    etaBase: 18,
    status: 'WARNING'
  },
  { 
    id: '#SHP-31094', 
    cargo: 'Fresh Poultry', 
    origin: 'Madhavaram Hub', 
    destination: 'Grace Supermarket, Adyar', 
    destCoords: [13.0033, 80.2555], 
    startCoords: [13.1500, 80.2300], 
    baseTemp: 2.2, 
    etaBase: 24,
    status: 'SAFE'
  },
  { 
    id: '#SHP-12847', 
    cargo: 'Dairy Products', 
    origin: 'Aavin Dairy, Sholinganallur', 
    destination: 'Nilgiris, T Nagar', 
    destCoords: [13.0418, 80.2341], 
    startCoords: [12.9000, 80.2200], 
    baseTemp: 4.5, 
    etaBase: 31,
    status: 'SAFE'
  },
  { 
    id: '#SHP-99281', 
    cargo: 'Frozen Sea Food', 
    origin: 'Ennore Port', 
    destination: 'Le Royal Meridien', 
    destCoords: [13.0100, 80.2000], 
    startCoords: [13.2200, 80.3200], 
    baseTemp: -18.4, 
    etaBase: 45,
    status: 'SAFE'
  },
  { 
    id: '#SHP-55420', 
    cargo: 'Insulin Deliveries', 
    origin: 'LifeCare Pharma', 
    destination: 'MIOT Hospital', 
    destCoords: [13.0200, 80.1800], 
    startCoords: [13.0500, 80.2600], 
    baseTemp: 5.1, 
    etaBase: 12,
    status: 'SAFE'
  }
];

export default function Tracker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentShipment = shipments[currentIndex];

  const [currentLoc, setCurrentLoc] = useState<[number, number]>(currentShipment.startCoords);
  const [currentTemp, setCurrentTemp] = useState(currentShipment.baseTemp);
  const [currentStatus, setCurrentStatus] = useState(currentShipment.status);
  const [etaMinutes, setEtaMinutes] = useState(currentShipment.etaBase);
  const [etaSeconds, setEtaSeconds] = useState(0);
  const [chartData, setChartData] = useState(generateChartData(currentShipment.baseTemp));
  const [showPopup, setShowPopup] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Reset state when switching shipments
  useEffect(() => {
    setCurrentLoc(currentShipment.startCoords);
    setCurrentTemp(currentShipment.baseTemp);
    setCurrentStatus(currentShipment.status);
    setEtaMinutes(currentShipment.etaBase);
    setEtaSeconds(0);
    setChartData(generateChartData(currentShipment.baseTemp));
    setShowPopup(false);
    setShowToast(false);
  }, [currentIndex, currentShipment]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setCurrentLoc(prev => {
        const dx = currentShipment.destCoords[0] - prev[0];
        const dy = currentShipment.destCoords[1] - prev[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 0.001) return prev;

        const moveStep = 0.0005; 
        const nx = prev[0] + (dx / distance) * moveStep;
        const ny = prev[1] + (dy / distance) * moveStep;
        return [nx, ny];
      });
    }, 2000);

    const tempInterval = setInterval(() => {
      setCurrentTemp(prev => {
        if (currentStatus === 'BREACH') {
          return Number((prev + 0.3).toFixed(1));
        }
        if (currentStatus === 'REROUTING') {
          return prev;
        }
        const fluctuation = (Math.random() * 0.2) - 0.1;
        return Number((prev + fluctuation).toFixed(1));
      });
    }, 3000);

    const countdownInterval = setInterval(() => {
      setEtaSeconds(prev => {
        if (prev === 0) {
          setEtaMinutes(m => Math.max(0, m - 1));
          return 59;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(moveInterval);
      clearInterval(tempInterval);
      clearInterval(countdownInterval);
    };
  }, [currentShipment]);

  const nextShipment = () => setCurrentIndex((prev) => (prev + 1) % shipments.length);
  const prevShipment = () => setCurrentIndex((prev) => (prev - 1 + shipments.length) % shipments.length);

  const triggerBreach = () => {
    setCurrentStatus('BREACH');
    setCurrentTemp(11.4);
    setTimeout(() => setShowPopup(true), 1500);
  };

  const acceptBestOption = () => {
    setShowPopup(false);
    setCurrentStatus('REROUTING');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const getStatusBannerConfig = () => {
    switch(currentStatus) {
      case 'SAFE':
        return { 
          bg: 'bg-green-600 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.15)]',
          iconBg: 'text-green-600',
          title: 'Shipment Status: Healthy',
          desc: `Climate control verified at ${currentTemp.toFixed(1)}°C — Journey safe.`
        };
      case 'WARNING':
        return {
          bg: 'bg-yellow-600 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.15)]',
          iconBg: 'text-yellow-600',
          title: 'Shipment Status: Warning',
          desc: `Temperature rising at ${currentTemp.toFixed(1)}°C — Approaching safe limit (8°C).`
        };
      case 'BREACH':
        return {
          bg: 'bg-red-600 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse',
          iconBg: 'text-red-600',
          title: 'Shipment Status: BREACH DETECTED',
          desc: `CRITICAL: Temperature at ${currentTemp.toFixed(1)}°C — Cargo spoilage imminent.`
        };
      case 'REROUTING':
        return {
          bg: 'bg-blue-600 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]',
          iconBg: 'text-blue-600',
          title: 'Shipment Status: Rerouting',
          desc: `Vehicle rerouted to Apollo Cold Storage. Stabilizing environment.`
        };
      default:
        return { bg: '', iconBg: '', title: '', desc: '' };
    }
  };

  const banner = getStatusBannerConfig();

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-10">
      {/* SHIPMENT SELECTOR */}
      <div className="flex items-center justify-between mb-8 group">
        <button 
          onClick={prevShipment}
          className="p-3 bg-gray-900 border border-gray-800 rounded-2xl text-gray-400 hover:text-[#EAB308] hover:border-[#EAB308] transition-all shadow-xl"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="text-center">
          <span className="text-[#EAB308] font-mono font-bold text-xs tracking-[0.2em] uppercase mb-2 block">Live Tracking — Vehicle {currentIndex + 1} of {shipments.length}</span>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
             <TruckIcon className="text-gray-600" size={32} />
             SHIPMENT <span className="text-gray-400">{currentShipment.id}</span>
          </h1>
        </div>

        <button 
          onClick={nextShipment}
          className="p-3 bg-gray-900 border border-gray-800 rounded-2xl text-gray-400 hover:text-[#EAB308] hover:border-[#EAB308] transition-all shadow-xl"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 w-[400px] left-1/2 -translate-x-1/2 z-[2000] bg-green-900/90 border border-green-500/50 text-green-400 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 transition-transform duration-500 ease-in-out ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
        <CheckCircle size={28} className="flex-shrink-0 text-green-400" />
        <div>
          <p className="font-bold text-white mb-1 leading-tight">Vehicle rerouted to Apollo Cold Storage.</p>
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
            <h3 className="text-white font-bold text-lg leading-tight mb-1">⚠️ BREACH DETECTED — {currentShipment.id}</h3>
            <p className="text-gray-300 text-sm">Cargo: {currentShipment.cargo}</p>
            <p className="text-gray-300 text-sm">Current Temp: <span className="text-red-500 font-bold">{currentTemp.toFixed(1)}°C</span> (Limit: 8°C)</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <p className="text-xs font-bold text-gray-400 tracking-wider mb-3 text-center">--- AI RECOMMENDED ACTIONS ---</p>
          <div className="bg-gray-800 border-2 border-[#EAB308] rounded-xl p-3 cursor-pointer hover:bg-gray-700 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.1)] relative" onClick={acceptBestOption}>
            <p className="absolute -top-3 left-3 bg-[#EAB308] text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Best Option</p>
            <p className="text-white font-bold text-[15px] pt-1 leading-snug">Reroute to nearest cold storage</p>
            <p className="text-gray-400 text-sm mt-1">Apollo Cold Storage — 4.2 km away</p>
            <p className="text-green-400 text-sm font-medium mt-1">ETA: 11 minutes ✓ Cargo saved</p>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={acceptBestOption} className="flex-1 bg-[#EAB308] hover:bg-yellow-500 text-black font-bold py-2.5 rounded-lg transition-colors text-sm">
            Accept Best Option
          </button>
          <button onClick={() => setShowPopup(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition-colors border border-gray-700 text-sm">
            Dismiss
          </button>
        </div>
      </div>

      <div className={`${banner.bg} border rounded-2xl p-6 flex items-center justify-center gap-6 transition-colors duration-500`}>
        <div className={`bg-white rounded-full p-2 ${banner.iconBg} shadow-lg shrink-0`}>
          {currentStatus === 'BREACH' ? <AlertTriangle size={40} className="stroke-[3]" /> : <CheckCircle size={40} className="stroke-[3]" />}
        </div>
        <div className="text-white">
          <h2 className="text-2xl font-black tracking-wide mb-1 shadow-black/20 text-shadow uppercase">{banner.title}</h2>
          <p className="text-white/90 font-medium text-lg leading-tight">{banner.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-xl relative h-[420px]">
          <MapContainer center={currentLoc} zoom={11} key={currentIndex} className="w-full h-full min-h-[420px] z-0" zoomControl={false}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
            />
            <Polyline 
              positions={[currentLoc, currentShipment.destCoords]} 
              color="#3B82F6" 
              weight={3} 
              dashArray="10, 10" 
              opacity={0.6}
            />
            <Marker position={currentLoc} icon={createIcon(currentStatus === 'SAFE' ? 'bg-green-500' : currentStatus === 'WARNING' ? 'bg-yellow-500' : currentStatus === 'REROUTING' ? 'bg-blue-500' : 'bg-red-500')}>
              <Popup className="font-sans font-bold text-sm">Vehicle: {currentShipment.id}</Popup>
            </Marker>
            <Marker position={currentShipment.destCoords} icon={destIcon}>
              <Popup className="font-sans font-bold text-sm">Destination: {currentShipment.destination}</Popup>
            </Marker>
          </MapContainer>

          {currentIndex === 0 && (
            <button 
              onClick={triggerBreach}
              className="absolute bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-5 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse hover:animate-none transition-all z-[400] overflow-hidden flex items-center gap-2 border border-red-500/50"
            >
              <AlertTriangle size={20} />
              <span className="text-base">Simulate Breach</span>
            </button>
          )}
        </div>
        
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#EAB308]/5 rounded-bl-[100px] -z-10 animate-pulse"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <Package className="text-[#EAB308]" size={24} />
              <h3 className="text-xl font-bold text-white">Cargo Profile</h3>
            </div>
            
            <div className="space-y-6">
              <div className="relative pl-7 border-l-2 border-dashed border-gray-700 space-y-6 ml-2">
                <div className="relative">
                  <div className="absolute -left-[37px] bg-gray-900 p-1.5 border-2 border-gray-600 rounded-full z-10">
                    <MapPin size={12} className="text-gray-400" />
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Origin</p>
                  <p className="text-white font-medium text-sm">{currentShipment.origin}</p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[37px] bg-gray-900 p-1.5 border-2 border-[#EAB308] rounded-full z-10">
                    <Navigation size={12} className="text-[#EAB308]" />
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Destination</p>
                  <p className="text-white font-medium text-sm leading-tight">{currentShipment.destination}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 block">Cargo Type</p>
                <div className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700 inline-block text-white font-semibold text-sm">
                  {currentShipment.cargo}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-2">
                <Clock className="text-blue-400" size={24} />
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Est. Arrival</p>
                <p className="text-2xl font-mono font-bold text-white">{etaMinutes}:{etaSeconds.toString().padStart(2, '0')}</p>
             </div>
             <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                <div className={currentStatus === 'BREACH' ? 'text-red-500' : 'text-[#EAB308]'}>
                  {currentStatus === 'BREACH' ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest relative z-10">Live Temp</p>
                <p className={`text-2xl font-mono font-bold relative z-10 ${currentStatus === 'BREACH' ? 'text-red-500' : 'text-white'}`}>{currentTemp.toFixed(1)}<span className="text-sm text-gray-400">°C</span></p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6 font-mono border-b border-gray-800 pb-4">Current Shipment Temp History</h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="time" stroke="#6B7280" tick={{fill: '#6B7280', fontSize: 12, fontWeight: 600}} tickLine={false} axisLine={false} />
              <YAxis domain={currentShipment.baseTemp < 0 ? [-25, 0] : [0, 10]} stroke="#6B7280" tick={{fill: '#6B7280', fontSize: 12, fontWeight: 600}} tickLine={false} axisLine={false} tickCount={6} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#EAB308', fontWeight: '900', fontSize: '16px' }}
                labelStyle={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}
              />
              <ReferenceLine y={currentShipment.baseTemp < 0 ? -15 : 8} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={2} label={{ position: 'top', value: 'Safe limit', fill: '#EF4444', fontSize: 12, fontWeight: 'bold' }} />
              <Line 
                type="monotone" 
                dataKey="temp" 
                stroke="#EAB308" 
                strokeWidth={4} 
                dot={{ r: 4, strokeWidth: 2, fill: '#111827', stroke: '#EAB308' }} 
                activeDot={{ r: 8, fill: '#EAB308', stroke: '#111827', strokeWidth: 2 }} 
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
