
import React, { useState, useRef, useEffect } from 'react';
import { User, Channel, Message } from '../../types';
import { useData } from '../../hooks/useData';
import { MOCK_USERS } from '../../constants';
import { Card, Button, Badge } from '../ui';
import { Plus, Hash, Lock, User as UserIcon, ArrowLeft, MoreVertical, Send, X, Clock, Reply, Copy, Check, CheckCheck, KeyRound, Shield, Loader2 } from 'lucide-react';
import { ChatService } from '../../lib/api';
import { supabase } from '../../lib/supabase';

interface ChatViewProps {
  currentUser: User;
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;
  targetDmUser: User | null;
  onClearTarget: () => void;
}

// Simple beep sounds via Data URI for instant feedback without external assets
const SOUNDS = {
  SEND: 'data:audio/wav;base64,UklGRl9vT1BXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...', // Placeholder short pop
  RECEIVE: 'data:audio/wav;base64,UklGRl9vT1BXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...'
};

const playSound = (type: 'SEND' | 'RECEIVE') => {
  // In a real app, use real .mp3 files. 
  // For this demo, we use the Vibration API as a fallback for "Tactile" feedback which is often better than bad audio.
  if (navigator.vibrate) {
    navigator.vibrate(type === 'SEND' ? 50 : [30, 50, 30]);
  }
};

