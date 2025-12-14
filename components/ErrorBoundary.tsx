import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-red-500 animate-pop">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
              <AlertTriangle size={32} strokeWidth={3} />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">
              Erreur Critique
            </h2>
            
            <p className="text-slate-600 font-bold text-sm mb-6 leading-relaxed">
              L'application a rencontré un problème inattendu et a dû s'arrêter par sécurité.
            </p>

            <div className="bg-slate-100 p-3 rounded-xl mb-6 text-left border border-slate-200 overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Détails techniques :</p>
              <p className="text-[10px] font-mono text-red-600 break-words">
                {this.state.error?.message || "Erreur inconnue"}
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={this.handleReload}
                className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
              >
                <RefreshCw size={20} className="mr-2" strokeWidth={3} />
                RELANCER
              </button>
              
              <button 
                onClick={this.handleHome}
                className="w-full bg-white text-slate-700 font-bold py-3 rounded-xl border-2 border-slate-200 hover:bg-slate-50 flex items-center justify-center"
              >
                <Home size={18} className="mr-2" />
                Retour Accueil
              </button>
            </div>
          </div>
          <p className="mt-8 text-slate-500 text-[10px] font-mono uppercase tracking-widest opacity-50">
            Mon Quartier v1.0 • Stable Build
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}