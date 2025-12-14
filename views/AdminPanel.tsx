
import React, { useState } from 'react';
import { User, Article, Community } from '../types';
import { Button } from '../components/ui';
import { NewsEditor } from '../components/NewsEditor';
import { UserManagement } from '../components/admin/UserManagement';
import { CommunitySettings } from '../components/admin/CommunitySettings';
import { useData } from '../hooks/useData';
import { Settings, Users, FileText, Plus, Edit2, Trash2, Calendar, EyeOff } from 'lucide-react';
import { MOCK_ARTICLES, MOCK_COMMUNITIES } from '../constants';
import { FeatureService } from '../lib/api';

interface AdminPanelProps {
  currentUser: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'NEWS' | 'SETTINGS'>('MEMBERS');
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | undefined>(undefined);
  
  // Data Fetching
  const { data: users, setData: setUsers } = useData<User>('profiles', [], 'name', currentUser.communityId);
  const { data: articles, setData: setArticles } = useData<Article>('articles', MOCK_ARTICLES, 'date', currentUser.communityId);
  const { data: communities, setData: setCommunities } = useData<Community>('communities', MOCK_COMMUNITIES);
  
  const currentCommunity = communities.find(c => c.id === currentUser.communityId);

  const handleCreateNew = () => {
    setArticleToEdit(undefined);
    setIsEditingNews(true);
  };

  const handleEditArticle = (article: Article) => {
    setArticleToEdit(article);
    setIsEditingNews(true);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article définitivement ?")) return;
    try {
        await FeatureService.deleteArticle(id);
        setArticles(articles.filter(a => a.id !== id));
    } catch (e) {
        console.error(e);
        alert("Erreur lors de la suppression.");
    }
  };

  const handleSaveArticle = async (articleData: Partial<Article>) => {
    try {
        let savedArticle: Article;
        
        if (articleToEdit) {
            // Update
            savedArticle = await FeatureService.updateArticle(articleToEdit.id, articleData);
            setArticles(articles.map(a => a.id === articleToEdit.id ? savedArticle : a));
        } else {
            // Create
            savedArticle = await FeatureService.createArticle(articleData);
            setArticles([savedArticle, ...articles]);
        }
        
        setIsEditingNews(false);
        setArticleToEdit(undefined);
    } catch (e) {
        console.error(e);
        alert("Erreur lors de la sauvegarde de l'article.");
    }
  };

  const handleUpdateCommunity = (updated: Community) => {
    setCommunities(communities.map(c => c.id === updated.id ? updated : c));
    alert("Paramètres du quartier mis à jour (Simulé pour le moment) !");
  };

  if (isEditingNews) {
    return (
      <NewsEditor 
        communityId={currentUser.communityId}
        authorName={currentUser.name}
        onSave={handleSaveArticle}
        onCancel={() => { setIsEditingNews(false); setArticleToEdit(undefined); }}
        initialArticle={articleToEdit}
      />
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="px-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Administration</h1>
        <p className="text-slate-600 font-bold">Gestion de {currentCommunity?.name || currentUser.communityId}</p>
      </header>

      {/* Tabs */}
      <div className="bg-slate-300 p-1.5 rounded-2xl flex relative shadow-inner overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('MEMBERS')}
          className={`flex-1 min-w-[90px] py-3 text-[10px] sm:text-xs font-black rounded-xl transition-all duration-300 z-10 flex items-center justify-center ${activeTab === 'MEMBERS' ? 'bg-white text-slate-900 shadow-md transform scale-100 border-2 border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Users size={16} className="mr-1 sm:mr-2" strokeWidth={2.5} />
          MEMBRES
        </button>
        <button 
          onClick={() => setActiveTab('NEWS')}
          className={`flex-1 min-w-[90px] mx-1 py-3 text-[10px] sm:text-xs font-black rounded-xl transition-all duration-300 z-10 flex items-center justify-center ${activeTab === 'NEWS' ? 'bg-white text-slate-900 shadow-md transform scale-100 border-2 border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <FileText size={16} className="mr-1 sm:mr-2" strokeWidth={2.5} />
          JOURNAL
        </button>
        <button 
          onClick={() => setActiveTab('SETTINGS')}
          className={`flex-1 min-w-[90px] py-3 text-[10px] sm:text-xs font-black rounded-xl transition-all duration-300 z-10 flex items-center justify-center ${activeTab === 'SETTINGS' ? 'bg-white text-slate-900 shadow-md transform scale-100 border-2 border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Settings size={16} className="mr-1 sm:mr-2" strokeWidth={2.5} />
          CONFIG
        </button>
      </div>

      {activeTab === 'MEMBERS' && (
        <UserManagement users={users} currentUser={currentUser} setUsers={setUsers} />
      )}

      {activeTab === 'NEWS' && (
        <div className="space-y-4 animate-pop">
           <Button onClick={handleCreateNew} fullWidth variant="primary" className="mb-4">
             <Plus size={20} className="mr-2" /> RÉDIGER UN ARTICLE
           </Button>

           <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-2">Gestion des Articles</h3>
           <div className="space-y-3">
             {articles.map(article => {
                const isScheduled = article.scheduledAt && new Date(article.scheduledAt) > new Date();
                const isDraft = !article.published;
                
                return (
                 <div key={article.id} className={`bg-white p-3 rounded-xl border border-slate-200 flex flex-col space-y-3 shadow-sm relative overflow-hidden ${isDraft ? 'border-dashed border-slate-400 bg-slate-50' : ''}`}>
                    {isDraft && <div className="absolute top-0 right-0 bg-slate-200 text-slate-500 text-[9px] font-black px-2 py-1 rounded-bl-lg uppercase">Brouillon</div>}
                    {isScheduled && <div className="absolute top-0 right-0 bg-blue-100 text-blue-600 text-[9px] font-black px-2 py-1 rounded-bl-lg uppercase flex items-center"><Calendar size={10} className="mr-1"/> Programmé</div>}
                    
                    <div className="flex space-x-3">
                        <div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden shrink-0 border border-slate-300">
                            <img src={article.image} className={`w-full h-full object-cover ${isDraft ? 'opacity-50' : ''}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 uppercase">{article.category}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{isScheduled ? new Date(article.scheduledAt!).toLocaleDateString() : article.date}</span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm leading-tight mt-1 line-clamp-2">{article.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Par {article.author}</p>
                        </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-2 border-t border-slate-100">
                       <Button onClick={() => handleEditArticle(article)} variant="secondary" size="sm" className="flex-1 h-8 text-xs">
                          <Edit2 size={14} className="mr-2"/> Modifier
                       </Button>
                       <button onClick={() => handleDeleteArticle(article.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 border border-red-200 transition-colors">
                          <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
               );
             })}
             {articles.length === 0 && (
               <div className="text-center p-8 text-slate-400 font-bold border-2 border-dashed border-slate-300 rounded-xl">
                 Aucun article pour le moment.
               </div>
             )}
           </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && currentCommunity && (
         <CommunitySettings community={currentCommunity} onUpdate={handleUpdateCommunity} />
      )}
    </div>
  );
};
