
import React from 'react';
import { X, Share2, Heart, Clock } from 'lucide-react';
import { Button } from './ui';
import { Article } from '../types';
import { useData } from '../hooks/useData';
import { MOCK_ARTICLES } from '../constants';

interface FlashInfoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  communityId?: string;
}

export const FlashInfoViewer: React.FC<FlashInfoViewerProps> = ({ isOpen, onClose, communityId }) => {
  const { data: articles } = useData<Article>('articles', MOCK_ARTICLES, 'date', communityId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-pop">
      {/* Close Button - Fixed Top Right */}
      <button 
        onClick={onClose} 
        className="absolute top-safe-top right-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors"
      >
        <X size={24} />
      </button>

      {/* Main Swipe Container - Horizontal Snap */}
      <div className="flex-1 w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar">
        {articles.length > 0 ? articles.map((article) => (
          <div key={article.id} className="w-full h-full shrink-0 snap-center relative bg-white flex flex-col overflow-hidden">
            
            {/* Scrollable Content Area within the Slide */}
            <div className="w-full h-full overflow-y-auto no-scrollbar relative">
              
              {/* Cover Image Header - Parallax feel */}
              <div className="relative h-[50vh] w-full">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                
                {/* Overlay Text on Image */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block bg-brand-600 text-white text-[10px] font-black px-2 py-1 rounded mb-2 uppercase tracking-widest shadow-lg">
                    {article.category}
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2 drop-shadow-sm leading-[0.95] tracking-tight">
                    {article.title}
                  </h2>
                  <div className="flex items-center text-xs text-slate-700 font-bold uppercase tracking-wide">
                    <span className="mr-3 flex items-center"><Clock size={12} className="mr-1"/> {article.date}</span>
                    <span>Par {article.author}</span>
                  </div>
                </div>
              </div>

              {/* Article Body */}
              <div className="px-6 pb-32 bg-white min-h-[50vh]">
                 <div className="space-y-4">
                   {article.blocks.map(block => {
                     if (block.type === 'heading') {
                       return <h3 key={block.id} className="text-xl font-black text-slate-900 mt-6">{block.content}</h3>;
                     }
                     return <p key={block.id} className="text-lg text-slate-800 leading-relaxed font-medium">{block.content}</p>;
                   })}
                 </div>
                 
                 <div className="mt-8 pt-8 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Fin de l'article</p>
                    <div className="flex justify-center space-x-4">
                      <Button variant="secondary" className="rounded-full w-12 h-12 p-0 flex items-center justify-center">
                        <Heart size={20} />
                      </Button>
                      <Button variant="primary" className="rounded-full px-6">
                        <Share2 size={18} className="mr-2" /> Partager
                      </Button>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        )) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold">
            Aucune actualité pour le moment.
          </div>
        )}
      </div>
      
      {/* Hint for Navigation */}
      {articles.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 pointer-events-none flex justify-center z-40">
          <div className="bg-black/30 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
            Swipe ↔
          </div>
        </div>
      )}
    </div>
  );
};
