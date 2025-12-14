import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { SosButton } from '../components/SosButton';
import { MOCK_ALERTS } from '../constants';
import { Alert, User } from '../types';
import { useData } from '../hooks/useData';
import { FeatureService } from '../lib/api';
import { MapPin, Phone, Shield, AlertTriangle, Loader2, X, Send } from 'lucide-react';

interface SecurityProps {
  user: User;
}

export const Security: React.FC<SecurityProps> = ({ user }) => {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { data: alerts, loading, setData: setAlerts } = useData<Alert>('alerts', MOCK_ALERTS, undefined, user.communityId);

  // Report Form State
  const [reportMessage, setReportMessage] = useState('');
  const [reportLocation, setReportLocation] = useState('');
  const [sending, setSending] = useState(false);

  const getExactLocation = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("Position inconnue (GPS non supporté)");
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          // Formatage précis pour les secours
          resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Précision: ${Math.round(accuracy)}m)`);
        },
        (error) => {
          console.error("Erreur GPS:", error);
          resolve("Position inconnue (Erreur GPS)");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  const handleSos = async () => {
    setSosTriggered(true);
    
    // 1. Capture Position (Critique)
    const locationString = await getExactLocation();

    // 2. Création de l'alerte en DB
    try {
        const newAlertPayload: Partial<Alert> = {
            communityId: user.communityId,
            type: 'SOS',
            user: user.name,
            time: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
            location: locationString, // Vraies coordonnées
            message: '🚨 URGENCE VITALE - SOS DÉCLENCHÉ'
        };

        const savedAlert = await FeatureService.createAlert(newAlertPayload);
        // Pas besoin de setAlerts ici si le Realtime du hook useData est actif, 
        // mais on le garde pour l'UX immédiate si latence.
        setAlerts([savedAlert, ...alerts]);

    } catch (e) {
        console.error("Erreur SOS", e);
        // Fallback local en cas de panne réseau critique pour que l'UI ne freeze pas
        alert("Echec envoi serveur. Activez une alarme sonore locale !");
    }
    
    // Reset automatique après 10s (augmenté pour laisser le temps de lire)
    setTimeout(() => setSosTriggered(false), 10000);
  };

  const handleSubmitReport = async () => {
    if(!reportMessage || !reportLocation) return;
    setSending(true);

    try {
        const newReportPayload: Partial<Alert> = {
            communityId: user.communityId,
            type: 'REPORT',
            user: user.name,
            time: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
            location: reportLocation,
            message: reportMessage
        };

        const savedReport = await FeatureService.createAlert(newReportPayload);
        setAlerts([savedReport, ...alerts]);
        
        setShowReportModal(false);
        setReportMessage('');
        setReportLocation('');
    } catch (e) {
        console.error("Erreur Report", e);
        alert("Impossible d'envoyer le rapport. Vérifiez votre connexion.");
    } finally {
        setSending(false);
    }
  };

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      <header className="px-1 shrink-0">
        <h1 className="text-3xl font-black text-red-600 tracking-tight flex items-center">
          <AlertTriangle className="mr-2" strokeWidth={3} /> URGENCE
        </h1>
        <p className="text-slate-600 font-bold">Aide immédiate & Signalements</p>
      </header>

      {/* SOS Section - Takes prominent space */}
      <section className="flex-1 flex flex-col items-center justify-center py-6 min-h-[300px]">
        {sosTriggered ? (
          <div className="text-center animate-pop w-full max-w-xs">
            <div className="w-48 h-48 rounded-full bg-green-500 flex items-center justify-center text-white mb-6 mx-auto shadow-2xl border-8 border-green-200 animate-pulse">
               <span className="text-4xl font-black tracking-tighter">ENVOYÉ</span>
            </div>
            <Card className="bg-red-50 border-red-200 p-4 shadow-xl">
               <h2 className="text-xl font-black text-red-800 uppercase mb-1">Alerte transmise !</h2>
               <p className="text-sm font-bold text-red-700">Géolocalisation GPS envoyée aux :</p>
               <div className="flex justify-center space-x-2 mt-2">
                 <span className="bg-white px-2 py-1 rounded text-xs font-black border border-red-200 text-red-800">VIGILES</span>
                 <span className="bg-white px-2 py-1 rounded text-xs font-black border border-red-200 text-red-800">VOISINS</span>
               </div>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative">
               {/* Pulsing rings decoration */}
               <div className="absolute inset-0 rounded-full bg-red-600 opacity-20 animate-ping"></div>
               <div className="absolute inset-[-20px] rounded-full bg-red-600 opacity-10 animate-pulse"></div>
               <SosButton onTrigger={handleSos} large className="mb-8 z-10 shadow-2xl shadow-red-500/30 border-4 border-white" />
            </div>
            <div className="text-center max-w-[200px]">
               <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">MAINTENIR 3 SECONDES</p>
               <p className="text-sm font-bold text-slate-900 leading-tight">Déclenche l'alerte et partage votre position GPS exacte.</p>
            </div>
          </div>
        )}
      </section>

      {/* Guard on Duty */}
      <Card className="p-4 bg-slate-900 text-white border-2 border-slate-900 shadow-xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
              <Shield size={24} className="text-brand-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-300 uppercase text-xs tracking-wider">En service ce soir</h3>
              <p className="text-lg font-black text-white">Équipe Bravo</p>
            </div>
          </div>
          <Button size="sm" variant="primary" className="bg-brand-600 border-brand-800 hover:bg-brand-500">
            <Phone size={18} className="mr-1"/> APPELER
          </Button>
        </div>
      </Card>

      {/* Recent Alerts List */}
      <section className="pb-4 shrink-0">
        <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3 px-1">DERNIERS SIGNALEMENTS (LIVE)</h2>
        
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="animate-spin text-red-600"/></div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <Card key={alert.id} className={`p-4 flex flex-col bg-white border-y-2 border-r-2 border-slate-300 ${alert.type === 'SOS' ? 'border-l-8 border-l-red-600 bg-red-50' : 'border-l-8 border-l-orange-500'}`}>
                 <div className="flex justify-between items-start mb-1">
                   <span className={`font-black uppercase text-sm ${alert.type === 'SOS' ? 'text-red-700' : 'text-slate-900'}`}>{alert.type === 'SOS' ? 'ALERTE SOS' : 'SIGNALEMENT'}</span>
                   <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded border border-slate-300">{alert.time}</span>
                 </div>
                 <p className="text-sm text-slate-800 font-bold">{alert.message}</p>
                 <div className="flex items-center text-xs font-bold text-orange-700 mt-2">
                   <MapPin size={14} className="mr-1 fill-current" /> {alert.location}
                 </div>
              </Card>
            ))}
            {alerts.length === 0 && (
                <div className="text-center p-4 text-slate-400 font-bold border-2 border-dashed border-slate-300 rounded-xl">
                    Aucune alerte récente.
                </div>
            )}
          </div>
        )}
        
        <div className="mt-4">
            <Button onClick={() => setShowReportModal(true)} variant="outline" fullWidth className="border-dashed border-2 border-slate-400 text-slate-800 font-bold hover:bg-slate-100">
              + Faire un rapport écrit
            </Button>
        </div>
      </section>

      {/* REPORT MODAL */}
      {showReportModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-pop">
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl border-4 border-slate-200">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-slate-900">Signaler un Incident</h3>
                 <button onClick={() => setShowReportModal(false)} className="p-1 bg-slate-100 rounded-full"><X size={20}/></button>
              </div>

              <div className="space-y-4">
                <div>
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Description</label>
                   <textarea 
                      className="w-full font-medium bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:bg-white outline-none h-24 resize-none"
                      placeholder="Que se passe-t-il ?"
                      value={reportMessage}
                      onChange={(e) => setReportMessage(e.target.value)}
                   />
                </div>

                <div>
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Lieu précis</label>
                   <div className="flex relative">
                      <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        className="w-full font-bold bg-slate-50 border-2 border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:border-orange-500 focus:bg-white outline-none"
                        placeholder="Ex: Rue 12, Carrefour..."
                        value={reportLocation}
                        onChange={(e) => setReportLocation(e.target.value)}
                      />
                   </div>
                </div>

                <div className="pt-2">
                   <Button onClick={handleSubmitReport} fullWidth variant="primary" className="bg-orange-500 border-orange-700 hover:bg-orange-600" disabled={!reportMessage || !reportLocation} loading={sending}>
                     <Send size={18} className="mr-2" /> ENVOYER LE RAPPORT
                   </Button>
                </div>
              </div>
           </div>
         </div>
      )}
    </div>
  );
};