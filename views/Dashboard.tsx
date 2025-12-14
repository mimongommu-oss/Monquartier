import React, { useState } from 'react';
import { User, Proposal, Job, Alert, Article } from '../types';
import { UserHeader, ActivityFeed, FlashInfoTrigger, FeedItem } from '../components/DashboardWidgets';
import { FlashInfoViewer } from '../components/FlashInfoViewer';
import { Button, Badge } from '../components/ui';
import { HardHat, AlertTriangle, CheckCircle, Vote, ArrowRight, Wallet, Shield, ServerCrash } from 'lucide-react';
import { useData } from '../hooks/useData';
import { MOCK_PROPOSALS, MOCK_JOBS, MOCK_ALERTS, MOCK_ARTICLES } from '../constants';

interface DashboardProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [showFlashInfo, setShowFlashInfo] = useState(false);

  // --- DATA FETCHING (LIVE) ---
  const { data: proposals, error: errorProp } = useData<Proposal>('proposals', MOCK_PROPOSALS, undefined, user.communityId);
  const { data: jobs, error: errorJob } = useData<Job>('jobs', MOCK_JOBS, undefined, user.communityId);
  const { data: alerts, error: errorAlert } = useData<Alert>('alerts', MOCK_ALERTS, undefined, user.communityId);
  const { data: articles, error: errorArt } = useData<Article>('articles', MOCK_ARTICLES, 'date', user.communityId);

  // Agrégation des erreurs
  const hasError = errorProp || errorJob || errorAlert || errorArt;

  // --- SMART HERO LOGIC ---
  const isLate = user.balanceStatus === 'LATE';
  const hasOpenVote = proposals.some(p => p.status === 'OPEN');
  const hasOpenJob = jobs.some(j => j.status === 'OPEN');
  const latestArticle = articles[0];

  // --- FEED GENERATION ---
  const generateFeed = (): FeedItem[] => {
    const items: FeedItem[] = [];

    // 1. Alertes (Priorité Haute)
    alerts.slice(0, 2).forEach(a => {
        items.push({
            id: `alert-${a.id}`,
            type: 'ALERT',
            title: a.type === 'SOS' ? 'ALERTE SOS' : 'Signalement',
            subtitle: a.message || 'Incident signalé',
            timeLabel: a.time,
            color: 'red',
            icon: a.type === 'SOS' ? AlertTriangle : Shield
        });
    });

    // 2. Votes (Priorité Moyenne)
    proposals.filter(p => p.status === 'OPEN').slice(0, 2).forEach(p => {
        items.push({
            id: `prop-${p.id}`,
            type: 'VOTE',
            title: 'Vote en cours',
            subtitle: p.title,
            timeLabel: 'Urgent',
            color: 'blue',
            icon: Vote
        });
    });

    // 3. Jobs (Opportunités)
    jobs.filter(j => j.status === 'OPEN').slice(0, 2).forEach(j => {
        items.push({
            id: `job-${j.id}`,
            type: 'JOB',
            title: 'Mission dispo',
            subtitle: j.title,
            timeLabel: j.pay + ' F',
            color: 'orange',
            icon: HardHat
        });
    });

    // Mélanger un peu pour l'aspect "Fil" (simulé ici par simple concaténation priorisée)
    return items.slice(0, 5); 
  };

  const feedItems = generateFeed();

  const renderSmartAction = () => {
    // PRIORITÉ 1 : ARGENT
    if (isLate) {
      return (
        <div className="animate-pop">
          <div className="bg-red-600 rounded-3xl p-6 text-white shadow-xl border-4 border-red-800 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-20 rotate-12"><AlertTriangle size={150} /></div>
            <div className="relative z-10">
              <div className="flex items-center mb-2"><Badge color="red">ACTION REQUISE</Badge></div>
              <h2 className="text-2xl font-black uppercase leading-none mb-2">Cotisation en retard</h2>
              <p className="font-bold text-red-50 mb-6 text-sm leading-relaxed">Votre participation est essentielle au quartier.</p>
              <Button onClick={() => onNavigate('finances')} variant="gold" fullWidth size="lg" className="shadow-lg border-b-4 border-yellow-700 text-yellow-900">
                <Wallet className="mr-2" /> RÉGLER MAINTENANT
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // PRIORITÉ 2 : VOTE
    if (hasOpenVote) {
      return (
        <div className="animate-pop">
          <div className="bg-brand-600 rounded-3xl p-6 text-white shadow-xl border-4 border-brand-800 relative overflow-hidden">
            <div className="absolute right-[-10px] top-[-10px] opacity-20 rotate-12"><Vote size={150} /></div>
            <div className="relative z-10">
              <div className="flex items-center mb-2"><span className="bg-white text-brand-800 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">La communauté vous consulte</span></div>
              <h2 className="text-2xl font-black uppercase leading-none mb-2">Vote en cours</h2>
              <p className="font-bold text-brand-50 mb-6 text-sm leading-relaxed">Une décision importante nécessite votre avis.</p>
              <Button onClick={() => onNavigate('governance')} variant="secondary" fullWidth size="lg" className="text-brand-800 border-none shadow-lg">
                DONNER MON AVIS <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // PRIORITÉ 3 : TRAVAIL (Worker Only)
    if (user.role === 'WORKER' && hasOpenJob) {
      return (
        <div className="animate-pop">
          <div className="bg-orange-500 rounded-3xl p-6 text-white shadow-xl border-4 border-orange-700 relative overflow-hidden">
             <div className="absolute right-[-20px] top-[-30px] opacity-20 rotate-12"><HardHat size={160} /></div>
            <div className="relative z-10">
              <Badge color="yellow">OPPORTUNITÉ</Badge>
              <h2 className="text-2xl font-black uppercase leading-none mt-2 mb-2">Mission Disponible</h2>
              <p className="font-bold text-orange-50 mb-6 text-sm leading-relaxed">Gagnez de l'argent ce week-end.</p>
              <Button onClick={() => onNavigate('services')} variant="secondary" fullWidth size="lg" className="text-orange-800 border-none shadow-lg">VOIR L'OFFRE</Button>
            </div>
          </div>
        </div>
      );
    }

    // PRIORITÉ 0 : REPOS
    return (
      <div className="animate-pop">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl border-4 border-green-700 relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] opacity-20"><CheckCircle size={150} /></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black uppercase leading-none mb-2">Tout est parfait !</h2>
            <p className="font-bold text-green-50 mb-4 text-sm leading-relaxed">Vous êtes à jour. Profitez de votre journée, voisin.</p>
            <div className="flex space-x-2">
               <Button onClick={() => onNavigate('finances')} variant="secondary" size="sm" className="bg-green-700 text-white border-green-800 text-xs hover:bg-green-600">Mon Solde</Button>
               <Button onClick={() => onNavigate('security')} variant="secondary" size="sm" className="bg-green-700 text-white border-green-800 text-xs hover:bg-green-600">Signaler un souci</Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <UserHeader user={user} />

        {/* ERROR BANNER IF API FAILS */}
        {hasError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm flex items-start animate-pop">
             <ServerCrash className="mr-3 mt-0.5 shrink-0" size={20} />
             <div>
               <p className="font-black text-sm uppercase">Erreur de synchronisation</p>
               <p className="text-xs mt-1">Impossible de récupérer certaines données récentes. Vérifiez votre connexion.</p>
             </div>
          </div>
        )}

        <section>
           <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3 px-1">Priorité</h2>
           {renderSmartAction()}
        </section>

        <FlashInfoTrigger onOpen={() => setShowFlashInfo(true)} latestArticle={latestArticle} />

        <ActivityFeed items={feedItems} />
      </div>

      <FlashInfoViewer isOpen={showFlashInfo} onClose={() => setShowFlashInfo(false)} communityId={user.communityId} />
    </>
  );
};