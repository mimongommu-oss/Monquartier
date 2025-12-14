
import { User, Campaign, Transaction, Proposal, Job, Alert, Message, Channel, Community, Article, Classified } from './types';

// COMMUNITIES
export const MOCK_COMMUNITIES: Community[] = [
  { id: 'c_fleurs', name: 'Quartier des Fleurs', city: 'Abidjan', themeColor: '#3b82f6', coverImage: 'https://picsum.photos/800/400?random=10', isActive: true },
  { id: 'c_palmiers', name: 'Résidence Palmiers', city: 'Bouaké', themeColor: '#16a34a', coverImage: 'https://picsum.photos/800/400?random=11', isActive: true }
];

// USERS
export const MOCK_USERS: User[] = [
  // SUPER ADMIN (ODD)
  { 
    id: 'god_1', 
    email: 'zeus@monquartier.ci',
    communityId: 'global', 
    name: 'ZEUS (ODD)', 
    phone: '+00 00000000', 
    role: 'GOD', 
    balanceStatus: 'OK', 
    familyId: 'Olympe', 
    isHeadOfFamily: true,
    birthDate: '1980-01-01',
    status: 'VALIDATED' 
  },

  // Quartier des Fleurs - Famille Kouassi
  { 
    id: '1', 
    email: 'jean@fleurs.ci',
    communityId: 'c_fleurs', 
    name: 'Jean Kouassi', 
    phone: '+225 07070707', 
    role: 'RESIDENT', 
    balanceStatus: 'OK', 
    familyId: 'Famille Kouassi',
    isHeadOfFamily: true,
    birthDate: '1985-05-12',
    status: 'VALIDATED' 
  },
  { 
    id: '1_wife', 
    email: 'marie@fleurs.ci',
    communityId: 'c_fleurs', 
    name: 'Marie Kouassi', 
    phone: '+225 07070708', 
    role: 'RESIDENT', 
    balanceStatus: 'OK', 
    familyId: 'Famille Kouassi',
    isHeadOfFamily: false,
    birthDate: '1987-08-22',
    status: 'VALIDATED' 
  },
  { 
    id: '1_child', 
    email: '',
    communityId: 'c_fleurs', 
    name: 'Junior Kouassi', 
    phone: '', 
    role: 'RESIDENT', 
    balanceStatus: 'OK', 
    familyId: 'Famille Kouassi',
    isHeadOfFamily: false,
    birthDate: '2015-02-10', // Mineur
    status: 'VALIDATED' 
  },

  // Admin Fleurs
  { 
    id: '2', 
    email: 'admin@fleurs.ci',
    communityId: 'c_fleurs', 
    name: 'Admin Fleurs', 
    phone: '+225 05050505', 
    role: 'ADMIN', 
    balanceStatus: 'OK', 
    familyId: 'Bureau',
    isHeadOfFamily: true,
    birthDate: '1975-03-15',
    status: 'VALIDATED' 
  },

  // Résidence Palmiers
  { 
    id: '10', 
    email: 'awa@palmiers.ci',
    communityId: 'c_palmiers', 
    name: 'Awa Diop', 
    phone: '+225 02020202', 
    role: 'ADMIN', 
    balanceStatus: 'OK', 
    familyId: 'Famille Diop',
    isHeadOfFamily: true,
    birthDate: '1990-12-01',
    status: 'VALIDATED' 
  },
];

// ... (Rest of constants remain mostly same, just ensuring communityId linking is correct)
export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    communityId: 'c_fleurs',
    title: 'Campagne Désherbage Mars',
    targetAmount: 500000,
    collectedAmount: 350000,
    deadline: '2023-03-31',
    description: 'Cotisation pour le nettoyage des zones communes et le terrain de sport.'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', communityId: 'c_fleurs', date: '2023-03-12', label: 'Achat 5 râteaux', amount: 15000, type: 'EXPENSE', proofUrl: '#' },
  { id: 't2', communityId: 'c_fleurs', date: '2023-03-11', label: 'Cotisation Famille Diallo', amount: 5000, type: 'INCOME' },
];

