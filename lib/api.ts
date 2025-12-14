import { supabase, isSupabaseConfigured } from './supabase';
import { User, UserRole, Community, Transaction, Alert, Classified, Article, Message, Channel } from '../types';

/**
 * SERVICE LAYER (Couche Métier)
 * Rigueur : Pas de données fictives en cas d'échec.
 */

// Gestion centralisée des erreurs API
const handleAuthError = (error: any) => {
  console.error("API Error Detail:", error);
  
  if (!isSupabaseConfigured()) {
    throw new Error("Configuration Manquante : L'application n'est pas connectée au Backend.");
  }

  const msg = (error.message || error.error_description || JSON.stringify(error)).toLowerCase();

  if (msg.includes("failed to fetch")) return new Error("Impossible de joindre le serveur. Vérifiez votre connexion.");
  if (msg.includes("invalid login credentials")) return new Error("Email ou mot de passe incorrect.");
  if (msg.includes("user already registered")) return new Error("Cet utilisateur existe déjà.");
  if (msg.includes("violates unique constraint")) return new Error("Conflit de données (Email/Tél déjà utilisé).");
  if (msg.includes("password should be at least 6 characters")) return new Error("Le mot de passe doit contenir au moins 6 caractères.");
  
  return new Error(error.message || "Une erreur système est survenue.");
};

// Mapper Strict DB -> Frontend
const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  email: profile.email,
  communityId: profile.community_id,
  name: profile.name,
  phone: profile.phone,
  role: profile.role as UserRole,
  balanceStatus: profile.balance_status || 'OK',
  familyId: profile.family_id,
  isHeadOfFamily: profile.is_head_of_family,
  birthDate: profile.birth_date,
  status: profile.status || 'VALIDATED',
  avatar: profile.avatar
});

export const AuthService = {
  async login(email: string, password: string): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw handleAuthError(authError);
    if (!authData.user) throw new Error("Erreur d'intégrité : Session utilisateur invalide.");

    return this.getUserProfile(authData.user.id);
  },

  async getUserProfile(userId: string): Promise<User> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw handleAuthError(error);
    if (!profile) throw new Error("Profil introuvable. Contactez le support.");

    return mapProfileToUser(profile);
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw handleAuthError(error);
  },

  async registerUser(params: {
    email: string;
    password: string;
    fullName: string;
    communityId: string;
    phone: string;
    dob: string;
    familyId: string;
    isHead: boolean;
  }): Promise<User> {
    // 1. Inscription Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: { data: { full_name: params.fullName } }
    });

    if (authError) throw handleAuthError(authError);
    if (!authData.user) throw new Error("Échec de la création du compte technique.");

    // 2. Création Profil Métier (Upsert pour gérer la concurrence)
    const profilePayload = {
      id: authData.user.id,
      email: params.email,
      name: params.fullName,
      community_id: params.communityId,
      phone: params.phone,
      family_id: params.familyId,
      is_head_of_family: params.isHead,
      birth_date: params.dob,
      role: 'RESIDENT',
      status: 'VALIDATED',
      balance_status: 'OK'
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
      console.error("Erreur Profil:", profileError);
      // On ne lève pas d'erreur ici si c'est juste un duplicata géré par le trigger,
      // mais on loggue proprement.
      if (!profileError.message.includes('duplicate key')) {
         throw handleAuthError(profileError);
      }
    }

    return mapProfileToUser(profilePayload);
  },

  async verifyFamilyCode(code: string): Promise<{ headName: string; communityId: string }> {
    // RIGUEUR : Suppression du bloc try/catch qui renvoyait des données mockées.
    // Si la requête échoue, elle doit échouer explicitement pour l'utilisateur.
    const { data, error } = await supabase
      .from('profiles')
      .select('name, community_id')
      .eq('family_id', code)
      .eq('is_head_of_family', true)
      .single();

    if (error) throw new Error("Code famille invalide ou erreur serveur.");
    if (!data) throw new Error("Aucun foyer trouvé avec ce code.");

    return { headName: data.name, communityId: data.community_id };
  }
};

