
import React, { useState, useEffect } from 'react';
import { Community } from '../../types';
import { Button, Card } from '../ui';
import { Save, Image as ImageIcon, MapPin, Type, Layout } from 'lucide-react';

interface CommunitySettingsProps {
  community: Community;
  onUpdate: (updatedCommunity: Community) => void;
}

export const CommunitySettings: React.FC<CommunitySettingsProps> = ({ community, onUpdate }) => {
  const [formData, setFormData] = useState<Community>(community);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(community);
  }, [community]);

  const handleChange = (field: keyof Community, value: any) => {
    setFormData(prev => {
        const newData = { ...prev, [field]: value };
        setHasChanges(JSON.stringify(newData) !== JSON.stringify(community));
        return newData;
    });
  };

  const handleSave = () => {
    onUpdate(formData);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6 animate-pop">
      <Card className="p-6 border-l-8 border-l-brand-600">
         <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center">
            <Layout className="mr-2" size={20} /> Identité Visuelle
         </h3>
         
         <div className="space-y-4">
            <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Nom du Quartier</label>
                <div className="flex">
                    <div className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded-l-lg border-2 border-r-0 border-slate-200 text-slate-400">
                        <Type size={20} />
                    </div>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="flex-1 font-bold bg-slate-50 border-2 border-slate-200 rounded-r-xl px-4 py-2 outline-none focus:border-brand-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Ville / Commune</label>
                <div className="flex">
                    <div className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded-l-lg border-2 border-r-0 border-slate-200 text-slate-400">
                        <MapPin size={20} />
                    </div>
                    <input 
                        type="text" 
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="flex-1 font-bold bg-slate-50 border-2 border-slate-200 rounded-r-xl px-4 py-2 outline-none focus:border-brand-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Image de Couverture (URL)</label>
                <div className="flex mb-2">
                    <div className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded-l-lg border-2 border-r-0 border-slate-200 text-slate-400">
                        <ImageIcon size={20} />
                    </div>
                    <input 
                        type="text" 
                        value={formData.coverImage || ''}
                        onChange={(e) => handleChange('coverImage', e.target.value)}
                        className="flex-1 font-bold bg-slate-50 border-2 border-slate-200 rounded-r-xl px-4 py-2 outline-none focus:border-brand-500"
                        placeholder="https://..."
                    />
                </div>
                {formData.coverImage && (
                    <div className="h-32 w-full rounded-xl overflow-hidden border-2 border-slate-200">
                        <img src={formData.coverImage} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                )}
            </div>
         </div>
      </Card>

      <div className="sticky bottom-4 z-10">
         <Button 
            fullWidth 
            variant={hasChanges ? 'primary' : 'ghost'} 
            onClick={handleSave}
            disabled={!hasChanges}
            className={`shadow-xl ${!hasChanges ? 'opacity-50' : ''}`}
         >
            <Save size={20} className="mr-2" /> ENREGISTRER LES MODIFICATIONS
         </Button>
      </div>
    </div>
  );
};
