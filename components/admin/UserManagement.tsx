
import React, { useState } from 'react';
import { User } from '../../types';
import { Card, Badge } from '../ui';
import { Search, CheckCircle, Ban, ShieldAlert, UserCheck, Loader2 } from 'lucide-react';
import { AdminService } from '../../lib/api';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  setUsers: (users: User[]) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, setUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (userId: string, status: 'VALIDATED' | 'BANNED' | 'PENDING') => {
    setLoadingAction(userId);
    try {
        await AdminService.updateUserStatus(userId, status);
        // Optimistic UI update
        setUsers(users.map(u => u.id === userId ? { ...u, status: status } : u));
    } catch (e) {
        console.error(e);
        alert("Erreur lors de la mise à jour du statut.");
    } finally {
        setLoadingAction(null);
    }
  };

  const handleBanUser = (userId: string) => {
    if (confirm('Bannir cet utilisateur ? Il ne pourra plus accéder au quartier.')) {
       handleUpdateStatus(userId, 'BANNED');
    }
  };

  return (
    <div className="space-y-4 animate-pop">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Rechercher un habitant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border-2 border-slate-300 rounded-xl pl-10 pr-4 py-3 font-bold text-slate-800 focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-brand-300 transition-colors">
            <div className="flex items-center">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white mr-3 shadow-sm border-2 border-white
                  ${user.role === 'ADMIN' ? 'bg-purple-600' : 
                    user.role === 'SECURITY' ? 'bg-slate-800' : 
                    user.status === 'BANNED' ? 'bg-red-200' : 'bg-brand-500'}`}
               >
                 {loadingAction === user.id ? <Loader2 className="animate-spin" size={16}/> : (user.status === 'BANNED' ? <Ban size={16} className="text-red-600"/> : user.name.charAt(0))}
               </div>
               <div>
                 <p className={`font-bold text-sm ${user.status === 'BANNED' ? 'text-red-400 line-through' : 'text-slate-900'}`}>{user.name}</p>
                 <div className="flex items-center space-x-2">
                    <Badge color={user.role === 'ADMIN' ? 'blue' : 'gray'}>{user.role}</Badge>
                    {user.status === 'PENDING' && <Badge color="yellow">En attente</Badge>}
                    {user.status === 'BANNED' && <Badge color="red">Banni</Badge>}
                 </div>
               </div>
            </div>
            
            <div className="flex space-x-2">
               {user.status === 'PENDING' && (
                 <button onClick={() => handleUpdateStatus(user.id, 'VALIDATED')} disabled={!!loadingAction} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50" title="Valider">
                   <CheckCircle size={18} strokeWidth={2.5} />
                 </button>
               )}
               
               {user.status === 'BANNED' ? (
                 <button onClick={() => handleUpdateStatus(user.id, 'VALIDATED')} disabled={!!loadingAction} className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50" title="Débannir">
                   <UserCheck size={18} strokeWidth={2.5} />
                 </button>
               ) : (
                 user.id !== currentUser.id && (
                   <button onClick={() => handleBanUser(user.id)} disabled={!!loadingAction} className="p-2 bg-red-50 text-red-300 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50" title="Bannir">
                     <Ban size={18} strokeWidth={2.5} />
                   </button>
                 )
               )}
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
            <div className="text-center p-8 text-slate-400 font-bold border-2 border-dashed border-slate-300 rounded-xl">
                Aucun habitant trouvé.
            </div>
        )}
      </div>
    </div>
  );
};
