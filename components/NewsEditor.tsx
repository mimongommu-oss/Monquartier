
import React, { useState, useEffect } from 'react';
import { Article, ContentBlock, BlockType } from '../types';
import { Button, Card, Badge } from './ui';
import { Plus, Trash2, Type, AlignLeft, Eye, Save, CalendarClock, Globe } from 'lucide-react';
import { ImageUploader } from './ImageUploader';

interface NewsEditorProps {
  communityId: string;
  authorName: string;
  onSave: (article: Partial<Article>) => void;
  onCancel: () => void;
  initialArticle?: Article; // Pour le mode édition
}

export const NewsEditor: React.FC<NewsEditorProps> = ({ communityId, authorName, onSave, onCancel, initialArticle }) => {
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [category, setCategory] = useState(initialArticle?.category || 'INFO');
  const [imageUrl, setImageUrl] = useState(initialArticle?.image || '');
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialArticle?.blocks || [
    { id: '1', type: 'paragraph', content: '' }
  ]);
  const [previewMode, setPreviewMode] = useState(false);
  
  // New States for Scheduling & Draft
  const [scheduledAt, setScheduledAt] = useState(initialArticle?.scheduledAt || '');
  const [isPublished, setIsPublished] = useState(initialArticle?.published ?? true);

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: ''
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleSave = () => {
    if (!title || !imageUrl) return alert("Titre et image obligatoires");
    
    // Déterminer la date d'affichage
    let displayDate = "À l'instant";
    if (scheduledAt) {
       const dateObj = new Date(scheduledAt);
       displayDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    } else if (initialArticle?.date) {
       displayDate = initialArticle.date;
    }

    const articleData: Partial<Article> = {
      id: initialArticle?.id, // undefined si création
      communityId,
      title,
      category,
      image: imageUrl,
      date: displayDate,
      scheduledAt: scheduledAt || undefined,
      author: initialArticle?.author || authorName,
      blocks: blocks.filter(b => b.content.trim() !== ''),
      published: isPublished
    };
    onSave(articleData);
  };

  const handleCancelSafe = () => {
    if (title || blocks.length > 1 || blocks[0].content) {
      if (confirm("Attention : vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?")) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  if (previewMode) {
    return (
      <div className="bg-white min-h-full p-4 animate-pop">
         <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="font-black text-xl">Prévisualisation</h2>
            <Button onClick={() => setPreviewMode(false)} variant="ghost" size="sm">Retour Édition</Button>
         </div>
         
         <div className="max-w-md mx-auto bg-white border shadow-xl rounded-xl overflow-hidden">
            <div className="h-48 relative">
               <img src={imageUrl || 'https://via.placeholder.com/400x200'} className="w-full h-full object-cover"/>
               <span className="absolute bottom-4 left-4 bg-brand-600 text-white text-xs font-black px-2 py-1 rounded uppercase">{category}</span>
            </div>
            <div className="p-6">
               <h1 className="text-2xl font-black mb-2 leading-tight">{title}</h1>
               <p className="text-xs text-slate-500 font-bold mb-6">Par {authorName} • {scheduledAt ? `Programmé : ${new Date(scheduledAt).toLocaleDateString()}` : "À l'instant"}</p>
               
               <div className="space-y-4">
                  {blocks.map(block => (
                    <div key={block.id} className={block.type === 'heading' ? 'font-black text-lg text-slate-900 mt-4' : 'text-slate-700 leading-relaxed'}>
                      {block.content}
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl">
        <h2 className="font-black text-slate-800">{initialArticle ? "Modifier l'Article" : "Nouvel Article"}</h2>
        <div className="flex space-x-2">
           <Button onClick={() => setPreviewMode(true)} variant="ghost" size="sm"><Eye size={18}/></Button>
           <Button onClick={handleCancelSafe} variant="ghost" size="sm" className="text-red-500">Annuler</Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Meta Data */}
        <Card className="p-4 space-y-4">
           <div>
             <label className="block text-xs font-black text-slate-500 uppercase mb-1">Titre de l'article</label>
             <input 
               className="w-full text-lg font-bold border-b-2 border-slate-200 focus:border-brand-500 outline-none py-2 bg-transparent"
               placeholder="Ex: Fête des voisins..."
               value={title}
               onChange={e => setTitle(e.target.value)}
             />
           </div>
           
           <div className="flex space-x-4">
             <div className="flex-1">
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Catégorie</label>
                <select 
                  className="w-full font-bold bg-slate-50 border border-slate-200 rounded-lg p-2"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="INFO">Info Générale</option>
                  <option value="URGENT">Urgent</option>
                  <option value="SPORT">Sport</option>
                  <option value="SANTÉ">Santé</option>
                  <option value="TRAVAUX">Travaux</option>
                </select>
             </div>
           </div>

           <ImageUploader 
             label="Image de couverture"
             currentImage={imageUrl}
             onUpload={setImageUrl}
             folder="news"
           />
        </Card>

        {/* Publication Settings */}
        <Card className="p-4 bg-slate-50 border-2 border-slate-200">
           <h3 className="text-xs font-black text-slate-500 uppercase mb-3">Paramètres de Publication</h3>
           
           <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                   <CalendarClock size={16} className="mr-2 text-slate-500" />
                   Date de publication (Optionnel)
                </label>
                <input 
                  type="datetime-local" 
                  value={scheduledAt}
                  onChange={(e) => {
                     setScheduledAt(e.target.value);
                     // Si on met une date future, on force "published=true" pour que le scheduler le prenne, 
                     // ou on garde la logique que "published" signifie "pret à être diffusé"
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-sm"
                />
                <p className="text-[10px] text-slate-500 mt-1">Laisser vide pour publier immédiatement.</p>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                 <button 
                   onClick={() => setIsPublished(!isPublished)}
                   className={`w-12 h-7 rounded-full transition-colors relative ${isPublished ? 'bg-green-500' : 'bg-slate-300'}`}
                 >
                   <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isPublished ? 'left-6' : 'left-1'}`}></div>
                 </button>
                 <span className={`font-bold text-sm ${isPublished ? 'text-green-700' : 'text-slate-500'}`}>
                    {isPublished ? "Statut : Public / Programmé" : "Statut : Brouillon (Masqué)"}
                 </span>
              </div>
           </div>
        </Card>

        {/* Blocks Editor */}
        <div className="space-y-3">
           <div className="flex items-center justify-between px-1">
             <span className="text-xs font-black text-slate-500 uppercase">Contenu</span>
             <span className="text-xs font-bold text-slate-400">{blocks.length} blocs</span>
           </div>
           
           {blocks.map((block, index) => (
             <div key={block.id} className="group relative bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-brand-300 transition-colors">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                   <button onClick={() => removeBlock(block.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                </div>
                
                <div className="mb-2">
                   {block.type === 'heading' && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded uppercase font-bold">Titre</span>}
                   {block.type === 'paragraph' && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded uppercase font-bold">Paragraphe</span>}
                </div>

                <textarea 
                  className={`w-full outline-none bg-transparent resize-none ${block.type === 'heading' ? 'font-black text-lg' : 'text-sm text-slate-700 leading-relaxed'}`}
                  placeholder={block.type === 'heading' ? 'Écrire un sous-titre...' : 'Écrire votre texte...'}
                  value={block.content}
                  onChange={e => updateBlock(block.id, e.target.value)}
                  rows={block.type === 'heading' ? 1 : 3}
                />
             </div>
           ))}
        </div>

        {/* Add Blocks Actions */}
        <div className="flex justify-center space-x-3 py-4 border-t-2 border-dashed border-slate-300">
           <button onClick={() => addBlock('paragraph')} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-slate-300 shadow-sm text-sm font-bold text-slate-600 hover:bg-slate-50">
              <AlignLeft size={16} /> <span>+ Texte</span>
           </button>
           <button onClick={() => addBlock('heading')} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-slate-300 shadow-sm text-sm font-bold text-slate-600 hover:bg-slate-50">
              <Type size={16} /> <span>+ Titre</span>
           </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex items-center justify-between z-50">
         <span className="text-xs font-bold text-slate-400 hidden sm:inline">{blocks.length} blocs</span>
         <div className="flex space-x-2 w-full sm:w-auto">
            {!isPublished && (
               <Button onClick={handleSave} variant="secondary" className="flex-1 sm:flex-none">
                  ENREGISTRER BROUILLON
               </Button>
            )}
            <Button onClick={() => { setIsPublished(true); setTimeout(handleSave, 0); }} variant="primary" className="shadow-lg flex-1 sm:flex-none">
                <Save size={18} className="mr-2"/> {scheduledAt ? 'PROGRAMMER' : (initialArticle ? 'METTRE À JOUR' : 'PUBLIER')}
            </Button>
         </div>
      </div>
    </div>
  );
};
