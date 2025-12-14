
import React, { useState, useMemo } from 'react';
import { Card, Badge, Button } from '../ui';
import { User } from '../../types';
import { useData } from '../../hooks/useData';
import { MOCK_USERS } from '../../constants';
import { Home, MoreVertical, Search, Mail, X } from 'lucide-react';

interface MembersViewProps {
  currentUser: User;
  onStartDM: (user: User) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({ currentUser, onStartDM }) => {
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: allUsers } = useData<User>('profiles', MOCK_USERS);

  // Group Users by Family
  const groupedUsers = useMemo<{ families: Record<string, User[]>; individuals: User[] }>(() => {
    const families: Record<string, User[]> = {};
    const individuals: User[] = [];

    allUsers.forEach(u => {
      // Filter by search
      if (memberSearch && 
          !(u.name || '').toLowerCase().includes(memberSearch.toLowerCase()) && 
          !(u.familyId || '').toLowerCase().includes(memberSearch.toLowerCase())) {
        return;
      }

      if (u.familyId) {
        if (!families[u.familyId]) families[u.familyId] = [];
        families[u.familyId].push(u);
      } else {
        individuals.push(u);
      }
    });

    return { families, individuals };
  }, [allUsers, memberSearch]);

  const handleUserClick = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user && user.id !== currentUser.id) {
      setSelectedUser(user);
    }
  };

  const handleSendMessage = () => {
    if (selectedUser) {
      onStartDM(selectedUser);
      setSelectedUser(null);
    }
  };

  return (
    <div className="overflow-y-auto pb-24 animate-pop px-1">
      <div className="sticky top-0 bg-slate-200 pt-1 pb-4 z-10">
        <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Rechercher un voisin..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full bg-white border-2 border-slate-300 rounded-xl pl-10 pr-4 py-3 font-bold text-slate-800 focus:border-brand-500 focus:outline-none"
            />
        </div>
      </div>

      {/* FAMILIES */}
      {Object.keys(groupedUsers.families).length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Familles</h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(groupedUsers.families).map(([familyName, members]: [string, User[]]) => (
              <Card key={familyName} className="p-4 border-2 border-slate-300 bg-white">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 mr-3 border border-indigo-200">
                        <Home size={20} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-slate-900">{familyName}</h3>
                        <p className="text-xs font-bold text-slate-500">{members.length} membres</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pl-4 border-l-2 border-slate-100">
                    {members.map(member => (
                        <button 
                          key={member.id} 
                          onClick={() => handleUserClick(member.id)}
                          className="flex items-center p-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black text-xs mr-3 border-2 border-white shadow-sm">
                            {member.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{member.name}</span>
                          {member.role !== 'RESIDENT' && (
                              <span className="ml-auto text-[9px] font-black bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{member.role}</span>
                          )}
                        </button>
                    ))}
                  </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* INDIVIDUALS */}
      {groupedUsers.individuals.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Autres Habitants</h3>
          <div className="grid grid-cols-1 gap-2">
              {groupedUsers.individuals.map(user => (
                <button 
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center active:scale-[0.98] transition-all"
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white mr-3 border-2 border-white shadow-sm
                      ${user.role === 'ADMIN' ? 'bg-purple-600' : 
                        user.role === 'SECURITY' ? 'bg-red-600' : 
                        user.role === 'WORKER' ? 'bg-orange-500' : 'bg-slate-500'}`}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-black text-slate-900">{user.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{user.role}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <MoreVertical size={16} />
                    </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* USER PROFILE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-pop">
           <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setSelectedUser(null)}></div>
           <div className="bg-white w-full max-w-xs rounded-3xl p-1 relative z-10 shadow-2xl border-4 border-white">
              <div className="bg-slate-50 rounded-[1.3rem] p-6 flex flex-col items-center">
                 <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-lg border-4 border-white mb-4
                    ${selectedUser.role === 'ADMIN' ? 'bg-purple-600' : 
                      selectedUser.role === 'SECURITY' ? 'bg-red-600' : 
                      'bg-brand-500'}`}
                 >
                    {selectedUser.name.charAt(0)}
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 text-center leading-tight mb-1">{selectedUser.name}</h2>
                 <Badge color={selectedUser.role === 'ADMIN' ? 'blue' : 'gray'}>{selectedUser.role}</Badge>
                 {selectedUser.familyId && (
                   <span className="mt-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 flex items-center">
                      <Home size={12} className="mr-1" /> {selectedUser.familyId}
                   </span>
                 )}
                 
                 <div className="w-full h-px bg-slate-200 my-6"></div>
                 
                 <Button onClick={handleSendMessage} fullWidth variant="primary" className="mb-3">
                    <Mail size={18} className="mr-2" /> Envoyer un message
                 </Button>
                 <Button onClick={() => setSelectedUser(null)} fullWidth variant="ghost">
                    Fermer
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
