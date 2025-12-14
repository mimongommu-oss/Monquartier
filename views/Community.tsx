
import React, { useState, useEffect, useMemo } from 'react';
import { Vote, MessageSquare, User as UserIcon } from 'lucide-react';
import { User, Channel } from '../types';
import { GovernanceView } from '../components/community/GovernanceView';
import { ChatView } from '../components/community/ChatView';
import { MembersView } from '../components/community/MembersView';
import { useData } from '../hooks/useData';
import { MOCK_CHANNELS } from '../constants';

interface CommunityProps {
  currentUser: User;
  initialTab?: 'VOTE' | 'CHAT' | 'MEMBERS';
}

export const Community: React.FC<CommunityProps> = ({ currentUser, initialTab = 'VOTE' }) => {
  const [activeTab, setActiveTab] = useState<'VOTE' | 'CHAT' | 'MEMBERS'>(initialTab);
  
  // Update internal state when prop changes (Routing from Dashboard)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // Lifted state for Cross-Component Interaction (Members -> Chat)
  const [targetDmUser, setTargetDmUser] = useState<User | null>(null);

  // DATA FETCHING
  // Note de sécurité : Dans une vraie prod avec RLS (Row Level Security), 
  // Supabase ne renverrait que les canaux autorisés. Ici, on simule ce comportement
  // en filtrant immédiatement après le fetch pour ne pas passer de données sensibles aux enfants.
  const { data: rawChannels, setData: setRawChannels } = useData<Channel>('channels', MOCK_CHANNELS);

  // SÉCURITÉ : Filtrage strict des canaux visibles par l'utilisateur
  const visibleChannels = useMemo(() => {
    return rawChannels.filter(channel => {
      // 1. Canaux Publics : Tout le monde voit
      if (channel.type === 'PUBLIC') return true;
      
      // 2. Canaux Privés / DM : Seulement si je suis membre ou créateur
      const isMember = channel.members?.includes(currentUser.id);
      const isCreator = channel.creatorId === currentUser.id;
      const isInitiator = channel.initiatorId === currentUser.id; // Pour les DM en attente
      
      return isMember || isCreator || isInitiator;
    });
  }, [rawChannels, currentUser.id]);

  const handleStartDM = (user: User) => {
    setTargetDmUser(user);
    setActiveTab('CHAT');
  };

  const clearTargetDm = () => setTargetDmUser(null);

  // Wrapper pour mettre à jour les canaux depuis l'enfant (ChatView)
  const handleUpdateChannels = (updatedChannels: Channel[]) => {
    // On ne met à jour que si nécessaire pour éviter les boucles
    setRawChannels(updatedChannels);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {activeTab !== 'CHAT' && (
        <header className="px-1 shrink-0 animate-pop">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Communauté</h1>
          <p className="text-slate-600 font-bold">Décider & Échanger ensemble</p>
        </header>
      )}
      
      <div className={`flex p-1 bg-slate-300 rounded-xl shrink-0 animate-pop overflow-x-auto no-scrollbar ${activeTab === 'CHAT' && targetDmUser ? 'hidden' : ''}`}>
        <button 
          onClick={() => setActiveTab('VOTE')}
          className={`flex-1 min-w-[100px] py-3 text-xs font-black rounded-lg transition-all flex items-center justify-center ${activeTab === 'VOTE' ? 'bg-white text-slate-900 shadow-sm border-2 border-slate-200' : 'text-slate-600 hover:text-slate-800'}`}
        >
          <Vote size={16} className="mr-2" strokeWidth={2.5}/> VOTES
        </button>
        <button 
          onClick={() => setActiveTab('CHAT')}
          className={`flex-1 min-w-[100px] mx-1 py-3 text-xs font-black rounded-lg transition-all flex items-center justify-center ${activeTab === 'CHAT' ? 'bg-white text-brand-700 shadow-sm border-2 border-brand-100' : 'text-slate-600 hover:text-slate-800'}`}
        >
          <MessageSquare size={16} className="mr-2" strokeWidth={2.5}/> SALONS
        </button>
        <button 
          onClick={() => setActiveTab('MEMBERS')}
          className={`flex-1 min-w-[100px] py-3 text-xs font-black rounded-lg transition-all flex items-center justify-center ${activeTab === 'MEMBERS' ? 'bg-white text-purple-700 shadow-sm border-2 border-purple-100' : 'text-slate-600 hover:text-slate-800'}`}
        >
          <UserIcon size={16} className="mr-2" strokeWidth={2.5}/> HABITANTS
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col">
        {activeTab === 'VOTE' && <GovernanceView />}

        {activeTab === 'CHAT' && (
          <ChatView 
            currentUser={currentUser} 
            channels={visibleChannels} // On passe uniquement les canaux filtrés
            setChannels={handleUpdateChannels}
            targetDmUser={targetDmUser}
            onClearTarget={clearTargetDm}
          />
        )}

        {activeTab === 'MEMBERS' && (
          <MembersView 
            currentUser={currentUser} 
            onStartDM={handleStartDM} 
          />
        )}
      </div>
    </div>
  );
};
