import { Trophy, Star, AlertCircle, ShieldAlert, CheckCircle, BarChart3, AlertTriangle, Clock } from 'lucide-react';

const drivers = [
  { id: 1, name: 'Arjun Kumar', score: 94, doorOpens: 3, routeDeviations: 0, deliveries: 12, status: 'EXCELLENT' },
  { id: 2, name: 'Priya Rajan', score: 87, doorOpens: 5, routeDeviations: 1, deliveries: 10, status: 'GOOD' },
  { id: 3, name: 'Suresh M', score: 73, doorOpens: 8, routeDeviations: 2, deliveries: 9, status: 'AVERAGE' },
  { id: 4, name: 'Deepak S', score: 61, doorOpens: 11, routeDeviations: 3, deliveries: 8, status: 'WATCH' },
  { id: 5, name: 'Ravi T', score: 42, doorOpens: 17, routeDeviations: 5, deliveries: 6, status: 'AT RISK' },
];

export default function Drivers() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-4">
            <Trophy className="text-[#EAB308]" size={36} />
            Driver Performance
          </h1>
          <p className="text-gray-400 font-medium text-lg border-l-2 border-[#EAB308] pl-3">Fleet compliance ranking and safety tracking</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative pt-[1px] shadow-black/50">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#EAB308] to-transparent opacity-50"></div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-950/80 border-b border-gray-800">
                <th className="p-6 text-gray-500 font-black text-[10px] uppercase tracking-widest w-16">Rank</th>
                <th className="p-6 text-gray-500 font-black text-[10px] uppercase tracking-widest">Name</th>
                <th className="p-6 text-gray-500 font-black text-[10px] uppercase tracking-widest">Score (0-100)</th>
                <th className="p-6 text-gray-500 font-black text-[10px] uppercase tracking-widest text-center">Door Opens Today</th>
                <th className="p-6 text-gray-500 font-black text-[10px] uppercase tracking-widest text-center">Route Deviations</th>
                <th className="p-6 text-gray-500 font-black text-[10px] uppercase tracking-widest text-center">Deliveries</th>
                <th className="p-6 text-gray-500 font-black text-[10px] uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {drivers.map((driver, index) => {
                const isTop = index === 0;
                const isBottom = index === drivers.length - 1;
                
                let rowStyle = "hover:bg-gray-800/50 transition-colors";
                if (isTop) rowStyle = "bg-[#EAB308]/10 hover:bg-[#EAB308]/15 border-l-4 border-l-[#EAB308]";
                else if (isBottom) rowStyle = "bg-red-500/10 hover:bg-red-500/15 border-l-4 border-l-red-500";
                else rowStyle += " border-l-4 border-l-transparent";

                const isGreen = driver.status === 'EXCELLENT' || driver.status === 'GOOD';
                const isYellow = driver.status === 'AVERAGE';
                const isOrange = driver.status === 'WATCH';
                const isRed = driver.status === 'AT RISK';

                return (
                  <tr key={driver.id} className={rowStyle}>
                    <td className="p-6 font-black text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 text-center text-lg ${isTop ? 'text-[#EAB308]' : isBottom ? 'text-red-400' : ''}`}>
                          #{index + 1}
                        </span>
                        {isTop && <Star className="text-[#EAB308] drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" size={18} fill="currentColor" />}
                      </div>
                    </td>
                    <td className="p-6 font-bold text-white text-[15px]">{driver.name}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-full bg-gray-800 rounded-full h-2.5 max-w-[140px] overflow-hidden border border-gray-700/50">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              isGreen ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                              isYellow ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 
                              isOrange ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 
                              'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                            }`}
                            style={{ width: `${driver.score}%` }}
                          ></div>
                        </div>
                        <span className={`font-mono font-black text-lg w-8 ${
                           isGreen ? 'text-green-400' : 
                           isYellow ? 'text-yellow-400' : 
                           isOrange ? 'text-orange-400' : 
                           'text-red-400'
                        }`}>{driver.score}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-gray-300 font-mono font-bold bg-gray-950 px-4 py-1.5 rounded-lg border border-gray-800">{driver.doorOpens}</span>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-gray-300 font-mono font-bold bg-gray-950 px-4 py-1.5 rounded-lg border border-gray-800">{driver.routeDeviations}</span>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-gray-300 font-mono font-bold bg-gray-950 px-4 py-1.5 rounded-lg border border-gray-800">{driver.deliveries}</span>
                    </td>
                    <td className="p-6 text-right">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        isGreen ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]' :
                        isYellow ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                        isOrange ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                        'bg-red-500/10 text-red-500 border-red-500/30 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]'
                      }`}>
                        {isGreen && <CheckCircle size={14} className="stroke-[3]" />}
                        {(isYellow || isOrange) && <AlertCircle size={14} className="stroke-[3]" />}
                        {isRed && <ShieldAlert size={14} className="stroke-[3]" />}
                        {driver.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex items-center gap-6 shadow-xl relative overflow-hidden group">
            <div className="bg-[#EAB308]/10 text-[#EAB308] p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <BarChart3 size={32} />
            </div>
            <div>
              <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-1">Fleet Average Score</p>
              <p className="text-white font-mono font-black text-4xl tracking-tight">71.4</p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#EAB308]/5 rounded-bl-[100px] -z-10"></div>
         </div>

         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex items-center gap-6 shadow-xl relative overflow-hidden group">
            <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <AlertTriangle size={32} />
            </div>
            <div>
              <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-1">Breaches Today</p>
              <p className="text-white font-mono font-black text-4xl tracking-tight">1</p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[100px] -z-10"></div>
         </div>

         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex items-center gap-6 shadow-xl relative overflow-hidden group">
            <div className="bg-green-500/10 text-green-400 p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <Clock size={32} />
            </div>
            <div>
              <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-1">On-Time Delivery Rate</p>
              <p className="text-white font-mono font-black text-4xl tracking-tight">87<span className="text-2xl text-gray-500">%</span></p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-[100px] -z-10"></div>
         </div>
      </div>
    </div>
  );
}
