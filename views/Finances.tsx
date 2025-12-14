
import React, { useState, useMemo } from 'react';
import { Card, ProgressBar, Button, Badge } from '../components/ui';
import { MOCK_CAMPAIGNS, MOCK_TRANSACTIONS, GLOBAL_BALANCE } from '../constants';
import { Campaign, Transaction, User } from '../types';
import { useData } from '../hooks/useData';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Lock, Coins, Loader2, CheckCircle, Plus, X, Upload } from 'lucide-react';
import { FeatureService } from '../lib/api';

interface FinancesProps {
  currentUser?: User; // Pass user to check roles
}

export const Finances: React.FC<FinancesProps> = ({ currentUser }) => {
  const { data: campaigns, loading: loadingCamp } = useData<Campaign>('campaigns', MOCK_CAMPAIGNS, undefined, currentUser?.communityId);
  // On charge les transactions triées par date (récentes en premier)
  const { data: transactions, loading: loadingTrans, setData: setTransactions } = useData<Transaction>('transactions', MOCK_TRANSACTIONS, 'date', currentUser?.communityId);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  
  // Admin Transaction State
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTrans, setNewTrans] = useState<{label: string; amount: string; type: 'INCOME' | 'EXPENSE'}>({
    label: '', amount: '', type: 'EXPENSE'
  });

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'GOD';

  // Filter campaigns logic
  const activeCampaigns = campaigns.filter(c => c.collectedAmount < c.targetAmount);
  const historyCampaigns = campaigns.filter(c => c.collectedAmount >= c.targetAmount);

  // Calcul Dynamique du Solde
  const displayBalance = useMemo(() => {
    // Calcul basé sur les transactions chargées
    const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0);
    const calculatedDelta = income - expense;

    // Pour la démo, on ajoute ce delta au solde initial "historique" (GLOBAL_BALANCE)
    // Dans une app 100% réelle, le solde viendrait d'une requête agrégée SQL ou d'une table 'balances'.
    return GLOBAL_BALANCE + calculatedDelta;
  }, [transactions]);

  const data = [
    { name: 'Disponible', value: Math.max(0, displayBalance) },
    { name: 'Dépensé', value: Math.max(100000, displayBalance * 0.2) }, // Placeholder visuel
  ];
  const COLORS = ['#3b82f6', '#cbd5e1'];

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumSignificantDigits: 3 }).format(amount).replace('XOF', 'F');
  };

  const handleAddTransaction = async () => {
    if(!newTrans.label || !newTrans.amount) return;
    setCreating(true);
    
    try {
      const amount = parseInt(newTrans.amount);
      const transactionPayload: Partial<Transaction> = {
        communityId: currentUser?.communityId || 'demo',
        date: new Date().toISOString(),
        label: newTrans.label,
        amount: amount,
        type: newTrans.type,
        proofUrl: 'pending' // Dans le futur : Upload de fichier
      };

      // 1. Sauvegarde DB
      const savedTransaction = await FeatureService.createTransaction(transactionPayload);

      // 2. Mise à jour Optimiste de l'UI
      setTransactions([savedTransaction, ...transactions]);
      
      setShowAddTransaction(false);
      setNewTrans({ label: '', amount: '', type: 'EXPENSE' });
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'enregistrement de la transaction.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="px-1 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trésorerie</h1>
          <p className="text-slate-600 font-bold">Le coffre-fort du quartier</p>
        </div>
        {isAdmin && (
           <Button onClick={() => setShowAddTransaction(true)} size="sm" variant="primary" className="shadow-lg h-10 px-4">
              <Plus size={18} className="mr-2" /> AJOUTER
           </Button>
        )}
      </header>

      {/* Global Balance Card - Always visible */}
      <Card className="p-6 bg-slate-900 text-white border-2 border-slate-900 shadow-xl relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] text-slate-800 opacity-30">
          <Coins size={140} />
        </div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Solde Disponible</p>
            <p className="text-4xl font-black tracking-tight text-white drop-shadow-md">{formatMoney(displayBalance)}</p>
            <div className="mt-4 flex space-x-2">
               <Badge color="green">Mis à jour</Badge>
            </div>
          </div>
          <div className="h-20 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value" stroke="none">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex p-1 bg-slate-300 rounded-xl">
        <button 
          onClick={() => setActiveTab('ACTIVE')}
          className={`flex-1 py-2 text-sm font-black rounded-lg transition-all ${activeTab === 'ACTIVE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          À COTISER ({activeCampaigns.length})
        </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-2 text-sm font-black rounded-lg transition-all ${activeTab === 'HISTORY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          LIVRE DE COMPTE
        </button>
      </div>

      {activeTab === 'ACTIVE' && (
        <section className="animate-pop space-y-4">
          {loadingCamp ? (
             <div className="flex justify-center p-4"><Loader2 className="animate-spin text-brand-600"/></div>
          ) : activeCampaigns.length > 0 ? (
            activeCampaigns.map(campaign => (
              <Card key={campaign.id} className="p-5 border-l-8 border-l-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-lg text-slate-900 leading-tight">{campaign.title}</h3>
                  <Badge color="blue">En cours</Badge>
                </div>
                <p className="text-sm text-slate-800 font-medium mb-4 line-clamp-2 leading-relaxed">{campaign.description}</p>
                <div className="mb-2">
                  <ProgressBar value={campaign.collectedAmount} max={campaign.targetAmount} />
                </div>
                <div className="flex justify-between text-xs font-black text-slate-600 uppercase tracking-wider mt-2 mb-4">
                  <span>{formatMoney(campaign.collectedAmount)}</span>
                  <span>Obj: {formatMoney(campaign.targetAmount)}</span>
                </div>
                <Button variant="gold" fullWidth className="text-yellow-950 font-black">Contribuer</Button>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 px-6 bg-white rounded-3xl border-2 border-slate-300 border-dashed">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} strokeWidth={3} />
              </div>
              <h3 className="text-lg font-black text-slate-900">Tout est réglé !</h3>
              <p className="text-slate-600 font-medium">Aucune collecte active pour le moment. Votre quartier se porte bien.</p>
            </div>
          )}
        </section>
      )}

      {activeTab === 'HISTORY' && (
        <section className="animate-pop space-y-6">
          
          {/* Completed Campaigns */}
          {historyCampaigns.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3 px-1">Cagnottes Terminées</h3>
              <div className="space-y-4">
                {historyCampaigns.map(campaign => (
                  <Card key={campaign.id} className="p-4 bg-white border-2 border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-slate-800">{campaign.title}</h3>
                      <Badge color="green">Succès</Badge>
                    </div>
                    <div className="flex items-center text-xs font-bold text-green-700">
                      <CheckCircle size={14} className="mr-1"/> {formatMoney(campaign.collectedAmount)} collectés
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Audit Log */}
          <div>
            <div className="flex items-center mb-3 px-1 justify-between">
              <div className="flex items-center">
                <Lock size={16} className="text-slate-600 mr-2" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Journal des comptes</h3>
              </div>
            </div>
            <Card className="overflow-hidden border-2 border-slate-300">
              {loadingTrans ? (
                 <div className="flex justify-center p-4"><Loader2 className="animate-spin text-brand-600"/></div>
              ) : (
                <>
                  <div className="divide-y divide-slate-200">
                    {transactions.map(t => (
                      <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl border ${t.type === 'EXPENSE' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                            {t.type === 'EXPENSE' ? <ArrowDownLeft size={20} strokeWidth={3} /> : <ArrowUpRight size={20} strokeWidth={3} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{t.label}</p>
                            <p className="text-xs text-slate-500 font-bold">{new Date(t.date).toLocaleDateString('fr-FR', {day:'2-digit', month:'short'})}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-black ${t.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}`}>
                            {t.type === 'EXPENSE' ? '-' : '+'}{formatMoney(t.amount)}
                          </span>
                          {t.proofUrl && <div className="text-[10px] text-blue-700 font-black uppercase mt-1">Signé</div>}
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                        <div className="p-8 text-center text-slate-400 font-bold">Aucune transaction enregistrée.</div>
                    )}
                  </div>
                  <div className="p-3 bg-slate-100 text-center border-t border-slate-200">
                    <button className="text-xs text-slate-700 font-black uppercase tracking-widest hover:text-brand-800">Voir tout l'historique</button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </section>
      )}

      {/* ADD TRANSACTION MODAL (ADMIN ONLY) */}
      {showAddTransaction && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/80 backdrop-blur-sm animate-pop">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative border-4 border-slate-200 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">Nouvelle Opération</h3>
                <button onClick={() => setShowAddTransaction(false)} className="p-1 bg-slate-100 rounded-full"><X size={20}/></button>
              </div>

              <div className="space-y-4">
                 <div className="flex p-1 bg-slate-100 rounded-xl">
                   <button 
                     onClick={() => setNewTrans({...newTrans, type: 'INCOME'})}
                     className={`flex-1 py-3 text-xs font-black rounded-lg transition-all ${newTrans.type === 'INCOME' ? 'bg-green-500 text-white shadow-md' : 'text-slate-500'}`}
                   >
                     ENTRÉE (+)
                   </button>
                   <button 
                     onClick={() => setNewTrans({...newTrans, type: 'EXPENSE'})}
                     className={`flex-1 py-3 text-xs font-black rounded-lg transition-all ${newTrans.type === 'EXPENSE' ? 'bg-red-500 text-white shadow-md' : 'text-slate-500'}`}
                   >
                     DÉPENSE (-)
                   </button>
                 </div>

                 <div>
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Motif</label>
                   <input 
                     type="text"
                     className="w-full font-bold bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:bg-white outline-none"
                     placeholder="Ex: Achat ciment..."
                     value={newTrans.label}
                     onChange={e => setNewTrans({...newTrans, label: e.target.value})}
                   />
                 </div>

                 <div>
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Montant (FCFA)</label>
                   <input 
                     type="number"
                     className="w-full font-bold bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:bg-white outline-none"
                     placeholder="0"
                     value={newTrans.amount}
                     onChange={e => setNewTrans({...newTrans, amount: e.target.value})}
                   />
                 </div>

                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                    <Upload size={24} className="mb-2" />
                    <span className="text-xs font-bold uppercase">Ajouter Preuve / Facture</span>
                 </div>
                 
                 <div className="text-[10px] text-slate-400 font-bold text-center">
                    Signé numériquement par {currentUser?.name}
                 </div>

                 <Button fullWidth variant={newTrans.type === 'INCOME' ? 'primary' : 'danger'} onClick={handleAddTransaction} loading={creating}>
                   VALIDER ET SIGNER
                 </Button>
              </div>
           </div>
         </div>
      )}
    </div>
  );
};
