
import React, { useState } from 'react';
import { User } from '../types';
import { Button, Card } from '../components/ui';
import { Mail, Lock, UserPlus, Users, AlertTriangle, CheckCircle, ShieldOff } from 'lucide-react';
import { RegisterWizard } from './RegisterWizard';
import { AuthService } from '../lib/api'; // Service Layer

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [wizardMode, setWizardMode] = useState<'CREATE' | 'JOIN' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot Password State
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // SÉCURITÉ : Validation stricte avant soumission
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Format d'email invalide.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      // APPEL SERVICE : Toute la logique est déléguée
      const user = await AuthService.login(email, password);
      
      if (user.status === 'BANNED') {
        setError("Ce compte a été suspendu. Contactez votre administration.");
        await AuthService.logout();
      } else {
        onLogin(user);
      }
    } catch (err: any) {
      console.error("Login process failed:", err);
      setError(err.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = () => {
    // Utilisateur de test par défaut (Jean Kouassi) pour le bypass
    const bypassUser: User = {
      id: '1',
      email: 'jean@fleurs.ci',
      communityId: 'c_fleurs',
      name: 'Jean Kouassi',
      phone: '+225 07070707',
      role: 'RESIDENT',
      balanceStatus: 'OK',
      familyId: 'Famille Kouassi',
      isHeadOfFamily: true,
      birthDate: '1985-05-12',
      status: 'VALIDATED'
    };
    onLogin(bypassUser);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !isValidEmail(email)) {
      setError("Entrez une adresse email valide.");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await AuthService.resetPassword(email);
      setResetSent(true);
    } catch (err: any) {
      console.error(err);
      setError("Impossible d'envoyer l'email de réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationComplete = (newUser: User) => {
    setWizardMode(null);
    onLogin(newUser);
  };

  if (wizardMode) {
    return <RegisterWizard mode={wizardMode} onBack={() => setWizardMode(null)} onComplete={handleRegistrationComplete} />;
  }

  if (isResetting) {
    return (
      <div className="min-h-[100dvh] w-full bg-slate-900 flex items-center justify-center p-6">
         <Card className="w-full max-w-sm bg-white p-6 rounded-3xl animate-pop border-4 border-slate-200">
            {resetSent ? (
              <div className="text-center py-6">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 border-4 border-green-500">
                    <CheckCircle size={40} />
                 </div>
                 <h2 className="text-xl font-black text-slate-900 mb-2">Email envoyé !</h2>
                 <p className="text-slate-500 font-medium mb-6">Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.</p>
                 <Button fullWidth onClick={() => { setIsResetting(false); setResetSent(false); }} variant="primary">
                   Retour à la connexion
                 </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                 <div className="text-center mb-6">
                    <h2 className="text-xl font-black text-slate-900">Mot de passe oublié ?</h2>
                    <p className="text-slate-500 text-sm font-medium">Entrez votre email pour recevoir un lien.</p>
                 </div>
                 
                 <div>
                   <label htmlFor="reset-email" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Email</label>
                   <input 
                     id="reset-email"
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none focus:border-blue-600"
                     placeholder="votre@email.com"
                     autoFocus
                   />
                 </div>

                 {error && (
                   <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                 )}

                 <Button fullWidth type="submit" variant="primary" loading={loading} disabled={!email}>
                   Envoyer le lien
                 </Button>
                 
                 <Button fullWidth variant="ghost" onClick={() => setIsResetting(false)}>
                   Annuler
                 </Button>
              </form>
            )}
         </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-slate-900 flex flex-col relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-blue-900 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-purple-900 rounded-full opacity-20 blur-3xl"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 overflow-y-auto">
        
        <div className="mb-8 text-center animate-pop">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-blue-600 font-black text-6xl mb-6 mx-auto border-4 border-blue-600 shadow-2xl transform rotate-3">
            Q
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 drop-shadow-md">MON QUARTIER</h1>
          <p className="text-slate-300 font-bold text-lg uppercase tracking-widest bg-slate-800/50 inline-block px-4 py-1 rounded-full border border-slate-700">Portail Citoyen</p>
        </div>

        <div className="w-full max-w-sm space-y-6 animate-pop">
           <Card className="bg-white border-4 border-slate-200 p-6 shadow-2xl">
             <form onSubmit={handleLogin} className="space-y-5">
               <div>
                 <label htmlFor="email" className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Email</label>
                 <div className="relative">
                   <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-slate-100 border-r-2 border-slate-200 rounded-l-xl text-slate-500">
                      <Mail size={20} />
                   </div>
                   <input 
                     id="email"
                     type="email" 
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-white border-2 border-slate-300 rounded-xl py-3.5 pl-14 pr-4 text-slate-900 font-bold placeholder-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                     placeholder="votre@email.com"
                     autoComplete="username"
                   />
                 </div>
               </div>

               <div>
                 <label htmlFor="password" className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Mot de passe</label>
                 <div className="relative">
                   <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-slate-100 border-r-2 border-slate-200 rounded-l-xl text-slate-500">
                      <Lock size={20} />
                   </div>
                   <input 
                     id="password"
                     type="password" 
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-white border-2 border-slate-300 rounded-xl py-3.5 pl-14 pr-4 text-slate-900 font-bold placeholder-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                     placeholder="••••••••"
                     autoComplete="current-password"
                   />
                 </div>
                 <div className="text-right mt-2">
                    <button type="button" onClick={() => setIsResetting(true)} className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
                       Mot de passe oublié ?
                    </button>
                 </div>
               </div>

               {error && (
                 <div className="p-4 bg-red-100 border-l-4 border-red-600 rounded-r-xl flex items-start animate-pop">
                   <AlertTriangle className="text-red-600 shrink-0 mr-3" size={20} />
                   <p className="text-red-900 text-xs font-bold leading-tight">{error}</p>
                 </div>
               )}

               <Button 
                 fullWidth 
                 variant="primary" 
                 size="lg" 
                 className="shadow-xl text-lg h-14" 
                 type="submit"
                 loading={loading}
               >
                 SE CONNECTER
               </Button>
               
               <div className="mt-4 pt-4 border-t border-slate-200">
                  <Button 
                      fullWidth 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => { e.preventDefault(); handleBypass(); }}
                      className="border-dashed border-2 border-slate-400 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  >
                      <ShieldOff size={16} className="mr-2" /> MODE DÉMO (BYPASS)
                  </Button>
               </div>
             </form>
           </Card>

           <div className="pt-2 grid grid-cols-2 gap-4">
             <button 
               onClick={() => setWizardMode('CREATE')}
               className="flex flex-col items-center justify-center p-5 bg-blue-600 border-b-4 border-blue-800 rounded-2xl hover:bg-blue-500 transition-all active:border-b-0 active:translate-y-1 group shadow-lg"
             >
               <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                 <UserPlus size={24} strokeWidth={3} />
               </div>
               <span className="text-white font-black text-sm uppercase">Créer Foyer</span>
               <span className="text-[10px] text-blue-200 font-bold mt-1">Je suis Chef</span>
             </button>

             <button 
               onClick={() => setWizardMode('JOIN')}
               className="flex flex-col items-center justify-center p-5 bg-white border-b-4 border-slate-300 rounded-2xl hover:bg-slate-50 transition-all active:border-b-0 active:translate-y-1 group shadow-lg"
             >
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-3 group-hover:scale-110 transition-transform">
                 <Users size={24} strokeWidth={3} />
               </div>
               <span className="text-slate-900 font-black text-sm uppercase">Rejoindre</span>
               <span className="text-[10px] text-slate-500 font-bold mt-1">J'ai un Code</span>
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
