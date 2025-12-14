
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Finances } from './views/Finances';
import { Community } from './views/Community';
import { Services } from './views/Services';
import { Security } from './views/Security';
import { AdminPanel } from './views/AdminPanel';
import { GodModePanel } from './views/GodModePanel'; 
import { User } from './types';
import { supabase } from './lib/supabase';
import { AuthService } from './lib/api';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        // On tente de récupérer la session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn("Session check warn:", error.message);
        }

        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        // Si Supabase plante complètement (ex: URL invalide), on attrape l'erreur
        // pour ne pas bloquer l'UI sur un écran blanc.
        console.error("Erreur critique initialisation session:", err);
      } finally {
        if (mounted) {
          setIsSessionLoading(false);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setCurrentView('dashboard');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const user = await AuthService.getUserProfile(userId);
      setCurrentUser(user);
    } catch (err) {
      console.error("Error fetching profile:", err);
      await AuthService.logout();
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard'); 
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  if (isSessionLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white flex-col">
        <Loader2 className="animate-spin w-10 h-10 text-brand-500 mb-4" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chargement...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentUser.role === 'GOD') {
    return <GodModePanel currentUser={currentUser} onLogout={handleLogout} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={currentUser} onNavigate={setCurrentView} />;
      case 'finances':
        return <Finances currentUser={currentUser} />;
      case 'community': 
        return <Community currentUser={currentUser} initialTab="MEMBERS" />;
      case 'governance': 
        return <Community currentUser={currentUser} initialTab="VOTE" />;
      case 'chat': 
        return <Community currentUser={currentUser} initialTab="CHAT" />;
      case 'services':
        return <Services user={currentUser} />;
      case 'security':
        return <Security user={currentUser} />;
      case 'admin':
        return currentUser.role === 'ADMIN' ? <AdminPanel currentUser={currentUser} /> : null;
      default:
        return <Dashboard user={currentUser} onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout 
      activeView={['community', 'governance', 'chat'].includes(currentView) ? 'community' : currentView} 
      onNavigate={setCurrentView} 
      user={currentUser}
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
