
import React, { useState } from 'react';
import { MOCK_JOBS, MOCK_CLASSIFIEDS } from '../constants';
import { Job, Classified, User } from '../types';
import { useData } from '../hooks/useData';
import { Briefcase, ShoppingBag, Trash2 } from 'lucide-react';
import { JobsModule } from '../components/services/JobsModule';
import { MarketplaceModule } from '../components/services/MarketplaceModule';
import { WasteModule } from '../components/services/WasteModule';

interface ServicesProps {
  user: User;
}

export const Services: React.FC<ServicesProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'JOBS' | 'MARKET' | 'TRASH'>('JOBS');
  
  // Data Fetching
  const { data: jobs, loading: loadingJobs } = useData<Job>('jobs', MOCK_JOBS, undefined, user.communityId);
  const { data: classifieds, loading: loadingAds, setData: setClassifieds } = useData<Classified>('classifieds', MOCK_CLASSIFIEDS, undefined, user.communityId);

  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Services & Annonces</h1>
        <p className="text-slate-600 font-bold">Entraide et Échanges</p>
      </header>

      {/* Main Toggle Switch */}
      <div className="bg-slate-300 p-1.5 rounded-2xl flex relative shadow-inner overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('JOBS')}
          className={`flex-1 min-w-[90px] py-3 text-[10px] sm:text-xs font-black rounded-xl transition-all duration-300 z-10 flex items-center justify-center ${activeTab === 'JOBS' ? 'bg-white text-slate-900 shadow-md transform scale-100 border-2 border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Briefcase size={16} className="mr-1 sm:mr-2" strokeWidth={2.5} />
          MISSIONS
        </button>
        <button 
          onClick={() => setActiveTab('MARKET')}
          className={`flex-1 min-w-[90px] mx-1 py-3 text-[10px] sm:text-xs font-black rounded-xl transition-all duration-300 z-10 flex items-center justify-center ${activeTab === 'MARKET' ? 'bg-white text-slate-900 shadow-md transform scale-100 border-2 border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <ShoppingBag size={16} className="mr-1 sm:mr-2" strokeWidth={2.5} />
          ANNONCES
        </button>
        <button 
          onClick={() => setActiveTab('TRASH')}
          className={`flex-1 min-w-[90px] py-3 text-[10px] sm:text-xs font-black rounded-xl transition-all duration-300 z-10 flex items-center justify-center ${activeTab === 'TRASH' ? 'bg-white text-slate-900 shadow-md transform scale-100 border-2 border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Trash2 size={16} className="mr-1 sm:mr-2" strokeWidth={2.5} />
          POUBELLES
        </button>
      </div>

      {activeTab === 'JOBS' && (
        <JobsModule jobs={jobs} loading={loadingJobs} communityId={user.communityId} />
      )}

      {activeTab === 'MARKET' && (
        <MarketplaceModule 
           user={user} 
           classifieds={classifieds} 
           loading={loadingAds} 
           setClassifieds={setClassifieds} 
        />
      )}

      {activeTab === 'TRASH' && (
        <WasteModule />
      )}
    </div>
  );
};
