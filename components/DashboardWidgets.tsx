
import React from 'react';
import { User, Article } from '../types';
import { Sun, TrendingUp, Users, Vote, HardHat, Zap, Clock, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { ProgressBar, Button, Card } from './ui';

export const UserHeader: React.FC<{ user: User }> = ({ user }) => (
  <header className="flex justify-between items-center bg-white p-4 rounded-3xl border-2 border-slate-300 shadow-game">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl border-b-4 border-brand-800 shadow-lg">
        {user.name.charAt(0)}
      </div>
      <div>
        <h1 className="text-xl font-black text-slate-900 leading-none">{user.name}</h1>
        <div className="flex items-center mt-1">
          <span className="bg-brand-100 text-brand-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide border border-brand-300">{user.role}</span>
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="flex items-center justify-end text-orange-500 font-black text-xl drop-shadow-sm">
        <Sun size={24} className="mr-1 fill-current" strokeWidth={3} />
        <span>32°</span>
      </div>
      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Abidjan</span>
    </div>
  </header>
);

export const StatusWidget: React.FC<{ isLate: boolean; onNavigate: (v: string) => void }> = ({ isLate, onNavigate }) => (
  <div className="bg-white p-4 rounded-3xl border-2 border-slate-300 shadow-game flex flex-col space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 border border-black/10 ${isLate ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
        Statut Financier
      </span>
      <span className={`text-xs font-black px-2 py-1 rounded-lg border ${isLate ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
        {isLate ? 'EN RETARD' : 'OK'}
      </span>
    </div>
    <div className="flex items-center space-x-3">
      <div className="flex-1">
         <ProgressBar 
           value={isLate ? 35 : 100} 
           max={100} 
           color={isLate ? 'bg-red-500' : 'bg-green-500'} 
         />
      </div>
      {isLate && (
        <Button size="sm" variant="danger" onClick={() => onNavigate('finances')} className="shrink-0 text-xs py-2 h-8">
          PAYER
        </Button>
      )}
    </div>
  </div>
);

export const ActionGrid: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => (
  <section className="grid grid-cols-3 gap-3">
    <button onClick={() => onNavigate('finances')} className="group relative overflow-hidden flex flex-col items-center p-3 bg-white rounded-3xl border-2 border-b-4 border-slate-300 active:border-b-2 active:translate-y-1 transition-all shadow-sm hover:border-green-300">
      <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative w-12 h-12 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-inner border border-green-200">
        <TrendingUp size={24} strokeWidth={3} />
      </div>
      <span className="relative text-[10px] font-black text-slate-700 uppercase tracking-wide group-hover:text-green-800">Cotiser</span>
    </button>
    <button onClick={() => onNavigate('chat')} className="group relative overflow-hidden flex flex-col items-center p-3 bg-white rounded-3xl border-2 border-b-4 border-slate-300 active:border-b-2 active:translate-y-1 transition-all shadow-sm hover:border-purple-300">
      <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-inner border border-purple-200">
        <Users size={24} strokeWidth={3} />
      </div>
      <span className="relative text-[10px] font-black text-slate-700 uppercase tracking-wide group-hover:text-purple-800">Discuter</span>
    </button>
    <button onClick={() => onNavigate('services')} className="group relative overflow-hidden flex flex-col items-center p-3 bg-white rounded-3xl border-2 border-b-4 border-slate-300 active:border-b-2 active:translate-y-1 transition-all shadow-sm hover:border-orange-300">
      <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-inner border border-orange-200">
        <HardHat size={24} strokeWidth={2.5} /> 
      </div>
      <span className="relative text-[10px] font-black text-slate-700 uppercase tracking-wide group-hover:text-orange-800">Travaux</span>
    </button>
  </section>
);

export interface FeedItem {
  id: string;
  type: 'VOTE' | 'JOB' | 'ALERT' | 'INFO';
  title: string;
  subtitle: string;
  timeLabel: string;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  icon: React.ElementType;
}

export const ActivityFeed: React.FC<{ items: FeedItem[] }> = ({ items }) => (
  <section>
    <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3 px-1">En direct</h2>
    <div className="space-y-3">
      {items.length > 0 ? items.map(item => (
        <Card key={item.id} className="p-3 flex items-center space-x-3 border-2 border-slate-300 shadow-sm bg-white hover:bg-slate-50 transition-colors">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
              item.color === 'blue' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              item.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' :
              item.color === 'purple' ? 'bg-purple-100 text-purple-800 border-purple-200' :
              item.color === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-200' :
              'bg-red-100 text-red-800 border-red-200'
          }`}>
             <item.icon size={20} strokeWidth={3} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-900 leading-tight truncate">{item.title}</p>
            <p className="text-[10px] text-slate-600 font-bold uppercase mt-0.5 truncate">{item.subtitle}</p>
          </div>
          <span className="text-[10px] font-black text-slate-700 bg-slate-200 px-2 py-1 rounded-lg border border-slate-300 whitespace-nowrap">{item.timeLabel}</span>
        </Card>
      )) : (
        <div className="text-center p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
           <Info size={24} className="text-slate-400 mx-auto mb-2" />
           <p className="text-xs font-bold text-slate-500">Rien à signaler pour le moment.</p>
        </div>
      )}
    </div>
  </section>
);

export const FlashInfoTrigger: React.FC<{ onOpen: () => void; latestArticle?: Article }> = ({ onOpen, latestArticle }) => (
  <section>
    <div className="flex items-center mb-3 px-1">
      <Zap size={20} className="text-accent-yellow mr-2 fill-current stroke-black" strokeWidth={1.5} />
      <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">À la Une</h2>
    </div>
    
    <button onClick={onOpen} className="w-full text-left group">
      <Card className="relative h-48 bg-slate-900 border-2 border-slate-900 shadow-xl overflow-hidden group-active:scale-[0.98] transition-transform">
        {latestArticle ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900/80 to-transparent z-10"></div>
            <img 
              src={latestArticle.image} 
              alt={latestArticle.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-105"
            />
            
            <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${latestArticle.category === 'URGENT' ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-brand-600 border-brand-400'}`}>
                  {latestArticle.category}
                </span>
                <span className="text-slate-200 text-[10px] font-bold uppercase flex items-center"><Clock size={12} className="mr-1"/> {latestArticle.date}</span>
              </div>
              <h3 className="text-2xl font-black text-white leading-none mb-2 drop-shadow-md line-clamp-2">{latestArticle.title}</h3>
              <div className="mt-3 text-brand-200 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors flex items-center">
                Lire l'article <div className="ml-2 h-0.5 w-4 bg-current"></div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <Info size={32} className="mb-2 opacity-50"/>
             <span className="text-xs font-bold uppercase">Aucune actualité</span>
          </div>
        )}
      </Card>
    </button>
  </section>
);
