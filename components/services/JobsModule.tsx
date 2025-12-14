
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../ui';
import { Job } from '../../types';
import { Clock, Briefcase, CheckCircle, ChevronDown, ChevronUp, Loader2, Check } from 'lucide-react';
import { FeatureService } from '../../lib/api';
import { supabase } from '../../lib/supabase';

interface JobsModuleProps {
  jobs: Job[];
  loading: boolean;
  communityId: string;
}

export const JobsModule: React.FC<JobsModuleProps> = ({ jobs, loading }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [applying, setApplying] = useState<string | null>(null);

  const openJobs = jobs.filter(j => j.status === 'OPEN');
  const completedJobs = jobs.filter(j => j.status !== 'OPEN');

  useEffect(() => {
    const loadApplications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
            const apps = await FeatureService.getUserApplications(user.id);
            setAppliedJobs(apps);
        }
    };
    loadApplications();
  }, []);

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;

        await FeatureService.applyToJob(jobId, user.id);
        setAppliedJobs(prev => [...prev, jobId]);
        alert("Candidature envoyée !");
    } catch (e: any) {
        console.error(e);
        alert(e.message || "Erreur candidature");
    } finally {
        setApplying(null);
    }
  };

  return (
    <div className="space-y-6 animate-pop">
      {/* Active Jobs Only */}
      <div>
        <div className="flex justify-between items-center px-1 mb-3">
          <h2 className="font-black text-slate-800 uppercase tracking-tight">Offres disponibles</h2>
        </div>

        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand-600"/></div>
        ) : openJobs.length > 0 ? (
          openJobs.map(job => {
            const hasApplied = appliedJobs.includes(job.id);
            return (
                <Card key={job.id} className="overflow-hidden p-0 shadow-xl border-2 border-slate-300 mb-4">
                <div className="h-3 w-full bg-green-500"></div>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-black text-lg text-slate-900 leading-tight">{job.title}</h3>
                        <div className="flex items-center text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider">
                        <Clock size={12} className="mr-1" /> {job.date}
                        </div>
                    </div>
                    <Badge color={hasApplied ? 'blue' : 'green'}>{hasApplied ? 'Candidat' : 'OUVERT'}</Badge>
                    </div>

                    <div className="flex items-center justify-between mt-4 bg-slate-100 p-3 rounded-xl border-2 border-slate-200">
                    <span className="text-sm font-black text-brand-800">{job.pay} FCFA</span>
                    <div className="flex items-center space-x-1">
                        <div className="flex -space-x-2 mr-2">
                        {Array.from({length: job.spotsFilled}).map((_, i) => (
                            <div key={i} className="w-5 h-5 rounded-full bg-slate-800 border border-white"></div>
                        ))}
                        {Array.from({length: Math.max(0, job.spots - job.spotsFilled)}).map((_, i) => (
                            <div key={`empty-${i}`} className="w-5 h-5 rounded-full bg-slate-200 border border-slate-400"></div>
                        ))}
                        </div>
                        <span className="text-xs font-bold text-slate-700 uppercase">{job.spotsFilled}/{job.spots} PLACES</span>
                    </div>
                    </div>

                    <div className="mt-5">
                        {hasApplied ? (
                            <Button fullWidth variant="secondary" className="bg-blue-50 text-blue-800 border-blue-200 cursor-default" disabled>
                                <Check className="mr-2" size={18}/> CANDIDATURE ENVOYÉE
                            </Button>
                        ) : (
                            <Button fullWidth variant="primary" onClick={() => handleApply(job.id)} loading={applying === job.id}>
                                POSTULER MAINTENANT
                            </Button>
                        )}
                    </div>
                </div>
                </Card>
            );
          })
        ) : (
          <div className="text-center py-10 px-6 bg-white rounded-3xl border-2 border-slate-300 border-dashed">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase size={32} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-black text-slate-900">Aucune mission</h3>
            <p className="text-slate-600 font-medium">Revenez plus tard pour de nouvelles offres.</p>
          </div>
        )}
      </div>

      {/* History Toggle */}
      <div className="pt-4 border-t-2 border-slate-300 border-dashed">
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-center text-slate-600 font-bold text-sm hover:text-slate-900 py-2"
        >
          {showHistory ? <ChevronUp className="mr-2" size={16}/> : <ChevronDown className="mr-2" size={16}/>}
          {showHistory ? 'Masquer l\'historique' : 'Voir les missions terminées'}
        </button>

        {showHistory && (
          <div className="mt-4 space-y-4 animate-pop">
            {completedJobs.map(job => (
              <Card key={job.id} className="overflow-hidden p-0 shadow-sm border-2 border-slate-300 hover:opacity-100 transition-opacity">
                <div className="h-3 w-full bg-slate-500"></div>
                
                {job.imageAfter && (
                  <div className="h-32 w-full relative">
                    <div className="absolute inset-0 flex">
                      <img src={job.imageBefore} alt="Avant" className="w-1/2 object-cover border-r-2 border-white" />
                      <img src={job.imageAfter} alt="Après" className="w-1/2 object-cover" />
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-md">Preuve Avant / Après</div>
                  </div>
                )}

                <div className="p-4 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">{job.title}</h3>
                    <Badge color="gray">FERMÉ</Badge>
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-600 flex items-center">
                    <CheckCircle size={14} className="mr-1 text-green-700"/> Mission validée et payée
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
