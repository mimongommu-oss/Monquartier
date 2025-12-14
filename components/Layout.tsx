import React, { useState, useEffect } from 'react';
import { Home, DollarSign, Users, Briefcase, Shield, LogOut, Settings, WifiOff, RefreshCw } from 'lucide-react';
import { User } from '../types';
import { DigitalID } from './DigitalID';
import { Button } from './ui';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, user, onLogout }) => {
  const [showID, setShowID] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!user) return <>{children}</>;

  const handleNav = (view: string) => {
    if (navigator.vibrate) navigator.vibrate(10);
    onNavigate(view);
  };

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'QG' },
    { id: 'finances', icon: DollarSign, label: 'Banque' },
    { id: 'community', icon: Users, label: 'Communauté' },
    { id: 'services', icon: Briefcase, label: 'Jobs' },
    { id: 'security', icon: Shield, label: 'SOS', highlight: true },
  ];

  return (
    <div className="h-[100dvh] w-full bg-slate-200 flex flex-col relative overflow-hidden">
      
      {/* OFFLINE BANNER (Non-blocking) */}
      {isOffline && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs font-black uppercase tracking-widest text-center shadow-md z-50 flex items-center justify-center animate-pop">
           <WifiOff size={14} className="mr-2" />
           Mode Hors-Ligne • Lecture Seule
        </div>
      )}

      {/* Header Mobile / HUD Top */}
      <div className="flex-none bg-white/95 backdrop-blur-md px-4 pt-safe-top pb-3 flex justify-between items-center z-20 shadow-sm border-b-2 border-slate-300 h-16 transition-all duration-300">
         <button 
           onClick={() => setShowID(true)}
           className="flex items-center active:opacity-70 transition-opacity group"
         >
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black mr-2 border-2 border-brand-700 shadow-sm group-hover:scale-105 transition-transform overflow-hidden relative">
              {user.avatar ? (
                <img src={user.avatar} alt="Me" className="w-full h-full object-cover" />
              ) : (
                <span>{user.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col items-start">
               <span className="font-black text-lg text-slate-900 tracking-tight leading-none">MON QUARTIER</span>
               <div className="flex items-center space-x-1">
                 <span className={`flex h-2 w-2 relative ${isOffline ? 'grayscale' : ''}`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOffline ? 'bg-slate-400' : 'bg-green-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isOffline ? 'bg-slate-500' : 'bg-green-500'}`}></span>
                 </span>
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                   {isOffline ? 'DÉCONNECTÉ' : 'EN LIGNE'}
                 </span>
               </div>
            </div>
         </button>
         <div className="flex space-x-2">
            {user.role === 'ADMIN' && (
              <button 
                onClick={() => handleNav('admin')} 
                className={`p-2 rounded-xl border transition-transform ${activeView === 'admin' ? 'bg-brand-600 text-white border-brand-800' : 'bg-slate-100 text-slate-600 hover:text-brand-600 border-slate-300'}`}
              >
                 <Settings size={20} strokeWidth={2.5} />
              </button>
            )}
            <button onClick={onLogout} className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:text-red-600 border border-slate-300 active:scale-95 transition-transform">
              <LogOut size={20} strokeWidth={2.5} />
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto overflow-x-hidden p-4 pb-28 scroll-smooth w-full relative z-0 ${isOffline ? 'opacity-90' : ''}`}>
        <div className="animate-pop w-full max-w-5xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation HUD */}
      <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <nav className="bg-slate-900/95 backdrop-blur-lg rounded-3xl shadow-2xl p-2 flex justify-between items-center border-2 border-slate-700 w-full max-w-lg mx-4 pointer-events-auto">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            
            if (item.highlight) {
              return (
                <button 
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="relative -top-8 mx-1 group"
                >
                  <div className="w-16 h-16 rounded-3xl bg-red-600 border-4 border-slate-200 shadow-xl flex items-center justify-center text-white transform transition-all active:scale-90 hover:scale-105 active:bg-red-700 group-hover:-translate-y-1">
                     <Icon size={28} className="animate-pulse" strokeWidth={3} />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 rounded-2xl ${isActive ? 'bg-white/10' : ''}`}
              >
                <div className={`transition-all duration-300 transform ${isActive ? 'text-brand-400 scale-110 -translate-y-1' : 'text-slate-400'}`}>
                  <Icon size={24} strokeWidth={isActive ? 3 : 2.5} />
                </div>
                {isActive && <div className="h-1.5 w-1.5 bg-brand-400 rounded-full mt-1"></div>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Digital ID Modal */}
      <DigitalID 
        user={user} 
        isOpen={showID} 
        onClose={() => setShowID(false)} 
      />
    </div>
  );
};