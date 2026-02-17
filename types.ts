export enum QuestType {
  SWAP = 'SWAP',
  MINT = 'MINT',
  HOLD = 'HOLD',
  SOCIAL = 'SOCIAL',
  GAME = 'GAME',
  BRIDGE = 'BRIDGE',
  LIQUIDITY = 'LIQUIDITY',
  REFERRAL = 'REFERRAL',
  VOTE = 'VOTE',
  TRANSFER = 'TRANSFER'
}

export enum QuestStatus {
  LOCKED = 'LOCKED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CLAIMED = 'CLAIMED',
}

export interface Reward {
  type: 'POINTS' | 'NFT' | 'TOKEN' | 'MYSTERY';
  value: string | number;
  label: string;
}

export interface QuestChain {
  current: number;
  total: number;
  nextQuestId?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  rewards: Reward[];
  expiryTime: number; // Timestamp
  imageUrl?: string;
  partnerLogo?: string;
  isSponsored?: boolean;
  actionLabel: string;
  popularity?: number; // 0-100 score for trending
  isNew?: boolean;
  
  // New Power Features
  isPremium?: boolean; // VIP/Pro users
  isMystery?: boolean; // Hides rewards until claimed
  chain?: QuestChain; // For multi-step quests
  rarity?: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';
}

export interface NotificationPreferences {
  questType: {
    [key in QuestType]?: boolean;
  };
  expiry: boolean;
  friendActivity: boolean;
  streakMilestone: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'QUEST' | 'FRIEND' | 'STREAK' | 'SYSTEM';
}

export interface User {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  address: string | null;
  points: number;
  streak: number;
  rank: number;
  completedQuests: string[];
  preferences: NotificationPreferences;
  notifications: AppNotification[];
  isPremium?: boolean;
}

export interface LeaderboardEntry {
  fid: number;
  username: string;
  pfpUrl: string;
  points: number;
  rank: number;
  isFriend: boolean;
}