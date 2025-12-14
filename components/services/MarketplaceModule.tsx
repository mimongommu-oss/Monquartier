
import React, { useState } from 'react';
import { Card, Button } from '../ui';
import { Classified, User, ClassifiedType } from '../../types';
import { Loader2, Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { FeatureService } from '../../lib/api';

interface MarketplaceModuleProps {
  user: User;
  classifieds: Classified[];
  loading: boolean;
  setClassifieds: (ads: Classified[]) => void;
}

export const MarketplaceModule: React.FC<MarketplaceModuleProps> = ({ user, classifieds, loading, setClassifieds }) => {
  const [showCreateAd, setShowCreateAd] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [newAd, setNewAd] = useState<Partial<Classified>>({
    type: 'SELL',
    title: '',
    description: '',
    price: 0,
    image: ''
  });

  const handleCreateAd = async () => {
    if (!newAd.title || !newAd.description) return;
    setPublishing(true);

    try {
        const adPayload: Partial<Classified> = {
          communityId: user.communityId,
          userId: user.id,
          userName: user.name,
          type: newAd.type as ClassifiedType,
          title: newAd.title,
          description: newAd.description,
          price: newAd.price,
          image: newAd.image,
          date: 'À l\'instant'
        };

        const savedAd = await FeatureService.createClassified(adPayload);
        setClassifieds([savedAd, ...classifieds]);
        
        setShowCreateAd(false);
        setNewAd({ type: 'SELL', title: '', description: '', price: 0, image: '' });
    } catch (e) {
        console.error("Erreur annonce", e);
        alert("Erreur lors de la publication.");
    } finally {
        setPublishing(false);
    }
  };

  const handleDeleteAd = (id: string) => {
    if (confirm('Supprimer cette annonce ?')) {
      // Dans une vraie app : FeatureService.deleteClassified(id)
      setClassifieds(classifieds.filter(c => c.id !== id));
    }
  };

  const getTypeBadgeColor = (type: ClassifiedType) => {
    switch (type) {
      case 'SELL': return 'bg-green-100 text-green-800 border-green-200';
      case 'BUY': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'GIVE': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'SERVICE': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100';
    }
  };

  const getTypeLabel = (type: ClassifiedType) => {
    switch (type) {
      case 'SELL': return 'Vente';
      case 'BUY': return 'Recherche';
      case 'GIVE': return 'Don';
      case 'SERVICE': return 'Service';
      default: return type;
    }
  };

  return (
    <div className="space-y-4 animate-pop">
      <Button onClick={() => setShowCreateAd(true)} fullWidth variant="primary" className="mb-4">
        <Plus size={20} className="mr-2" /> PUBLIER UNE ANNONCE
      </Button>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand-600"/></div>
      ) : (
        <div className="space-y-4">
          {classifieds.map(ad => (
            <Card key={ad.id} className="p-0 border-2 border-slate-200 overflow-hidden">
              {ad.image && (
                <div className="h-32 w-full bg-slate-200">
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${getTypeBadgeColor(ad.type)}`}>
                    {getTypeLabel(ad.type)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{ad.date}</span>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{ad.title}</h3>
                <p className="text-sm text-slate-600 font-medium mb-3 line-clamp-2">{ad.description}</p>
                
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="font-black text-brand-700 text-lg">
                    {ad.price ? `${new Intl.NumberFormat('fr-FR').format(ad.price)} FCFA` : 'Gratuit'}
                  </span>
                  
                  {ad.userId === user.id ? (
                      <button onClick={() => handleDeleteAd(ad.id)} className="text-red-400 hover:text-red-600 p-2">
                        <Trash2 size={16} />
                      </button>
                  ) : (
                    <div className="flex items-center text-xs font-bold text-slate-500">
                      <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[9px] mr-2 text-slate-600 border border-slate-300">{ad.userName.charAt(0)}</span>
                      {ad.userName.split(' ')[0]}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          
          {classifieds.length === 0 && (
            <div className="text-center p-8 text-slate-400 font-bold border-2 border-dashed border-slate-300 rounded-xl">
              Aucune annonce. Soyez le premier !
            </div>
          )}
        </div>
      )}

      {/* CREATE AD MODAL */}
      {showCreateAd && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowCreateAd(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl animate-pop border-4 border-slate-200 h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">Nouvelle Annonce</h3>
                <button onClick={() => setShowCreateAd(false)} className="p-1 bg-slate-100 rounded-full"><X size={20}/></button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['SELL', 'BUY', 'GIVE', 'SERVICE'] as ClassifiedType[]).map(type => (
                      <button 
                        key={type}
                        onClick={() => setNewAd({...newAd, type})}
                        className={`p-2 rounded-xl text-xs font-black uppercase border-2 transition-all ${newAd.type === type ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'}`}
                      >
                        {getTypeLabel(type)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Titre</label>
                  <input 
                    type="text" 
                    className="w-full font-bold bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-brand-500 focus:bg-white outline-none"
                    placeholder="Ex: Vélo enfant, Plombier..."
                    value={newAd.title}
                    onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Description</label>
                  <textarea 
                    className="w-full font-medium bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-brand-500 focus:bg-white outline-none h-24 resize-none"
                    placeholder="Détails de l'annonce..."
                    value={newAd.description}
                    onChange={(e) => setNewAd({...newAd, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Prix (FCFA) - Optionnel</label>
                  <input 
                    type="number" 
                    className="w-full font-bold bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-brand-500 focus:bg-white outline-none"
                    placeholder="0"
                    value={newAd.price}
                    onChange={(e) => setNewAd({...newAd, price: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Image (URL)</label>
                  <div className="flex">
                    <div className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded-l-lg border-2 border-r-0 border-slate-200 text-slate-400">
                        <ImageIcon size={20} />
                    </div>
                    <input 
                        type="text" 
                        className="flex-1 font-bold bg-slate-50 border-2 border-slate-200 rounded-r-xl px-4 py-3 focus:border-brand-500 focus:bg-white outline-none"
                        placeholder="https://..."
                        value={newAd.image}
                        onChange={(e) => setNewAd({...newAd, image: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleCreateAd} fullWidth variant="primary" disabled={!newAd.title || !newAd.description} loading={publishing}>
                Publier l'annonce
              </Button>
          </div>
        </div>
      )}
    </div>
  );
};
