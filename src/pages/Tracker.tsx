import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CheckCircle, Clock, MapPin, Package, Navigation, ChevronLeft, ChevronRight, Truck as TruckIcon } from 'lucide-react';

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
};

const shipments: Shipment[] = [
  { 
    id: '#SHP-20482', 
    cargo: 'Hepatitis B Vaccines', 
    origin: 'Ambattur Cold Storage', 
    destination: 'Apollo Hospital, Greams Road', 
    destCoords: [13.0645, 80.2520], 
    startCoords: [13.0827, 80.2000], 
    baseTemp: 3.8, 
    etaBase: 18 
  },
  { 
    id: '#SHP-31094', 
    cargo: 'Fresh Poultry', 
    origin: 'Madhavaram Hub', 
    destination: 'Grace Supermarket, Adyar', 
    destCoords: [13.0033, 80.2555], 
    startCoords: [13.1500, 80.2300], 
    baseTemp: 2.2, 
    etaBase: 24 
  },
  { 
    id: '#SHP-12847', 
    cargo: 'Dairy Products', 
    origin: 'Aavin Dairy, Sholinganallur', 
    destination: 'Nilgiris, T Nagar', 
    destCoords: [13.0418, 80.2341], 
    startCoords: [12.9000, 80.2200], 
    baseTemp: 4.5, 
    etaBase: 31 
  },
  { 
    id: '#SHP-99281', 
    cargo: 'Frozen Sea Food', 
    origin: 'Ennore Port', 
    destination: 'Le Royal Meridien', 
    destCoords: [13.0100, 80.2000], 
    startCoords: [13.2200, 80.3200], 
    baseTemp: -18.4, 
    etaBase: 45 
  },
  { 
    id: '#SHP-55420', 
    cargo: 'Insulin Deliveries', 
    origin: 'LifeCare Pharma', 
    destination: 'MIOT Hospital', 
    destCoords: [13.0200, 80.1800], 
    startCoords: [13.0500, 80.2600], 
    baseTemp: 5.1, 
    etaBase: 12 
  }
];

export default function Tracker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentShipment = shipments[currentIndex];

  const [currentLoc, setCurrentLoc] = useState<[number, number]>(currentShipment.startCoords);
  const [currentTemp, setCurrentTemp] = useState(currentShipment.baseTemp);
  const [etaMinutes, setEtaMinutes] = useState(currentShipment.etaBase);
  const [etaSeconds, setEtaSeconds] = useState(0);
  const [chartData, setChartData] = useState(generateChartData(currentShipment.baseTemp));

  // Reset state when switching shipments
  useEffect(() => {
    setCurrentLoc(currentShipment.startCoords);
    setCurrentTemp(currentShipment.baseTemp);
    setEtaMinutes(currentShipment.etaBase);
    setEtaSeconds(0);
    setChartData(generateChartData(currentShipment.baseTemp));
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

      <div className="bg-green-600 border border-green-500 rounded-2xl p-6 flex items-center justify-center gap-6 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
        <div className="bg-white rounded-full p-2 text-green-600 shadow-lg shrink-0">
          <CheckCircle size={40} className="stroke-[3]" />
        </div>
        <div className="text-white">
          <h2 className="text-2xl font-black tracking-wide mb-1 shadow-black/20 text-shadow uppercase">Shipment Status: Healthy</h2>
          <p className="text-green-50 font-medium text-lg opacity-90 leading-tight">Climate control verified at {currentTemp.toFixed(1)}°C — Journey safe.</p>
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
            <Marker position={currentLoc} icon={createIcon("bg-green-500")}>
              <Popup className="font-sans font-bold text-sm">Vehicle: {currentShipment.id}</Popup>
            </Marker>
            <Marker position={currentShipment.destCoords} icon={destIcon}>
              <Popup className="font-sans font-bold text-sm">Destination: {currentShipment.destination}</Popup>
            </Marker>
          </MapContainer>
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
                <div className="text-[#EAB308]"><CheckCircle size={24} /></div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest relative z-10">Live Temp</p>
                <p className="text-2xl font-mono font-bold text-white relative z-10">{currentTemp.toFixed(1)}<span className="text-sm text-gray-400">°C</span></p>
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
