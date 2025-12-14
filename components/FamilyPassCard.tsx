
import React, { useEffect, useState } from 'react';
import { Share2, Copy, Download, Loader2, Home } from 'lucide-react';
import { Button } from './ui';
import QRCode from 'qrcode';

interface FamilyPassCardProps {
  communityName: string;
  familyName?: string;
  familyCode: string;
  className?: string;
}

export const FamilyPassCard: React.FC<FamilyPassCardProps> = ({ 
  communityName, 
  familyName = "Mon Foyer", 
  familyCode, 
  className = "" 
}) => {
  const [downloading, setDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Génération du QR Code au montage pour affichage et usage Canvas
  useEffect(() => {
    QRCode.toDataURL(familyCode, { 
      width: 500,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
    .then(url => {
      setQrDataUrl(url);
    })
    .catch(err => {
      console.error(err);
    });
  }, [familyCode]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx || !qrDataUrl) return;

      // 1. Configuration HD (1200x1600)
      canvas.width = 1200;
      canvas.height = 1600;

      // 2. Fond Global (Blanc)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. En-tête (Bleu Mon Quartier)
      ctx.fillStyle = '#2563eb'; // blue-600
      ctx.fillRect(0, 0, canvas.width, 300);

      // 4. Textes En-tête
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 40px sans-serif'; // Police système robuste
      ctx.fillText('MON QUARTIER', canvas.width / 2, 100);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 80px sans-serif';
      ctx.fillText(communityName.toUpperCase(), canvas.width / 2, 200);

      // 5. Corps du Pass
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.font = 'bold 50px sans-serif';
      ctx.fillText('CODE D\'ACCÈS FOYER', canvas.width / 2, 450);

      // Boite Code
      ctx.fillStyle = '#f1f5f9'; // slate-100
      ctx.strokeStyle = '#cbd5e1'; // slate-300
      ctx.lineWidth = 10;
      
      // Rect Code
      ctx.fillRect(200, 500, 800, 180);
      ctx.strokeRect(200, 500, 800, 180);

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 100px monospace';
      ctx.fillText(familyCode, canvas.width / 2, 625);

      // 6. Gestion du QR Code (Local Data URL - No CORS issue!)
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve) => { qrImg.onload = resolve; });
      
      const qrSize = 500;
      ctx.drawImage(qrImg, (canvas.width - qrSize) / 2, 800, qrSize, qrSize);

      // 7. Footer
      ctx.fillStyle = '#64748b'; // slate-500
      ctx.font = '40px sans-serif';
      ctx.fillText('Scannez ce code pour rejoindre la famille.', canvas.width / 2, 1400);
      
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('Généré par l\'application Mon Quartier', canvas.width / 2, 1500);

      // 8. Export et Téléchargement Réel
      const finalUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `PASS-FAMILLE-${familyCode}.png`;
      link.href = finalUrl;
      link.click();

    } catch (e) {
      console.error("Erreur génération image", e);
      alert("Impossible de générer l'image sur cet appareil.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Mon Quartier - Pass Famille',
      text: `Rejoins notre foyer sur l'application Mon Quartier avec le code : ${familyCode}`,
      url: `https://monquartier.app/join?code=${familyCode}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      navigator.clipboard.writeText(familyCode);
      alert('Code copié dans le presse-papier !');
    }
  };

  return (
    <div className={`bg-white rounded-3xl overflow-hidden shadow-2xl border-8 border-slate-200 relative animate-pop ${className}`}>
      {/* Visual Header */}
      <div className="bg-blue-600 p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <p className="text-white/80 text-xs font-black uppercase tracking-[0.2em] mb-1 relative z-10">MON QUARTIER</p>
        <h3 className="text-white text-2xl font-black relative z-10">{communityName}</h3>
      </div>
      
      {/* Body */}
      <div className="p-8 flex flex-col items-center">
        <div className="flex items-center space-x-2 mb-4">
            <Home size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{familyName}</span>
        </div>

        <div className="bg-slate-100 px-8 py-4 rounded-2xl border-2 border-slate-300 mb-8 w-full text-center relative group cursor-pointer" onClick={() => navigator.clipboard.writeText(familyCode)}>
            <span className="text-5xl font-black text-slate-900 tracking-wider font-mono">{familyCode}</span>
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded shadow-sm">Copier</span>
            </div>
        </div>
        
        {/* QR Code Container */}
        <div className="p-3 border-4 border-slate-900 rounded-3xl mb-6 bg-white shadow-lg relative">
            <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-blue-600 rounded-tl-lg"></div>
            <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-blue-600 rounded-tr-lg"></div>
            <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-blue-600 rounded-bl-lg"></div>
            <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-blue-600 rounded-br-lg"></div>
            
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="QR Code"
                className="w-40 h-40 mix-blend-multiply"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-400" />
              </div>
            )}
        </div>

        <p className="text-xs text-slate-500 font-bold text-center w-full leading-tight max-w-[200px]">
          Scannez ce code pour rejoindre le foyer instantanément.
        </p>
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-50 p-4 flex gap-3 border-t border-slate-200">
        <button 
          onClick={handleDownload}
          disabled={downloading || !qrDataUrl}
          className="flex-1 flex items-center justify-center py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg border-b-4 border-black active:border-b-0 active:translate-y-1"
        >
          {downloading ? <Loader2 className="animate-spin" size={20} /> : <><Download size={20} className="mr-2" /> ENREGISTRER</>}
        </button>

        <button 
          onClick={handleShare}
          className="flex-1 flex items-center justify-center py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
        >
          <Share2 size={20} className="mr-2" /> PARTAGER
        </button>
      </div>
    </div>
  );
};
