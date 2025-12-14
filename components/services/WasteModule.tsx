
import React from 'react';
import { Card, Button } from '../ui';
import { Calendar } from 'lucide-react';

export const WasteModule: React.FC = () => {
  return (
    <div className="space-y-4 animate-pop">
      <Card className="p-6 text-center bg-gradient-to-br from-brand-50 to-white border-2 border-brand-200">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600 shadow-inner border-4 border-white">
          <Calendar size={40} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">Prochain Passage</h2>
        <p className="text-brand-700 font-black text-xl uppercase tracking-wider">Ce soir à 19h00</p>
        <div className="mt-4 inline-block bg-yellow-100 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full border border-yellow-300">
          ⚠️ Sortir 30min avant
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-black text-slate-800 uppercase tracking-tight mb-4">Planning Semaine</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800">Lundi</span>
            <span className="font-black text-slate-900 bg-white px-2 py-1 rounded border border-slate-300">19:00</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800">Jeudi</span>
            <span className="font-black text-slate-900 bg-white px-2 py-1 rounded border border-slate-300">19:00</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-200">
            <span className="font-bold text-orange-900">Samedi (Encombrants)</span>
            <span className="font-black text-orange-900 bg-white px-2 py-1 rounded border border-orange-200">08:00</span>
          </div>
        </div>
      </Card>

      <Button variant="danger" fullWidth>
        Signaler un oubli de ramassage !
      </Button>
    </div>
  );
};