export const ChatView: React.FC<ChatViewProps> = ({ currentUser, channels, setChannels, targetDmUser, onClearTarget }) => {
  const { data: allUsers } = useData<User>('profiles', MOCK_USERS);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [joiningChannel, setJoiningChannel] = useState(false);
  
  const [newMessage, setNewMessage] = useState('');
  const [showCreateSalon, setShowCreateSalon] = useState(false);
  const [creatingSalon, setCreatingSalon] = useState(false);
  
  // Features
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [contextMenuMessage, setContextMenuMessage] = useState<Message | null>(null);
  
  // Create Salon State
  const [newSalonName, setNewSalonName] = useState('');
  const [newSalonPass, setNewSalonPass] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Auth/Join State
  const [passwordPrompt, setPasswordPrompt] = useState<string | null>(null); 
  const [inputPassword, setInputPassword] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // --- REALTIME & FETCH ---
  useEffect(() => {
    if (!activeChannelId) {
      setMessages([]); 
      return;
    }

    let isMounted = true;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const msgs = await ChatService.getMessages(activeChannelId);
        if (isMounted) setMessages(msgs);
      } catch (err) {
        console.error("Erreur chargement messages", err);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    loadMessages();

    // SUBCRIPTION REALTIME
    const channelSub = supabase.channel(`room:${activeChannelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannelId}` },
        (payload) => {
          const newMsgRow = payload.new;
          
          // On n'ajoute que les messages des AUTRES, car les nôtres sont ajoutés "optimistiquement"
          if (newMsgRow.user_id !== currentUser.id) {
             const incomingMsg: Message = {
                id: newMsgRow.id,
                channelId: newMsgRow.channel_id,
                userId: newMsgRow.user_id,
                userName: newMsgRow.user_name,
                userRole: newMsgRow.user_role,
                content: newMsgRow.content,
                timestamp: newMsgRow.created_at,
                status: 'read',
                replyToId: newMsgRow.reply_to_id,
                replyToName: newMsgRow.reply_to_name,
                replyToContent: newMsgRow.reply_to_content
             };
             setMessages(prev => {
                // Éviter les doublons si la latence réseau est étrange
                if (prev.some(m => m.id === incomingMsg.id)) return prev;
                return [...prev, incomingMsg];
             });
             playSound('RECEIVE');
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channelSub);
    };
  }, [activeChannelId, currentUser.id]);

  // Handle DM Routing
  useEffect(() => {
    if (targetDmUser) {
        const existingDM = channels.find(c => 
            c.type === 'DM' && 
            c.members?.includes(currentUser.id) && 
            c.members?.includes(targetDmUser.id)
        );
    
        if (existingDM) {
            setActiveChannelId(existingDM.id);
        } else {
            // Création automatique du DM en base
            const createDM = async () => {
                try {
                    const newDM = await ChatService.createChannel({
                        communityId: currentUser.communityId,
                        name: `${currentUser.name} & ${targetDmUser.name}`,
                        type: 'DM',
                        members: [currentUser.id, targetDmUser.id],
                        status: 'PENDING',
                        initiatorId: currentUser.id
                    });
                    setChannels([...channels, newDM]);
                    setActiveChannelId(newDM.id);
                } catch(e) { console.error(e); }
            };
            createDM();
        }
        onClearTarget();
    }
  }, [targetDmUser, channels, currentUser, onClearTarget, setChannels]);

  // Auto-scroll on new message
  useEffect(() => {
    if (activeChannelId && !loadingMessages) {
      setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [activeChannelId, messages.length, loadingMessages]);

  const activeChannel = channels.find(c => c.id === activeChannelId);

  const getDMName = (channel: Channel) => {
    if (channel.type !== 'DM') return channel.name;
    const otherId = channel.members?.find(id => id !== currentUser.id);
    const user = allUsers.find(u => u.id === otherId);
    return user ? user.name : 'Utilisateur';
  };

  // --- ACTIONS ---

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannelId) return;

    // Haptic Feedback immédiat
    playSound('SEND');

    const tempId = `temp-${Date.now()}`;
    const msgContent = newMessage;
    const replyContext = replyingTo;

    // 1. Optimistic Update
    const optimisticMsg: Message = {
      id: tempId,
      channelId: activeChannelId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      content: msgContent,
      timestamp: new Date().toISOString(),
      status: 'sending',
      replyToId: replyContext?.id,
      replyToName: replyContext?.userName,
      replyToContent: replyContext?.content
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');
    setReplyingTo(null);

    // Focus input back (sur mobile ça garde le clavier ouvert)
    const input = document.getElementById('chat-input');
    if(input) input.focus();

    try {
        // 2. API Call
        const sentMsg = await ChatService.sendMessage({
            channelId: activeChannelId,
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            content: msgContent,
            replyToId: replyContext?.id,
            replyToName: replyContext?.userName,
            replyToContent: replyContext?.content
        });

        // 3. Confirm Success (Replace temp ID)
        setMessages(prev => prev.map(m => m.id === tempId ? { ...sentMsg, status: 'sent' } : m));
        
        // Simuler "Lu" après un court délai pour effet visuel
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === sentMsg.id ? { ...m, status: 'read' } : m));
        }, 1500);

    } catch (e) {
        console.error("Failed to send", e);
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m));
    }
  };

  const handleJoinChannel = (channel: Channel) => {
    const isMember = channel.members?.includes(currentUser.id);
    if (channel.type === 'PRIVATE' && channel.isLocked && !isMember) {
      setPasswordPrompt(channel.id);
      return;
    }
    setActiveChannelId(channel.id);
  };

  // SÉCURITÉ : Mock (Pas de backend pour verif pwd salon dans cette démo)
  const verifyChannelPassword = async (channelId: string, input: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 500)); 
    return input === "admin123"; 
  };

  const handleConfirmPassword = async () => {
    if(!passwordPrompt) return;
    setJoiningChannel(true);
    
    try {
      const isValid = await verifyChannelPassword(passwordPrompt, inputPassword);
      if (isValid) {
        // En prod, on ajouterait l'utilisateur aux membres du channel via API
        setChannels(channels.map(c => 
          c.id === passwordPrompt 
            ? { ...c, members: [...(c.members || []), currentUser.id] } 
            : c
        ));
        setActiveChannelId(passwordPrompt);
        setPasswordPrompt(null);
        setInputPassword('');
      } else {
        alert("Mot de passe incorrect ! (Hint: admin123)");
        setInputPassword('');
      }
    } catch (e) {
      alert("Erreur de vérification");
    } finally {
      setJoiningChannel(false);
    }
  };

  const handleCreateSalon = async () => {
    if (!newSalonName.trim()) return;
    setCreatingSalon(true);
    
    try {
        const newChannel = await ChatService.createChannel({
          communityId: currentUser.communityId,
          name: newSalonName,
          type: isPrivate ? 'PRIVATE' : 'PUBLIC',
          description: 'Salon créé par un habitant',
          creatorId: currentUser.id,
          isLocked: isPrivate,
          status: 'ACTIVE',
          members: [currentUser.id]
        });
        
        setChannels([...channels, newChannel]);
        setShowCreateSalon(false);
        setNewSalonName('');
        setNewSalonPass('');
        setActiveChannelId(newChannel.id);
    } catch(e) {
        console.error(e);
        alert("Erreur lors de la création du salon");
    } finally {
        setCreatingSalon(false);
    }
  };

  const handleRejectDM = () => {
    if (!activeChannel) return;
    // Update local only for demo logic, real app would update DB status
    const updatedChannels = channels.map(c => 
      c.id === activeChannel.id ? { ...c, status: 'REJECTED' as const } : c
    );
    setChannels(updatedChannels);
    setActiveChannelId(null);
  };

  const handleAcceptDM = () => {
    if (!activeChannel) return;
    const updatedChannels = channels.map(c => 
      c.id === activeChannel.id ? { ...c, status: 'ACTIVE' as const } : c
    );
    setChannels(updatedChannels);
  };

  const renderStatusIcon = (msg: Message) => {
    if (msg.status === 'sending') return <Clock size={12} className="text-slate-400 animate-spin-slow" />;
    if (msg.status === 'error') return <X size={12} className="text-red-500" />;
    if (msg.status === 'sent') return <Check size={14} className="text-slate-400" />;
    if (msg.status === 'read') return <CheckCheck size={14} className="text-blue-500" />;
    return null;
  };

  const scrollToMessage = (id: string) => {
    const el = messageRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-blue-100', 'transition-colors', 'duration-1000');
      setTimeout(() => el.classList.remove('bg-blue-100'), 1000);
    }
  };

  // ... RENDER ...
  
  if (activeChannelId && activeChannel) {
    return (
      <div className="flex flex-col h-full animate-pop bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden mb-20">
         {/* Header */}
         <div className="p-3 bg-white border-b-2 border-slate-200 flex justify-between items-center shadow-sm z-10">
            <button onClick={() => setActiveChannelId(null)} className="p-2 -ml-1 text-slate-500 hover:text-slate-900 active:scale-95 transition-transform">
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <div className="flex flex-col items-center">
              <span className="font-black text-slate-900 text-lg leading-none">{activeChannel.type === 'DM' ? getDMName(activeChannel) : activeChannel.name}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {activeChannel.type === 'PUBLIC' ? 'Public' : activeChannel.type === 'PRIVATE' ? 'Salon Privé' : 'Message Privé'}
              </span>
            </div>
            <button className="p-2 text-slate-400">
              <MoreVertical size={20} />
            </button>
         </div>
         
         {/* Messages Body */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 select-none">
           {loadingMessages ? (
             <div className="flex justify-center items-center h-full">
               <Loader2 className="animate-spin text-brand-500" size={32} />
             </div>
           ) : (
             <>
               <div className="text-center py-4 opacity-50">
                 <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                   Début de la discussion sécurisée
                 </span>
               </div>
               
               {messages.map((msg) => {
                 const isMe = msg.userId === currentUser.id;
                 const isAdmin = msg.userRole === 'ADMIN';

                 return (
                   <div 
                     key={msg.id} 
                     ref={el => messageRefs.current[msg.id] = el}
                     className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}
                     onClick={() => setContextMenuMessage(msg)}
                   >
                     <div className={`flex max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                       {/* Avatar */}
                       <div className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black text-white border-2 border-white shadow-sm mx-2 self-end mb-4
                         ${msg.userRole === 'ADMIN' ? 'bg-purple-600' : 
                           msg.userRole === 'SECURITY' ? 'bg-red-600' : 
                           isMe ? 'bg-brand-500' : 'bg-slate-400'}`}
                       >
                         {isAdmin ? <Shield size={12} /> : (msg.userName ? msg.userName.charAt(0) : '?')}
                       </div>

                       {/* Bubble */}
                       <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                         <div 
                           className={`px-4 py-3 rounded-2xl shadow-sm text-sm font-medium leading-relaxed border relative transition-all active:scale-[0.98]
                           ${isMe 
                             ? 'bg-brand-600 text-white rounded-tr-none border-brand-700' 
                             : isAdmin 
                               ? 'bg-purple-50 text-purple-900 rounded-tl-none border-purple-200'
                               : 'bg-white text-slate-800 rounded-tl-none border-slate-200'
                           } ${msg.status === 'sending' ? 'opacity-70' : ''}`}
                         >
                           {/* Quote */}
                           {msg.replyToId && (
                             <div 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 if(msg.replyToId) scrollToMessage(msg.replyToId);
                               }}
                               className={`mb-2 p-2 rounded-lg border-l-4 text-xs cursor-pointer ${isMe ? 'bg-brand-700 border-brand-300 text-brand-100' : 'bg-slate-100 border-brand-500 text-slate-600'}`}
                             >
                                <p className="font-bold opacity-80 mb-0.5">{msg.replyToName}</p>
                                <p className="line-clamp-1">{msg.replyToContent}</p>
                             </div>
                           )}

                           {!isMe && (
                             <p className={`text-[10px] font-black uppercase mb-1 ${isAdmin ? 'text-purple-600' : 'text-slate-400'}`}>
                               {msg.userName} {isAdmin && '• ADMIN'}
                             </p>
                           )}
                           
                           {msg.content}
                         </div>

                         {/* Metadata */}
                         <div className="flex items-center mt-1 px-1 space-x-1">
                           <span className="text-[10px] font-bold text-slate-400">
                             {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </span>
                           {isMe && <span className="ml-1">{renderStatusIcon(msg)}</span>}
                         </div>
                       </div>
                     </div>
                   </div>
                 );
               })}
               <div ref={messagesEndRef} />
             </>
           )}
         </div>

         {/* Footer Input */}
         {activeChannel.status === 'REJECTED' ? (
           <div className="p-4 bg-slate-100 border-t-2 border-slate-200 text-center text-slate-500 font-bold text-sm">
             Cette conversation a été clôturée.
           </div>
         ) : activeChannel.type === 'DM' && activeChannel.status === 'PENDING' && activeChannel.initiatorId !== currentUser.id ? (
           <div className="p-4 bg-white border-t-4 border-slate-200 shadow-xl z-20">
             <p className="text-center text-slate-800 font-bold mb-4 text-sm">
               {getDMName(activeChannel)} souhaite discuter avec vous.
             </p>
             <div className="flex gap-3">
                <Button onClick={handleRejectDM} variant="danger" fullWidth className="py-4">
                   <X className="mr-2" /> REFUSER
                </Button>
                <Button onClick={handleAcceptDM} variant="primary" fullWidth className="bg-green-600 border-green-800 py-4">
                   <Check className="mr-2" /> ACCEPTER
                </Button>
             </div>
           </div>
         ) : (
           <div className="bg-white border-t-2 border-slate-200 pb-safe">
             {replyingTo && (
               <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-b border-slate-200 animate-pop">
                 <div className="flex-1 border-l-4 border-brand-500 pl-3">
                   <p className="text-[10px] font-black text-brand-600 uppercase">Réponse à {replyingTo.userName}</p>
                   <p className="text-xs text-slate-600 line-clamp-1">{replyingTo.content}</p>
                 </div>
                 <button onClick={() => setReplyingTo(null)} className="p-2 text-slate-400 hover:text-slate-600">
                   <X size={16} />
                 </button>
               </div>
             )}
             
             <form onSubmit={handleSendMessage} className="p-3 flex items-end gap-2">
               <textarea
                 id="chat-input"
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                    }
                 }}
                 placeholder="Écrire un message..."
                 className="flex-1 bg-slate-100 text-slate-900 placeholder-slate-500 border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-colors resize-none max-h-32 min-h-[48px]"
                 rows={1}
                 style={{ minHeight: '48px' }}
               />
               <button 
                 type="submit"
                 disabled={!newMessage.trim()}
                 className="bg-brand-600 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 active:scale-95 transition-all shadow-game-btn border-b-4 border-brand-800 active:border-b-0 shrink-0 h-12 w-12 flex items-center justify-center"
               >
                 <Send size={20} strokeWidth={2.5} />
               </button>
             </form>
           </div>
         )}
         
         {/* Context Menu */}
         {contextMenuMessage && (
            <div 
              className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-sm flex flex-col justify-end"
              onClick={() => setContextMenuMessage(null)}
            >
              <div 
                className="bg-white rounded-t-3xl p-6 animate-pop shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                 <div className="space-y-2">
                    <button onClick={() => {setReplyingTo(contextMenuMessage); setContextMenuMessage(null);}} className="w-full flex items-center p-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-800 active:bg-slate-50">
                       <Reply size={20} className="mr-3 text-brand-600" /> Répondre
                    </button>
                    <button onClick={() => {navigator.clipboard.writeText(contextMenuMessage.content); setContextMenuMessage(null);}} className="w-full flex items-center p-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-800 active:bg-slate-50">
                       <Copy size={20} className="mr-3 text-slate-600" /> Copier
                    </button>
                 </div>
              </div>
            </div>
         )}
      </div>
    );
  }

  // Channel List View...
  const publicChannels = channels.filter(c => c.type === 'PUBLIC');
  const privateChannels = channels.filter(c => c.type === 'PRIVATE');
  const dmChannels = channels.filter(c => c.type === 'DM' && c.status !== 'REJECTED');

  return (
    <div className="overflow-y-auto pb-24 animate-pop px-1">
      <div className="mb-4">
        <Button onClick={() => setShowCreateSalon(true)} variant="primary" fullWidth className="shadow-lg">
          <Plus size={20} className="mr-2" /> CRÉER UN SALON
        </Button>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Place Publique</h3>
        {publicChannels.map(channel => (
          <button key={channel.id} onClick={() => handleJoinChannel(channel)} className="w-full text-left mb-3">
            <Card className="p-4 flex items-center border-l-8 border-l-brand-400 hover:bg-slate-50 transition-colors">
               <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center mr-4 shrink-0">
                 <Hash size={24} />
               </div>
               <div>
                 <h3 className="font-black text-slate-900 text-lg">{channel.name}</h3>
                 <p className="text-xs text-slate-500 font-bold line-clamp-1">{channel.description}</p>
               </div>
            </Card>
          </button>
        ))}
      </div>

      {privateChannels.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Salons Privés</h3>
          {privateChannels.map(channel => (
            <button key={channel.id} onClick={() => handleJoinChannel(channel)} className="w-full text-left mb-3">
              <Card className="p-4 flex items-center border-l-8 border-l-purple-500 hover:bg-slate-50 transition-colors">
                 <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mr-4 shrink-0 relative">
                   <Lock size={20} />
                   {!channel.isLocked && <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white" title="Déverrouillé"></div>}
                 </div>
                 <div>
                   <h3 className="font-black text-slate-900 text-lg">{channel.name}</h3>
                   <p className="text-xs text-slate-500 font-bold line-clamp-1">Membre • Accès autorisé</p>
                 </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      {dmChannels.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Ma Messagerie</h3>
          {dmChannels.map(channel => {
            const isInitiator = channel.initiatorId === currentUser.id;
            const isPending = channel.status === 'PENDING';
            return (
              <button key={channel.id} onClick={() => handleJoinChannel(channel)} className="w-full text-left mb-3">
                <Card className={`p-4 flex items-center border-l-8 hover:bg-slate-50 transition-colors ${isPending ? 'border-l-yellow-400 bg-yellow-50/50' : 'border-l-green-500'}`}>
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0 ${isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                     <UserIcon size={20} />
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-center">
                       <h3 className="font-black text-slate-900 text-lg">{getDMName(channel)}</h3>
                       {isPending && !isInitiator && <Badge color="yellow">Demande</Badge>}
                       {isPending && isInitiator && <span className="text-[10px] font-bold text-slate-400 uppercase">En attente</span>}
                     </div>
                     <p className="text-xs text-slate-500 font-bold">
                       {isPending ? (isInitiator ? "Invitation envoyée" : "Souhaite discuter") : "Conversation privée"}
                     </p>
                   </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {/* MODALS (CREATE, PWD) remain unchanged but use new ChatService logic inside handlers above */}
      {showCreateSalon && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowCreateSalon(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl animate-pop border-4 border-slate-200">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">Créer un Salon</h3>
                <button onClick={() => setShowCreateSalon(false)} className="p-1 bg-slate-100 rounded-full"><X size={20}/></button>
             </div>
             
             <div className="space-y-4 mb-6">
               <div>
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Nom du Salon</label>
                 <input 
                    type="text" 
                    className="w-full font-bold bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-brand-500 focus:bg-white outline-none"
                    placeholder="Ex: Club de lecture"
                    value={newSalonName}
                    onChange={(e) => setNewSalonName(e.target.value)}
                 />
               </div>

               <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                 <button 
                   onClick={() => setIsPrivate(!isPrivate)}
                   className={`w-12 h-7 rounded-full transition-colors relative ${isPrivate ? 'bg-purple-600' : 'bg-slate-300'}`}
                 >
                   <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isPrivate ? 'left-6' : 'left-1'}`}></div>
                 </button>
                 <span className="font-bold text-slate-700 text-sm">Salon Privé (Mot de passe)</span>
               </div>

               {isPrivate && (
                 <div className="animate-pop">
                    <label className="text-xs font-black text-purple-600 uppercase tracking-widest mb-1 block flex items-center"><KeyRound size={12} className="mr-1"/> Mot de passe</label>
                    <input 
                        type="text" 
                        className="w-full font-bold bg-purple-50 border-2 border-purple-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:bg-white outline-none text-purple-900"
                        placeholder="Définir un code"
                        value={newSalonPass}
                        onChange={(e) => setNewSalonPass(e.target.value)}
                    />
                 </div>
               )}
             </div>

             <Button onClick={handleCreateSalon} fullWidth variant="primary" disabled={!newSalonName} loading={creatingSalon}>
               Créer le Salon
             </Button>
          </div>
        </div>
      )}

      {passwordPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setPasswordPrompt(null)}></div>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl animate-pop border-4 border-slate-200">
             <div className="flex justify-center mb-4 text-purple-600">
               <div className="p-4 bg-purple-100 rounded-full"><KeyRound size={48} /></div>
             </div>
             <h3 className="text-xl font-black text-center text-slate-900 mb-2">Salon Privé</h3>
             <p className="text-center text-slate-500 text-sm mb-6 font-medium">Un code d'accès est requis pour entrer.</p>
             <input 
               type="password" 
               className="w-full text-center text-2xl font-black tracking-widest bg-slate-100 border-2 border-slate-300 rounded-xl py-3 mb-6 focus:border-purple-500 focus:outline-none"
               placeholder="CODE"
               value={inputPassword}
               onChange={(e) => setInputPassword(e.target.value)}
             />
             <div className="flex space-x-3">
               <Button onClick={() => setPasswordPrompt(null)} variant="ghost" className="flex-1">Annuler</Button>
               <Button onClick={handleConfirmPassword} variant="primary" className="flex-1 bg-purple-600 border-purple-800" loading={joiningChannel}>Entrer</Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
