
import React, { useState } from 'react';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { StorageService } from '../lib/storage';

interface ImageUploaderProps {
  currentImage?: string;
  onUpload: (url: string) => void;
  folder?: string;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImage, onUpload, folder = 'uploads', label = 'Image' }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      const url = await StorageService.uploadImage(file, folder);
      onUpload(url);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Erreur lors de l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-black text-slate-500 uppercase mb-1">{label}</label>
      
      {!currentImage ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative">
            {uploading ? (
                <Loader2 className="animate-spin text-brand-500" />
            ) : (
                <>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-slate-400" />
                        <p className="text-xs text-slate-500 font-bold">Appuyer pour ajouter</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </>
            )}
        </label>
      ) : (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-slate-200 group">
           <img src={currentImage} alt="Uploaded" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => onUpload('')} 
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                title="Supprimer l'image"
              >
                 <X size={20} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
