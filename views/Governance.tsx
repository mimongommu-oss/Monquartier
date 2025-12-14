import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { MOCK_PROPOSALS } from '../constants';
import { Proposal } from '../types';
import { useData } from '../hooks/useData';
import { MessageSquare, ThumbsUp, ThumbsDown, MinusCircle, Loader2, Vote, Archive, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

export const Governance: React.FC = () => {
  const { data: proposals, loading } = useData<Proposal>('proposals', MOCK_PROPOSALS);
  const [activeTab, setActiveTab] = useState<'VOTE' | 'ARCHIVE'>('VOTE');

  const activeProposals = proposals.filter(p => p.status === 'OPEN');
  const closedProposals = proposals.filter(p => p.status === 'CLOSED');

  const renderChart = (proposal: Proposal) => {
    const data = [
      { name: 'Pour', value: proposal.votesFor },
      { name: 'Contre', value: proposal.votesAgainst },
      { name: 'Abstention', value: proposal.votesAbstain },
    ];
    const COLORS = ['#16a34a', '#dc2626', '#94a3b8'];

    return (
      <div className="h-48 w-full bg-slate-100 rounded-2xl border-2 border-slate-200">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#334155' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Le Parlement</h1>
        <p className="text-slate-600 font-bold">Ta voix compte !</p>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-300 rounded-xl">
        <button 
          onClick={() => setActiveTab('VOTE')}
          className={`flex-1 py-2 text-sm font-black rounded-lg transition-all flex items-center justify-center ${activeTab === 'VOTE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
        >
          <Vote size={16} className="mr-2"/> À VOTER
        </button>
        <button 
          onClick={() => setActiveTab('ARCHIVE')}
          className={`flex-1 py-2 text-sm font-black rounded-lg transition-all flex items-center justify-center ${activeTab === 'ARCHIVE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
        >
          <Archive size={16} className="mr-2"/> ARCHIVES
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand-600"/></div>
      ) : (
        <div className="space-y-6 animate-pop">
          {activeTab === 'VOTE' && (
            <>
               {activeProposals.length > 0 ? (
                 activeProposals.map(proposal => (
                   <Card key={proposal.id} className="p-5 border-l-8 border-l-brand-500">
                     <div className="flex justify-between items-start mb-3">
                       <h3 className="text-xl font-black text-slate-900 leading-tight pr-4">{proposal.title}</h3>
                     </div>
                     <Badge color="green">Vote ouvert</Badge>
                     
                     <p className="text-slate-800 text-sm font-medium leading-relaxed my-4 bg-slate-100 p-4 rounded-xl border border-slate-200">
                       {proposal.description}
                     </p>
                     
                     <div className="space-y-3">
                       <div className="grid grid-cols-2 gap-3">
                         <Button variant="secondary" className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100 flex-col py-4 h-auto">
                           <ThumbsUp size={24} className="mb-1" strokeWidth={3} />
                           POUR
                         </Button>
                         <Button variant="secondary" className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100 flex-col py-4 h-auto">
                           <ThumbsDown size={24} className="mb-1" strokeWidth={3} />
                           CONTRE
                         </Button>
                       </div>
                       <Button fullWidth variant="ghost" size="sm" className="text-slate-500 border border-slate-300 bg-white">
                          <MinusCircle size={16} className="mr-2"/> Je m'abstiens
                       </Button>
                     </div>

                     <div className="mt-6 pt-4 border-t-2 border-slate-100 flex justify-between items-center">
                        <button className="flex items-center text-sm text-brand-700 font-bold bg-brand-50 px-3 py-2 rounded-xl transition-colors hover:bg-brand-100 border border-brand-200">
                          <MessageSquare size={18} className="mr-2" />
                          Débat
                        </button>
                     </div>
                   </Card>
                 ))
               ) : (
                 <div className="text-center py-10 px-6 bg-white rounded-3xl border-2 border-slate-300 border-dashed">
                   <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CheckCircle size={32} strokeWidth={3} />
                   </div>
                   <h3 className="text-lg font-black text-slate-900">Devoir accompli !</h3>
                   <p className="text-slate-500 font-medium">Vous avez voté sur toutes les propositions en cours.</p>
                 </div>
               )}
            </>
          )}

          {activeTab === 'ARCHIVE' && (
             <>
               {closedProposals.map(proposal => (
                 <Card key={proposal.id} className="p-5 bg-slate-50">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-black text-slate-700 leading-tight pr-4">{proposal.title}</h3>
                      <Badge color="gray">Terminé</Badge>
                    </div>
                    {renderChart(proposal)}
                 </Card>
               ))}
               {closedProposals.length === 0 && (
                 <div className="text-center text-slate-500 font-bold">Aucune archive disponible.</div>
               )}
             </>
          )}
        </div>
      )}
    </div>
  );
};