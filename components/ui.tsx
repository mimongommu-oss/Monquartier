
import React from 'react';
import { Loader2 } from 'lucide-react';

// Carte style "Bloc" avec bords arrondis et ombre solide
// Contraste augmenté : Fond blanc pur, bordure foncée
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick} 
    className={`bg-white rounded-3xl border-2 border-slate-900 shadow-game-lg overflow-hidden animate-pop ${className}`}
  >
    {children}
  </div>
);

// Bouton style "Arcade" haute visibilité avec gestion Loading intégrée
export const Button: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'gold'; 
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}> = ({ children, variant = 'primary', size = 'md', fullWidth, onClick, disabled, loading = false, className = '', type = 'button' }) => {
  const baseStyle = "inline-flex items-center justify-center font-black tracking-wide transition-all rounded-2xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed btn-press uppercase relative overflow-hidden";
  
  const variants = {
    // Bleu électrique sur Blanc ou inverse
    primary: "bg-blue-600 text-white border-b-4 border-blue-900 shadow-game-btn active:border-b-0 hover:bg-blue-700", 
    // Blanc avec bordure Noire
    secondary: "bg-white text-slate-900 border-2 border-slate-900 border-b-4 border-b-slate-900 shadow-game-btn active:border-b-0 hover:bg-slate-50", 
    // Rouge vif
    danger: "bg-red-600 text-white border-b-4 border-red-900 shadow-game-btn active:border-b-0 hover:bg-red-700",
    // Or / Jaune vif (texte noir obligatoire pour contraste)
    gold: "bg-yellow-400 text-black border-b-4 border-yellow-700 shadow-game-btn active:border-b-0 hover:bg-yellow-500",
    // Outline fort
    outline: "border-2 border-slate-900 text-slate-900 bg-transparent hover:bg-slate-100", 
    // Ghost (mais lisible)
    ghost: "text-slate-700 hover:bg-slate-200 hover:text-black rounded-xl" 
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };

  return (
    <button 
      type={type}
      onClick={!loading ? onClick : undefined} 
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <span className="opacity-0">{children}</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 20} />
          </div>
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Badges Haute Lisibilité (High Contrast)
// Fini les pastels flous. On utilise des bordures et du texte noir/foncé.
export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'blue' | 'yellow' | 'gray' }> = ({ children, color = 'gray' }) => {
  const colors = {
    // Fond blanc, Bordure Couleur, Texte Noir/Couleur Sombre
    green: 'bg-green-50 text-green-900 border-2 border-green-600',
    red: 'bg-red-50 text-red-900 border-2 border-red-600',
    blue: 'bg-blue-50 text-blue-900 border-2 border-blue-600',
    yellow: 'bg-yellow-50 text-yellow-950 border-2 border-yellow-500', // Jaune plus foncé pour bordure
    gray: 'bg-slate-100 text-slate-900 border-2 border-slate-600',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${colors[color]}`}>
      {children}
    </span>
  );
};

export const ProgressBar: React.FC<{ value: number; max: number; color?: string }> = ({ value, max, color = 'bg-blue-600' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full bg-slate-200 rounded-full h-5 border-2 border-slate-900 shadow-inner relative overflow-hidden">
      <div 
        className={`${color} h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1 relative z-10 border-r-2 border-black/20`} 
        style={{ width: `${percentage}%` }}
      >
        {/* Pattern rayé pour effet "Construction" */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]"></div>
      </div>
    </div>
  );
};
