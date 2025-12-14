
import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { X, ShieldCheck, CheckCircle2, Loader2, Edit2, Save, Camera } from 'lucide-react';
import QRCode from 'qrcode';
import { UserService } from '../lib/api'; // Service Layer

interface DigitalIDProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalID: React.FC<DigitalIDProps> = ({ user, isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editAvatar, setEditAvatar] = useState(user.avatar || '');

  useEffect(() => {
    if (isOpen && user) {
      setEditPhone(user.phone);
      setEditAvatar(user.avatar || '');
      
      const payload = JSON.stringify({
        id: user.id,
        role: user.role,
        valid: user.status === 'VALIDATED',
        timestamp: Date.now()
      });

      QRCode.toDataURL(payload, { 
        width: 300,
        margin: 1,
        color: {
          dark: '#ffffff',
          light: '#0f172a'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error(err));
    }
  }, [isOpen, user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // APPEL SERVICE
      await UserService.updateProfile(user.id, {
        phone: editPhone,
        avatar: editAvatar
      });
      
      alert("Profil mis à jour ! Rechargement...");
      window.location.reload(); 
    } catch (e) {
      console.error(e);
      alert("Erreur de sauvegarde");
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  if (!isOpen) return null;

  const roleColors = {
    RESIDENT: 'bg-brand-600',
    ADMIN: 'bg-purple-600',
    WORKER: 'bg-orange-500',
    SECURITY: 'bg-slate-800',
    GOD: 'bg-amber-500 text-black'
  };

  const roleLabel = {
    RESIDENT: 'RÉSIDENT',
    ADMIN: 'BUREAU',
    WORKER: 'STAFF',
    SECURITY: 'SÉCURITÉ',
    GOD: 'SUPER ADMIN'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-pop">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* The ID Card */}
      <div className="w-full max-w-sm relative z-10 perspective-1000">
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white relative">
          {/* Header Strip */}
          <div className={`${roleColors[user.role] || 'bg-brand-600'} p-6 pb-12 relative overflow-hidden`}>
             <div className="absolute top-0 right-0 p-4 opacity-20">
               <ShieldCheck size={120} />
             </div>
             <div className="relative z-10 flex justify-between items-start">
               <div>
                 <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${user.role === 'GOD' ? 'text-black/60' : 'text-white/80'}`}>MON QUARTIER</p>
                 <h2 className={`text-2xl font-black tracking-tight ${user.role === 'GOD' ? 'text-black' : 'text-white'}`}>PASS ACCÈS</h2>
               </div>
               
               {!isEditing ? (
                 <button onClick={() => setIsEditing(true)} className="p-2 bg-white/20 rounded-xl hover:bg-white/40 text-white">
                    <Edit2 size={20} />
                 </button>
               ) : (
                 <button onClick={handleSaveProfile} disabled={loading} className="p-2 bg-green-500 rounded-xl hover:bg-green-400 text-white shadow-lg border-b-2 border-green-700 active:border-b-0 active:translate-y-0.5">
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                 </button>
               )}
             </div>
          </div>

          {/* Content Body */}
          <div className="px-6 pb-6 -mt-8 relative z-20">
             <div className="bg-white rounded-2xl p-1 shadow-lg border border-slate-100 flex flex-col items-center">
                {/* Avatar / Photo */}
                <div className="w-24 h-24 rounded-2xl bg-slate-200 border-4 border-white shadow-md -mt-12 flex items-center justify-center text-4xl overflow-hidden relative z-30 group">
                   {!isEditing ? (
                      user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-slate-400">{user.name.charAt(0)}</span>
                      )
                   ) : (
                      <div className="relative w-full h-full bg-slate-100">
                         {editAvatar ? (
                             <img src={editAvatar} className="w-full h-full object-cover opacity-50" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center"><Camera size={32} className="text-slate-400"/></div>
                         )}
                         {/* Simple Input Overlay for URL */}
                         <input 
                           type="text" 
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           placeholder="Paste URL..." 
                           onClick={(e) => {
                             const url = prompt("Entrez l'URL de votre photo :");
                             if(url) setEditAvatar(url);
                           }} 
                         />
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black bg-black/50 text-white px-2 py-1 rounded">MODIFIER</span>
                         </div>
                      </div>
                   )}
                </div>

                <div className="text-center mt-3 mb-4 w-full">
                  <h3 className="text-xl font-black text-slate-900 leading-none mb-1">{user.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${roleColors[user.role]}`}>
                    {roleLabel[user.role]}
                  </span>
                  
                  {isEditing && (
                    <div className="mt-4 px-4">
                       <label className="text-[10px] font-bold text-slate-400 uppercase">Téléphone</label>
                       <input 
                         type="tel"
                         value={editPhone}
                         onChange={(e) => setEditPhone(e.target.value)}
                         className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:border-brand-500 outline-none"
                       />
                    </div>
                  )}
                </div>

                {/* QR Code Area - HIDDEN DURING EDIT */}
                {!isEditing && (
                  <>
                    <div className="bg-slate-900 p-4 rounded-xl w-full aspect-square flex items-center justify-center relative overflow-hidden group shadow-inner">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                      
                      {qrDataUrl ? (
                        <img src={qrDataUrl} className="w-full h-full object-contain relative z-10 mix-blend-screen" alt="QR Code" />
                      ) : (
                        <Loader2 className="animate-spin text-white" />
                      )}
                      
                      {/* Scan Line Animation */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-[scan_2s_ease-in-out_infinite] z-20 pointer-events-none"></div>
                    </div>

                    <div className="mt-4 flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200 w-full justify-center">
                      <CheckCircle2 size={16} className="mr-2" strokeWidth={3} />
                      <span className="text-xs font-black uppercase tracking-wide">Compte Vérifié • Actif</span>
                    </div>

                    <div className="mt-2 text-center">
                      <p className="text-[10px] text-slate-400 font-mono">ID: {user.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                  </>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