export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'p1',
    communityId: 'c_fleurs',
    title: 'Installation caméras entrée Nord',
    description: 'Installation de 2 caméras solaires pour surveiller le carrefour principal. Budget estimé : 200.000 FCFA.',
    votesFor: 45,
    votesAgainst: 12,
    votesAbstain: 5,
    status: 'OPEN'
  }
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    communityId: 'c_fleurs',
    title: 'Désherbage Terrain B',
    date: 'Samedi 18 Mars - 08h00',
    pay: 5000,
    spots: 5,
    spotsFilled: 3,
    status: 'OPEN'
  }
];

export const MOCK_ALERTS: Alert[] = [
  { id: 'a1', communityId: 'c_fleurs', type: 'REPORT', user: 'Anonyme', time: '14:30', location: 'Rue des palmiers', message: 'Véhicule suspect stationné depuis 2 jours.' }
];

export const MOCK_CHANNELS: Channel[] = [
  { id: 'general', communityId: 'c_fleurs', name: 'Place Publique', type: 'PUBLIC', description: 'Le canal officiel du quartier.', status: 'ACTIVE' },
  { id: 'dm_1_2', communityId: 'c_fleurs', name: 'Jean & Admin', type: 'DM', members: ['1', '2'], status: 'ACTIVE', initiatorId: '1' }
];

export const MOCK_MESSAGES: Message[] = [
  { 
    id: 'm1', 
    channelId: 'general', 
    userId: '2', 
    userName: 'Admin Fleurs', 
    userRole: 'ADMIN', 
    content: '⚠️ Rappel : La réunion mensuelle est ce Samedi à 16h.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), 
    status: 'read',
    reactions: [{ emoji: '👍', count: 5, userReacted: true }]
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    communityId: 'c_fleurs',
    title: "Coupure d'eau : Travaux SODECI",
    category: 'URGENT',
    image: 'https://picsum.photos/600/800?random=1',
    date: 'Aujourd\'hui, 08:00',
    author: 'Admin Bureau',
    published: true,
    blocks: [
      { id: 'b1', type: 'paragraph', content: "Une coupure d'eau est prévue ce Jeudi de 8h à 18h pour des travaux de maintenance majeurs sur le réseau principal." },
      { id: 'b2', type: 'paragraph', content: "La SODECI nous informe qu'une équipe technique interviendra au niveau du carrefour principal pour réparer la fuite signalée la semaine dernière." },
      { id: 'b3', type: 'heading', content: "Consignes :" },
      { id: 'b4', type: 'paragraph', content: "• Faites des réserves d'eau dès maintenant.\n• Évitez d'utiliser les machines à laver pendant la période." }
    ]
  }
];

export const MOCK_CLASSIFIEDS: Classified[] = [
  {
    id: 'cl1',
    communityId: 'c_fleurs',
    userId: '1',
    userName: 'Jean Kouassi',
    type: 'SELL',
    title: 'Vélo enfant 12 pouces',
    price: 15000,
    description: 'Vélo rouge en bon état, idéal pour enfant de 3 à 5 ans. Pneus neufs.',
    image: 'https://picsum.photos/400/300?random=20',
    date: 'Hier, 14:00'
  },
  {
    id: 'cl2',
    communityId: 'c_fleurs',
    userId: '5',
    userName: 'Marie Kouassi',
    type: 'GIVE',
    title: 'Livres scolaires CE2',
    description: 'Je donne les anciens manuels scolaires de mon fils. Maths et Français.',
    date: 'Aujourd\'hui, 09:30'
  },
  {
    id: 'cl3',
    communityId: 'c_fleurs',
    userId: '3',
    userName: 'Moussa Traoré',
    type: 'SERVICE',
    title: 'Plombier disponible',
    price: 5000,
    description: 'Réparation fuites, installation robinets. Disponible le weekend.',
    date: 'Il y a 2 jours'
  }
];

export const GLOBAL_BALANCE = 1500000;
