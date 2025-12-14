
export type UserRole = 'GOD' | 'RESIDENT' | 'ADMIN' | 'WORKER' | 'SECURITY';

export interface Community {
  id: string;
  name: string;
  city: string;
  themeColor: string;
  coverImage?: string;
  isActive: boolean; // Pour que l'ODD puisse désactiver un quartier
}

export interface User {
  id: string;
  email: string; // Clé de connexion
  communityId: string;
  name: string;
  phone: string;
  role: UserRole;
  balanceStatus: 'OK' | 'LATE';
  avatar?: string;
  
  // Logique Familiale
  familyId: string; // ID unique du foyer
  isHeadOfFamily: boolean; // Est-ce le chef de famille ?
  birthDate: string; // YYYY-MM-DD pour calcul âge
  
  status?: 'PENDING' | 'VALIDATED' | 'BANNED';
}

// ... (Le reste des types reste inchangé : Campaign, Transaction, etc.)
export interface Campaign {
  id: string;
  communityId: string;
  title: string;
  targetAmount: number;
  collectedAmount: number;
  deadline: string;
  description: string;
}

export interface Transaction {
  id: string;
  communityId: string;
  date: string;
  label: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  proofUrl?: string;
}

export interface Proposal {
  id: string;
  communityId: string;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  status: 'OPEN' | 'CLOSED';
  myVote?: 'FOR' | 'AGAINST' | 'ABSTAIN';
}

export interface Job {
  id: string;
  communityId: string;
  title: string;
  date: string;
  pay: number;
  spots: number;
  spotsFilled: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID';
  imageBefore?: string;
  imageAfter?: string;
}

export interface Alert {
  id: string;
  communityId: string;
  type: 'SOS' | 'REPORT';
  user: string;
  time: string;
  location: string;
  message?: string;
}

export type ChannelType = 'PUBLIC' | 'PRIVATE' | 'DM';

export interface Channel {
  id: string;
  communityId: string;
  name: string;
  type: ChannelType;
  description?: string;
  // SECURITY UPDATE: Password field removed from client-side type.
  members?: string[]; 
  creatorId?: string;
  isLocked?: boolean; 
  status?: 'ACTIVE' | 'PENDING' | 'REJECTED'; 
  initiatorId?: string; 
}

export interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean; 
}

export interface Message {
  id: string;
  channelId: string; 
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  timestamp: string; 
  status?: 'sending' | 'sent' | 'received' | 'read' | 'error';
  replyToId?: string; 
  replyToName?: string; 
  replyToContent?: string; 
  reactions?: Reaction[];
}

export type BlockType = 'paragraph' | 'heading';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
}

export interface Article {
  id: string;
  communityId: string;
  title: string;
  category: string;
  image: string; 
  date: string; // Texte affiché (ex: "Aujourd'hui")
  scheduledAt?: string; // ISO String pour programmation
  author: string;
  blocks: ContentBlock[];
  published: boolean;
}

export type ClassifiedType = 'SELL' | 'BUY' | 'GIVE' | 'SERVICE';

export interface Classified {
  id: string;
  communityId: string;
  userId: string;
  userName: string;
  type: ClassifiedType;
  title: string;
  price?: number;
  description: string;
  image?: string;
  date: string;
}