export const FeatureService = {
  // FINANCES
  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const { id, ...payload } = transaction as any;
    const { data, error } = await supabase.from('transactions').insert(payload).select().single();
    if (error) throw error;
    return { ...transaction, id: data.id, date: data.date } as Transaction;
  },

  // SÉCURITÉ
  async createAlert(alert: Partial<Alert>): Promise<Alert> {
    const { id, ...payload } = alert as any;
    const { data, error } = await supabase.from('alerts').insert(payload).select().single();
    if (error) throw error;
    return { ...alert, id: data.id } as Alert;
  },

  // ANNONCES
  async createClassified(ad: Partial<Classified>): Promise<Classified> {
    const { id, ...payload } = ad as any;
    const { data, error } = await supabase.from('classifieds').insert(payload).select().single();
    if (error) throw error;
    return { ...ad, id: data.id } as Classified;
  },

  // ARTICLES
  async createArticle(article: Partial<Article>): Promise<Article> {
    const { id, ...payload } = article as any;
    const { data, error } = await supabase.from('articles').insert(payload).select().single();
    if (error) throw error;
    return { ...article, id: data.id } as Article;
  },

  async updateArticle(articleId: string, updates: Partial<Article>): Promise<Article> {
    const cleanUpdates = JSON.parse(JSON.stringify(updates));
    const { data, error } = await supabase.from('articles').update(cleanUpdates).eq('id', articleId).select().single();
    if (error) throw error;
    return { ...updates, id: articleId } as Article;
  },

  async deleteArticle(articleId: string): Promise<void> {
    const { error } = await supabase.from('articles').delete().eq('id', articleId);
    if (error) throw error;
  },

  // GOUVERNANCE
  async voteProposal(proposalId: string, userId: string, voteType: 'FOR' | 'AGAINST' | 'ABSTAIN'): Promise<void> {
    const { error } = await supabase.from('votes').upsert(
      { proposal_id: proposalId, user_id: userId, vote_type: voteType },
      { onConflict: 'proposal_id,user_id' }
    );
    if (error) throw error;
  },

  async getUserVotes(userId: string): Promise<Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'>> {
     const { data, error } = await supabase.from('votes').select('proposal_id, vote_type').eq('user_id', userId);
     if(error) return {};
     const votes: Record<string, any> = {};
     data?.forEach((v: any) => { votes[v.proposal_id] = v.vote_type; });
     return votes;
  },

  // TRAVAUX
  async applyToJob(jobId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('job_applications').insert({ job_id: jobId, user_id: userId });
    if (error) {
       if (error.code === '23505') throw new Error("Déjà postulé.");
       throw error;
    }
  },

  async getUserApplications(userId: string): Promise<string[]> {
     const { data, error } = await supabase.from('job_applications').select('job_id').eq('user_id', userId);
     if(error) return [];
     return data?.map((d: any) => d.job_id) || [];
  }
};

export const ChatService = {
  async getMessages(channelId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true }); 

    if (error) throw error;

    return data.map((m: any) => ({
      id: m.id,
      channelId: m.channel_id,
      userId: m.user_id,
      userName: m.user_name,
      userRole: m.user_role as UserRole,
      content: m.content,
      timestamp: m.created_at,
      status: 'read',
      replyToId: m.reply_to_id,
      replyToName: m.reply_to_name,
      replyToContent: m.reply_to_content
    }));
  },

  async sendMessage(message: Partial<Message>): Promise<Message> {
    const dbPayload = {
      channel_id: message.channelId,
      user_id: message.userId,
      user_name: message.userName,
      user_role: message.userRole,
      content: message.content,
      reply_to_id: message.replyToId,
      reply_to_name: message.replyToName,
      reply_to_content: message.replyToContent,
      created_at: message.timestamp || new Date().toISOString()
    };

    const { data, error } = await supabase.from('messages').insert(dbPayload).select().single();
    if (error) throw error;

    return { ...message, id: data.id, timestamp: data.created_at, status: 'sent' } as Message;
  },

  async createChannel(channel: Partial<Channel>): Promise<Channel> {
    const dbPayload = {
      community_id: channel.communityId,
      name: channel.name,
      type: channel.type,
      description: channel.description,
      creator_id: channel.creatorId,
      members: channel.members,
      is_locked: channel.isLocked,
      status: channel.status,
      initiator_id: channel.initiatorId
    };

    const { data, error } = await supabase.from('channels').insert(dbPayload).select().single();
    if (error) throw error;

    return { ...channel, id: data.id } as Channel;
  }
};

export const AdminService = {
  async updateUserRole(adminUserId: string, targetUserId: string, newRole: string): Promise<void> {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', targetUserId);
    if (error) throw error;
  },
  
  async updateUserStatus(targetUserId: string, newStatus: string): Promise<void> {
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', targetUserId);
    if (error) throw error;
  },

  async moveUserCommunity(targetUserId: string, newCommunityId: string): Promise<void> {
    const { error } = await supabase.from('profiles').update({ community_id: newCommunityId }).eq('id', targetUserId);
    if (error) throw error;
  }
};

export const UserService = {
  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
  }
};