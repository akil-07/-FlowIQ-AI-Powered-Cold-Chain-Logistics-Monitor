import { NavLink, Outlet } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col pt-16 bg-gray-950 border-b-gray-800">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 z-50 px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-wider text-white">
          <Activity className="text-accent" />
          <span>Flow<span className="text-accent">IQ</span></span>
        </div>
        <div className="flex gap-6 font-medium">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "text-accent transition-colors" : "text-gray-400 hover:text-white transition-colors"}>
            Dashboard
          </NavLink>
          <NavLink to="/tracker" className={({isActive}) => isActive ? "text-accent transition-colors" : "text-gray-400 hover:text-white transition-colors"}>
            Tracker
          </NavLink>
          <NavLink to="/drivers" className={({isActive}) => isActive ? "text-accent transition-colors" : "text-gray-400 hover:text-white transition-colors"}>
            Drivers
          </NavLink>
        </div>
      </nav>
      <main className="flex-1 overflow-x-hidden p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
