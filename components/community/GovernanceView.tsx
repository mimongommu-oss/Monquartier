
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../ui';
import { Proposal } from '../../types';
import { useData } from '../../hooks/useData';
import { MOCK_PROPOSALS } from '../../constants';
import { FeatureService } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { ThumbsUp, ThumbsDown, MinusCircle, Loader2, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

export const GovernanceView: React.FC = () => {
  const { data: initialProposals, loading: loadingVotes } = useData<Proposal>('proposals', MOCK_PROPOSALS);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Sync initial data
  useEffect(() => {
    if (initialProposals.length > 0) {
      setProposals(initialProposals);
    }
  }, [initialProposals]);

  // Load User Votes
  useEffect(() => {
    const loadMyVotes = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
            const votes = await FeatureService.getUserVotes(user.id);
            setUserVotes(votes);
        }
    };
    loadMyVotes();
  }, []);

  const activeProposals = proposals.filter(p => p.status === 'OPEN');
  const closedProposals = proposals.filter(p => p.status === 'CLOSED');

  const handleVote = async (id: string, type: 'FOR' | 'AGAINST' | 'ABSTAIN') => {
    setLoadingAction(id);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;

        // API Call
        await FeatureService.voteProposal(id, user.id, type);

        // 1. Mark as voted locally
        setUserVotes(prev => ({ ...prev, [id]: type }));

        // 2. Update stats optimistically
        setProposals(prev => prev.map(p => {
          if (p.id === id) {
            return {
              ...p,
              votesFor: type === 'FOR' ? p.votesFor + 1 : p.votesFor,
              votesAgainst: type === 'AGAINST' ? p.votesAgainst + 1 : p.votesAgainst,
              votesAbstain: type === 'ABSTAIN' ? p.votesAbstain + 1 : p.votesAbstain,
            };
          }
          return p;
        }));
    } catch (e: any) {
        console.error(e);
        alert(e.message || "Erreur lors du vote");
    } finally {
        setLoadingAction(null);
    }
  };

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
            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#334155' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="overflow-y-auto pb-24 animate-pop space-y-6 px-1">
      {loadingVotes ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand-600"/></div>
      ) : (
        <>
          {activeProposals.length > 0 ? (
            activeProposals.map(proposal => {
              const hasVoted = !!userVotes[proposal.id];
              const isProcessing = loadingAction === proposal.id;

              return (
                <Card key={proposal.id} className={`p-5 mb-4 transition-all ${hasVoted ? 'bg-slate-50 border-slate-300' : 'border-l-8 border-l-brand-500'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-black text-slate-900 leading-tight pr-4">{proposal.title}</h3>
                  </div>
                  <Badge color={hasVoted ? 'gray' : 'green'}>{hasVoted ? 'A voté' : 'Vote ouvert'}</Badge>
                  
                  <p className="text-slate-800 text-sm font-medium leading-relaxed my-4 bg-slate-100 p-4 rounded-xl border border-slate-200">{proposal.description}</p>
                  
                  {!hasVoted ? (
                    isProcessing ? (
                        <div className="py-6 flex justify-center"><Loader2 className="animate-spin text-brand-500" /></div>
                    ) : (
                        <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={() => handleVote(proposal.id, 'FOR')} variant="secondary" className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100 flex-col py-4 h-auto">
                            <ThumbsUp size={24} className="mb-1" strokeWidth={3} /> POUR
                            </Button>
                            <Button onClick={() => handleVote(proposal.id, 'AGAINST')} variant="secondary" className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100 flex-col py-4 h-auto">
                            <ThumbsDown size={24} className="mb-1" strokeWidth={3} /> CONTRE
                            </Button>
                        </div>
                        <Button onClick={() => handleVote(proposal.id, 'ABSTAIN')} fullWidth variant="ghost" size="sm" className="text-slate-500 border border-slate-300 bg-white">
                            <MinusCircle size={16} className="mr-2"/> Je m'abstiens
                        </Button>
                        </div>
                    )
                  ) : (
                    <div className="mt-4">
                      <p className="text-center text-xs font-black uppercase text-slate-500 mb-2">Résultats temporaires</p>
                      {renderChart(proposal)}
                      <div className="text-center mt-2">
                        <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded">Votre vote : {userVotes[proposal.id]}</span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="text-center py-10 px-6 bg-white rounded-3xl border-2 border-slate-300 border-dashed">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} strokeWidth={3} /></div>
              <h3 className="text-lg font-black text-slate-900">Devoir accompli !</h3>
              <p className="text-slate-500 font-medium">Vous avez voté sur toutes les propositions.</p>
            </div>
          )}
          <div className="pt-6">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Archives</h3>
            {closedProposals.map(proposal => (
              <Card key={proposal.id} className="p-5 bg-slate-50 mb-4">
                  <div className="flex justify-between items-start mb-3"><h3 className="text-xl font-black text-slate-700 leading-tight pr-4">{proposal.title}</h3><Badge color="gray">Terminé</Badge></div>
                  {renderChart(proposal)}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
