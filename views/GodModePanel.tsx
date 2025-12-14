
import React, { useState } from 'react';
import { User, Community } from '../types';
import { Button, Card, Badge } from '../components/ui';
import { useData } from '../hooks/useData';
import { MOCK_COMMUNITIES, MOCK_USERS } from '../constants';
import { AdminService } from '../lib/api'; // Service Backend
import { Eye, Search, LogOut, Plus, Loader2, Edit } from 'lucide-react';

interface GodModePanelProps {
  currentUser: User;
  onLogout: () => void;
}

export const GodModePanel: React.FC<GodModePanelProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'COMMUNITIES'>('USERS');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const { data: users, setData: setUsers } = useData<User>('profiles', MOCK_USERS);
  const { data: communities } = useData<Community>('communities', MOCK_COMMUNITIES);

  const [searchUser, setSearchUser] = useState('');

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchUser.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingAction(userId);
    try {
      // APPEL SERVICE
      await AdminService.updateUserRole(currentUser.id, userId, newRole);

      // Optimistic Update
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Erreur lors de la mise à jour du rôle.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCommunityChange = async (userId: string, newCommId: string) => {
    setLoadingAction(userId);
    try {
      // APPEL SERVICE
      await AdminService.moveUserCommunity(userId, newCommId);

      // Optimistic Update
      setUsers(users.map(u => u.id === userId ? { ...u, communityId: newCommId } : u));
    } catch (err) {
      console.error("Failed to update community:", err);
      alert("Erreur lors du transfert de quartier.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
      {/* GOD HEADER */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.5)] border-2 border-amber-300">
            <Eye size={24} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-amber-500 tracking-tight">ŒIL DE DIEU</h1>
            <p className="text-xs font-mono text-slate-500">Super Admin • {currentUser.name}</p>
          </div>
        </div>
        <Button variant="ghost" className="text-red-400 hover:bg-red-900/20 hover:text-red-200" onClick={onLogout}>
          <LogOut size={20} />
        </Button>
      </header>

      {/* TABS */}
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-lg font-bold uppercase text-xs tracking-wider border transition-all ${activeTab === 'USERS' ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
        >
          Utilisateurs ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('COMMUNITIES')}
          className={`px-4 py-2 rounded-lg font-bold uppercase text-xs tracking-wider border transition-all ${activeTab === 'COMMUNITIES' ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
        >
          Quartiers ({communities.length})
        </button>
      </div>

      {activeTab === 'USERS' && (
        <div className="space-y-4 animate-pop">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher nom, email..." 
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-amber-500 outline-none font-mono text-sm"
            />
          </div>

          <div className="grid gap-3">
             {filteredUsers.map(user => (
               <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between group hover:border-amber-500/50 transition-colors">
                  <div className="flex items-center mb-3 md:mb-0">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold mr-4 shrink-0 ${user.role === 'GOD' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                        {loadingAction === user.id ? <Loader2 className="animate-spin" /> : user.name.charAt(0)}
                     </div>
                     <div>
                        <p className="font-bold text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-500 font-mono break-all">{user.email}</p>
                        <div className="flex items-center mt-1 space-x-2">
                           <span className="text-[10px] bg-slate-800 px-2 rounded text-slate-400 border border-slate-700">{user.familyId}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                     <select 
                       value={user.role}
                       disabled={loadingAction === user.id}
                       onChange={(e) => handleRoleChange(user.id, e.target.value)}
                       className="bg-transparent text-xs font-bold text-amber-500 outline-none uppercase disabled:opacity-50"
                     >
                       <option value="RESIDENT">Résident</option>
                       <option value="ADMIN">Chef Quartier</option>
                       <option value="WORKER">Staff</option>
                       <option value="SECURITY">Sécurité</option>
                       <option value="GOD">DIEU</option>
                     </select>
                     <div className="w-px h-4 bg-slate-700"></div>
                     <select 
                       value={user.communityId}
                       disabled={loadingAction === user.id}
                       onChange={(e) => handleCommunityChange(user.id, e.target.value)}
                       className="bg-transparent text-xs font-bold text-slate-400 outline-none max-w-[100px] disabled:opacity-50"
                     >
                       <option value="global">Global</option>
                       {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'COMMUNITIES' && (
        <div className="space-y-4 animate-pop">
          <Button fullWidth variant="gold" className="mb-4 bg-amber-500 text-black border-amber-700">
            <Plus size={18} className="mr-2" /> CRÉER UN QUARTIER
          </Button>

          {communities.map(comm => (
            <Card key={comm.id} className="bg-slate-900 border-slate-800 text-slate-200 p-0 overflow-hidden">
               <div className="h-24 bg-slate-800 relative">
                  <img src={comm.coverImage} className="w-full h-full object-cover opacity-50" />
                  <div className="absolute top-2 right-2">
                    <Badge color={comm.isActive ? 'green' : 'red'}>{comm.isActive ? 'ACTIF' : 'INACTIF'}</Badge>
                  </div>
               </div>
               <div className="p-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-black text-white">{comm.name}</h3>
                      <p className="text-sm text-slate-400">{comm.city}</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 hover:text-white hover:border-white">
                      <Edit size={16} />
                    </Button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[10px] text-slate-500 uppercase font-bold">Population</p>
                       <p className="text-lg font-mono text-amber-500">{users.filter(u => u.communityId === comm.id).length}</p>
                     </div>
                     <div>
                       <p className="text-[10px] text-slate-500 uppercase font-bold">Admin</p>
                       <p className="text-sm text-slate-300 truncate">
                         {users.find(u => u.communityId === comm.id && u.role === 'ADMIN')?.name || 'Aucun'}
                       </p>
                     </div>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
