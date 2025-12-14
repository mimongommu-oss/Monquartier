
import React, { useState, useRef } from 'react';
import { MOCK_COMMUNITIES } from '../constants';
import { User, Community } from '../types';
import { Button, Card } from '../components/ui';
import { FamilyPassCard } from '../components/FamilyPassCard';
import { MapPin, User as UserIcon, ArrowRight, ArrowLeft, Check, Lock, Loader2, Home, Mail, Phone, Camera, X, AlertTriangle } from 'lucide-react';
import { AuthService } from '../lib/api';
import { useData } from '../hooks/useData';

interface RegisterWizardProps {
  mode: 'CREATE' | 'JOIN';
  onBack: () => void;
  onComplete: (user: User) => void;
}

export const RegisterWizard: React.FC<RegisterWizardProps> = ({ mode, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { data: communities, loading: loadingComm } = useData<Community>('communities', MOCK_COMMUNITIES);
  
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  
  // Personal Data
  const [myName, setMyName] = useState('');
  const [myEmail, setMyEmail] = useState('');
  const [myPassword, setMyPassword] = useState('');
  const [myPhone, setMyPhone] = useState('');
  const [myDob, setMyDob] = useState('');
  
  // Family Data (Mode JOIN)
  const [joinCode, setJoinCode] = useState('');
  const [foundFamilyHead, setFoundFamilyHead] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Family Data (Mode CREATE)
  const [generatedFamilyCode, setGeneratedFamilyCode] = useState('');

  // Styles definition
  const labelClass = "text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block";
  const inputClass = "w-full font-bold bg-slate-800 border-2 border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none";
  
  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'FAM-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleVerifyCode = async (codeOverride?: string) => {
    const codeToCheck = codeOverride || joinCode;
    if(!codeToCheck) return;

    setLoading(true);
    setError('');
    
    try {
      const result = await AuthService.verifyFamilyCode(codeToCheck);
      setFoundFamilyHead(result.headName);
      setJoinCode(codeToCheck);
      
      const comm = communities.find(c => c.id === result.communityId);
      if (comm) {
        setSelectedCommunity(comm);
      } else {
        setSelectedCommunity({
           id: result.communityId,
           name: "Quartier Inconnu",
           city: "...",
           themeColor: "#000000",
           isActive: true
        });
      }
      setStep(2); 
    } catch (err: any) {
      setError(err.message || "Code famille introuvable.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStep1 = () => {
    if (mode === 'CREATE') {
      const code = generateCode();
      setGeneratedFamilyCode(code);
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCommunity || !myEmail || !myPassword) return;
    setLoading(true);
    setError('');

    try {
      const finalFamilyId = mode === 'CREATE' ? generatedFamilyCode : joinCode;
      const isHead = mode === 'CREATE';

      const newUser = await AuthService.registerUser({
          email: myEmail,
          password: myPassword,
          fullName: myName,
          communityId: selectedCommunity.id,
          phone: myPhone,
          dob: myDob,
          familyId: finalFamilyId,
          isHead: isHead
      });

      onComplete(newUser);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  // ... (Scanner logic omitted for brevity as it's unchanged) ...

  return (
    <div className="min-h-[100dvh] bg-slate-900 text-white flex flex-col p-4">
      <div className="flex justify-between items-center py-4 mb-4">
        <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="p-2 bg-slate-800 rounded-full border border-slate-700 hover:bg-slate-700 text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="flex space-x-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-2 w-12 rounded-full transition-colors ${step >= s ? (mode === 'CREATE' ? 'bg-blue-500' : 'bg-purple-500') : 'bg-slate-700'}`} />
          ))}
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full animate-pop flex flex-col justify-start">
        
        {/* STEP 1: CONTEXT */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 ${mode === 'CREATE' ? 'bg-blue-600 border-white text-white shadow-xl' : 'bg-white border-purple-500 text-purple-600 shadow-xl'}`}>
                {mode === 'CREATE' ? <MapPin size={40} /> : <Home size={40} />}
              </div>
              <h2 className="text-3xl font-black text-white">{mode === 'CREATE' ? "CHOISIR QUARTIER" : "REJOINDRE FOYER"}</h2>
              <p className="text-slate-400 font-medium">
                {mode === 'CREATE' ? "Où allez-vous installer votre famille ?" : "Entrez le code famille."}
              </p>
            </div>

            {mode === 'CREATE' ? (
              <>
                <div className="space-y-4">
                  {loadingComm ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                  ) : communities.filter(c => c.isActive).length > 0 ? (
                    communities.filter(c => c.isActive).map(comm => (
                      <button
                        key={comm.id}
                        onClick={() => setSelectedCommunity(comm)}
                        className={`w-full p-4 rounded-3xl border-4 flex items-center text-left transition-all relative overflow-hidden group ${
                          selectedCommunity?.id === comm.id 
                            ? 'bg-blue-600 border-blue-400' 
                            : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex-1">
                          <h3 className={`font-black text-xl leading-tight ${selectedCommunity?.id === comm.id ? 'text-white' : 'text-slate-200'}`}>{comm.name}</h3>
                          <p className={`text-sm font-bold ${selectedCommunity?.id === comm.id ? 'text-blue-200' : 'text-slate-400'}`}>{comm.city}</p>
                        </div>
                        {selectedCommunity?.id === comm.id && (
                           <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600">
                              <Check size={20} strokeWidth={4} />
                           </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="text-center p-6 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-600">
                      <p className="text-slate-400 font-bold mb-2">Aucun quartier disponible</p>
                    </div>
                  )}
                </div>
                <Button 
                  fullWidth variant="primary" size="lg" disabled={!selectedCommunity} onClick={handleCreateStep1} className="mt-8 py-5 text-lg shadow-xl"
                >
                  SUIVANT <ArrowRight className="ml-2" />
                </Button>
              </>
            ) : (
              <div className="space-y-6">
                <Card className="bg-slate-800 border-purple-500 p-6 shadow-2xl">
                   <label className="block text-sm font-black text-purple-400 uppercase mb-4 text-center tracking-widest">Code Famille</label>
                   <input 
                     type="text" 
                     value={joinCode}
                     onChange={e => setJoinCode(e.target.value.toUpperCase())}
                     className="w-full bg-slate-900 border-4 border-slate-600 rounded-2xl p-4 text-center text-3xl font-black tracking-widest text-white focus:border-purple-500 outline-none uppercase placeholder-slate-700 transition-colors"
                     placeholder="FAM-XXXX"
                   />
                   {error && <p className="text-red-400 text-sm font-bold mt-4 text-center bg-red-900/50 p-2 rounded-lg border border-red-500">{error}</p>}
                   
                   <Button 
                     fullWidth variant="primary" size="lg" disabled={!joinCode || loading} onClick={() => handleVerifyCode()} className="mt-6 bg-purple-600 border-purple-800 hover:bg-purple-700 py-4"
                   >
                     {loading ? <Loader2 className="animate-spin" /> : "VÉRIFIER LE CODE"}
                   </Button>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: PERSONAL IDENTITY */}
        {step === 2 && (
          <div className="space-y-6">
             <div className="text-center mb-8">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-slate-600 text-slate-400">
                <UserIcon size={40} />
              </div>
              <h2 className="text-3xl font-black text-white">VOS INFOS</h2>
              {mode === 'JOIN' && foundFamilyHead ? (
                <div className="mt-2 inline-block bg-blue-900 text-blue-200 px-4 py-1 rounded-full border border-blue-500 font-bold text-sm">
                   Chez : {foundFamilyHead}
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
               <div>
                 <label className={labelClass}>Votre Nom Complet</label>
                 <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input type="text" value={myName} onChange={e => setMyName(e.target.value)} className={`${inputClass} pl-12`} placeholder="Ex: Jean Kouassi" autoComplete="name" />
                 </div>
               </div>
               
               <div>
                 <label className={labelClass}>Email Personnel</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input type="email" value={myEmail} onChange={e => setMyEmail(e.target.value)} className={`${inputClass} pl-12`} placeholder="email@exemple.com" autoComplete="email" />
                 </div>
               </div>
               
               <div>
                 <label className={labelClass}>Mot de passe</label>
                 <div className="relative">
                   <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                   <input 
                     type="password" 
                     value={myPassword} 
                     onChange={e => setMyPassword(e.target.value)} 
                     className={`${inputClass} pl-12 ${myPassword && myPassword.length < 6 ? 'border-red-500' : ''}`} 
                     placeholder="•••••••• (Min 6 caractères)" 
                     autoComplete="new-password" 
                   />
                 </div>
                 {myPassword && myPassword.length < 6 && (
                    <p className="text-red-400 text-xs mt-1 font-bold">6 caractères minimum requis.</p>
                 )}
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className={labelClass}>Date Naissance</label>
                   <input type="date" value={myDob} onChange={e => setMyDob(e.target.value)} className={`${inputClass} text-sm`} />
                 </div>
                 <div>
                   <label className={labelClass}>Téléphone</label>
                   <div className="relative">
                      <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input type="tel" value={myPhone} onChange={e => setMyPhone(e.target.value)} className={`${inputClass} pl-10`} placeholder="07..." inputMode="numeric" />
                   </div>
                 </div>
               </div>
            </div>

            <Button 
              fullWidth variant="primary" size="lg" 
              disabled={!myName || !myEmail || !myDob || !myPassword || myPassword.length < 6} 
              onClick={() => setStep(3)} 
              className="mt-8 py-5 text-lg shadow-xl"
            >
              SUIVANT <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}

        {/* STEP 3: FINALIZATION */}
        {step === 3 && (
          <div className="space-y-6 pb-20">
             <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-500 text-green-600">
                <Check size={40} strokeWidth={4} />
              </div>
              <h2 className="text-3xl font-black text-white">{mode === 'CREATE' ? "TERMINÉ !" : "CONFIRMER"}</h2>
              <p className="text-slate-400">
                {mode === 'CREATE' ? "Voici le Pass d'accès pour votre famille." : "Vérifiez vos informations avant de rejoindre."}
              </p>
            </div>

            {mode === 'CREATE' && (
              <div className="mb-8">
                 <FamilyPassCard 
                    communityName={selectedCommunity?.name || "Quartier"} 
                    familyCode={generatedFamilyCode} 
                    familyName={myName.split(' ').pop() || "Mon Foyer"}
                 />
              </div>
            )}

            {mode === 'JOIN' && (
              <div className="bg-white p-6 rounded-3xl border-4 border-slate-200 shadow-xl space-y-4 text-slate-900">
                 <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 text-sm font-bold uppercase">Quartier</span>
                    <span className="font-black">{selectedCommunity?.name || "Inconnu"}</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 text-sm font-bold uppercase">Foyer</span>
                    <div className="text-right">
                       <span className="font-black block">{foundFamilyHead}</span>
                       <span className="text-xs font-mono text-purple-600 font-bold bg-purple-100 px-2 py-0.5 rounded">{joinCode}</span>
                    </div>
                 </div>
                 <div className="flex justify-between pt-2">
                    <span className="text-slate-500 text-sm font-bold uppercase">Vous</span>
                    <span className="font-black text-xl text-blue-600">{myName}</span>
                 </div>
              </div>
            )}

            {error && (
               <div className="p-4 bg-red-600 text-white rounded-xl font-bold text-center shadow-lg border-2 border-red-800 flex items-center justify-center">
                 <AlertTriangle size={20} className="mr-2" />
                 {error}
               </div>
            )}

            <Button 
              fullWidth variant="primary" size="lg" onClick={handleSubmit} disabled={loading}
              className={`mt-4 py-5 text-lg shadow-xl ${mode === 'JOIN' ? 'bg-purple-600 border-purple-900 hover:bg-purple-700' : 'bg-green-600 border-green-900 hover:bg-green-700'}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : (mode === 'CREATE' ? "ENTRER DANS MON FOYER" : "REJOINDRE LA FAMILLE")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
