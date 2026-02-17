import { Quest, QuestStatus, QuestType, LeaderboardEntry, User } from './types';

export const MOCK_USER: User = {
  fid: 1234,
  username: 'baserunner',
  displayName: 'Base Runner',
  pfpUrl: 'https://picsum.photos/200/200',
  address: '0x71C...9A23',
  points: 1250,
  streak: 5,
  rank: 420,
  completedQuests: [],
  isPremium: false,
  preferences: {
    questType: {
      SWAP: true,
      MINT: true,
      HOLD: false,
      SOCIAL: true,
      GAME: true,
      BRIDGE: true,
      LIQUIDITY: true,
      REFERRAL: true,
      VOTE: true,
      TRANSFER: true
    },
    expiry: true,
    friendActivity: true,
    streakMilestone: true
  },
  notifications: [
    {
      id: 'n1',
      title: 'Streak Warning',
      message: 'Your 5-day streak is at risk! Complete a quest in 2 hours.',
      timestamp: Date.now() - 3600000,
      read: false,
      type: 'STREAK'
    },
    {
      id: 'n2',
      title: 'New Mystery Quest',
      message: 'A Legendary Mystery Box has appeared for 24h.',
      timestamp: Date.now() - 100000,
      read: false,
      type: 'QUEST'
    }
  ]
};

export const MOCK_QUESTS: Quest[] = [
  // --- Onchain Action Quests ---
  {
    id: 'q_action_1',
    title: 'First Swap',
    description: 'Complete your first swap of at least $3 value on Base.',
    type: QuestType.SWAP,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 50, label: '50 XP' }, { type: 'NFT', value: 1, label: 'Noob Badge' }],
    expiryTime: Date.now() + 86400000,
    actionLabel: 'Swap Now',
    imageUrl: 'https://picsum.photos/400/200?random=1',
    popularity: 98,
    rarity: 'COMMON'
  },
  {
    id: 'q_action_2',
    title: 'Stable Anchor',
    description: 'Swap any token into USDC to secure your gains.',
    type: QuestType.SWAP,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 30, label: '30 XP' }],
    expiryTime: Date.now() + 86400000 * 2,
    actionLabel: 'Swap USDC',
    rarity: 'COMMON'
  },
  {
    id: 'q_action_3',
    title: 'Token Explorer',
    description: 'Acquire at least 1 unit of a featured trending token.',
    type: QuestType.SWAP,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 40, label: '40 XP' }],
    expiryTime: Date.now() + 43200000,
    actionLabel: 'Discover',
    imageUrl: 'https://picsum.photos/400/200?random=3',
    rarity: 'UNCOMMON'
  },
  {
    id: 'q_action_4',
    title: 'Micro Trader',
    description: 'Complete 3 separate swaps within 24 hours.',
    type: QuestType.SWAP,
    status: QuestStatus.LOCKED,
    rewards: [{ type: 'POINTS', value: 80, label: '80 XP' }],
    expiryTime: Date.now() + 86400000,
    actionLabel: 'Trade',
    rarity: 'UNCOMMON'
  },
  {
    id: 'q_action_5',
    title: 'Gas Saver',
    description: 'Execute a swap with gas fees under $0.05.',
    type: QuestType.SWAP,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 25, label: '25 XP' }],
    expiryTime: Date.now() + 100000000,
    actionLabel: 'Optimize',
    rarity: 'COMMON'
  },

  // --- DeFi Depth Quests ---
  {
    id: 'q_defi_1',
    title: 'Diamond Hands',
    description: 'Buy any token and hold it for 24 hours without selling.',
    type: QuestType.HOLD,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 60, label: '60 XP' }],
    expiryTime: Date.now() + 86400000 * 3,
    actionLabel: 'Check Holdings',
    popularity: 70,
    rarity: 'UNCOMMON'
  },
  {
    id: 'q_defi_2',
    title: 'Liquidity Provider',
    description: 'Add liquidity to any pool on Aerodrome or Uniswap.',
    type: QuestType.LIQUIDITY,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 120, label: '120 XP' }, { type: 'NFT', value: 1, label: 'LP NFT' }],
    expiryTime: Date.now() + 86400000 * 7,
    actionLabel: 'Add Liquidity',
    imageUrl: 'https://picsum.photos/400/200?random=4',
    rarity: 'RARE'
  },
  {
    id: 'q_defi_3',
    title: 'Base Bridge',
    description: 'Bridge ETH or USDC from Mainnet to Base.',
    type: QuestType.BRIDGE,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 70, label: '70 XP' }],
    expiryTime: Date.now() + 999999999,
    actionLabel: 'Bridge',
    rarity: 'COMMON'
  },
  {
    id: 'q_defi_4',
    title: 'DCA Strategy',
    description: 'Swap for the same token 3 days in a row.',
    type: QuestType.SWAP,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 150, label: '150 XP' }, { type: 'NFT', value: 1, label: 'Streak NFT' }],
    expiryTime: Date.now() + 86400000 * 4,
    actionLabel: 'Swap',
    chain: { current: 1, total: 3 },
    rarity: 'RARE'
  },
  {
    id: 'q_defi_5',
    title: 'Portfolio Builder',
    description: 'Hold at least 3 different tokens in your wallet.',
    type: QuestType.HOLD,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 55, label: '55 XP' }],
    expiryTime: Date.now() + 86400000,
    actionLabel: 'Verify',
    rarity: 'COMMON'
  },

  // --- NFT Quests ---
  {
    id: 'q_nft_1',
    title: 'Daily Mint',
    description: 'Mint today\'s "Base Dawn" commemorative NFT.',
    type: QuestType.MINT,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 20, label: '20 XP' }, { type: 'NFT', value: 1, label: 'Dawn NFT' }],
    expiryTime: Date.now() + 43200000,
    actionLabel: 'Mint',
    imageUrl: 'https://picsum.photos/400/200?random=5',
    isNew: true,
    rarity: 'COMMON'
  },
  {
    id: 'q_nft_2',
    title: 'Art Collector',
    description: 'Hold 3 different BaseQuest badges in your wallet.',
    type: QuestType.HOLD,
    status: QuestStatus.LOCKED,
    rewards: [{ type: 'POINTS', value: 90, label: '90 XP' }],
    expiryTime: Date.now() + 86400000 * 5,
    actionLabel: 'Verify',
    rarity: 'RARE'
  },
  {
    id: 'q_nft_3',
    title: 'Partner Showcase',
    description: 'Mint the limited edition Partner NFT.',
    type: QuestType.MINT,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 100, label: '100 Sponsor Pts' }],
    expiryTime: Date.now() + 86400000,
    actionLabel: 'Mint Partner',
    isSponsored: true,
    partnerLogo: 'https://picsum.photos/50/50?random=9',
    rarity: 'UNCOMMON'
  },
  {
    id: 'q_nft_4',
    title: 'Forge Upgrade',
    description: 'Burn 2 Common badges to mint 1 Rare NFT.',
    type: QuestType.MINT,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'NFT', value: 1, label: 'Rare Artifact' }],
    expiryTime: Date.now() + 86400000 * 2,
    actionLabel: 'Burn & Mint',
    rarity: 'LEGENDARY'
  },
  {
    id: 'q_nft_5',
    title: 'First Canvas',
    description: 'Mint your very first NFT on Base.',
    type: QuestType.MINT,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 75, label: '75 XP' }],
    expiryTime: Date.now() + 99999999,
    actionLabel: 'Mint',
    rarity: 'COMMON'
  },

  // --- Social Quests ---
  {
    id: 'q_social_2',
    title: 'Show Off',
    description: 'Share your latest quest completion on Farcaster.',
    type: QuestType.SOCIAL,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 25, label: '25 XP' }],
    expiryTime: Date.now() + 86400000,
    actionLabel: 'Share',
    popularity: 60,
    rarity: 'COMMON'
  },
  {
    id: 'q_social_3',
    title: 'Invite a Friend',
    description: 'Get 1 friend to join using your referral code.',
    type: QuestType.REFERRAL,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 60, label: '60 XP' }],
    expiryTime: Date.now() + 604800000,
    actionLabel: 'Copy Link',
    rarity: 'UNCOMMON'
  },
  {
    id: 'q_social_4',
    title: 'Squad Goals',
    description: 'Have 3 referred users complete a quest.',
    type: QuestType.REFERRAL,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 140, label: '140 XP' }],
    expiryTime: Date.now() + 604800000,
    actionLabel: 'Track Squad',
    rarity: 'RARE'
  },
  {
    id: 'q_vote_1',
    title: 'Civic Duty',
    description: 'Cast a vote in the BaseQuest community proposal.',
    type: QuestType.VOTE,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 35, label: '35 XP' }],
    expiryTime: Date.now() + 86400000 * 2,
    actionLabel: 'Vote',
    rarity: 'COMMON'
  },
  {
    id: 'q_transfer_1',
    title: 'Support Creators',
    description: 'Send a tip (>$1) to a featured creator.',
    type: QuestType.TRANSFER,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 45, label: '45 XP' }],
    expiryTime: Date.now() + 86400000,
    actionLabel: 'Tip',
    rarity: 'COMMON'
  },

  // --- Retention & Gamified Quests ---
  {
    id: 'q_ret_1',
    title: '3-Day Streak',
    description: 'Complete at least one quest for 3 consecutive days.',
    type: QuestType.GAME,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 100, label: '100 XP' }, { type: 'NFT', value: 1, label: 'Streak SBT' }],
    expiryTime: Date.now() + 86400000 * 3,
    actionLabel: 'View Streak',
    chain: { current: 1, total: 3 },
    rarity: 'UNCOMMON'
  },
  {
    id: 'q_ret_2',
    title: '7-Day Warrior',
    description: 'Maintain a 7-day activity streak.',
    type: QuestType.GAME,
    status: QuestStatus.LOCKED,
    rewards: [{ type: 'NFT', value: 1, label: 'Epic NFT' }],
    expiryTime: Date.now() + 86400000 * 7,
    actionLabel: 'Check Streak',
    rarity: 'LEGENDARY'
  },
  {
    id: 'q_ret_3',
    title: 'Comeback Kid',
    description: 'Welcome back! You returned after 48h.',
    type: QuestType.GAME,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 40, label: '40 XP' }],
    expiryTime: Date.now() + 86400000,
    actionLabel: 'Claim',
    rarity: 'COMMON'
  },
  {
    id: 'q_ret_4',
    title: 'Morning Glory',
    description: 'Complete a quest before 10 AM local time.',
    type: QuestType.GAME,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 20, label: '20 XP' }],
    expiryTime: Date.now() + 3600000 * 4,
    actionLabel: 'Wake Up',
    rarity: 'COMMON'
  },
  {
    id: 'q_ret_5',
    title: 'Weekend Warrior',
    description: 'Complete a quest on Saturday or Sunday.',
    type: QuestType.GAME,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 30, label: '30 XP' }],
    expiryTime: Date.now() + 86400000 * 2,
    actionLabel: 'Play',
    rarity: 'COMMON'
  },
  {
    id: 'q_game_2',
    title: 'Daily Spin',
    description: 'Spin the wheel for a chance to win points or items.',
    type: QuestType.GAME,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'MYSTERY', value: 0, label: '???' }],
    expiryTime: Date.now() + 40000000,
    actionLabel: 'Spin',
    imageUrl: 'https://picsum.photos/400/200?random=88',
    isMystery: true,
    rarity: 'UNCOMMON'
  },
  {
    id: 'q_game_mystery_1',
    title: 'Hidden Quest',
    description: 'A mystery quest that reveals its rewards upon completion.',
    type: QuestType.GAME,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'MYSTERY', value: 0, label: '???' }],
    expiryTime: Date.now() + 86400000,
    actionLabel: 'Unlock',
    isMystery: true,
    rarity: 'RARE'
  },
  {
    id: 'q_game_4',
    title: 'Double Points Hour',
    description: 'Complete any quest in the next hour for 2x XP.',
    type: QuestType.GAME,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 0, label: '2x Boost' }],
    expiryTime: Date.now() + 3600000,
    actionLabel: 'Go!',
    popularity: 99,
    rarity: 'RARE'
  },
  {
    id: 'q_game_5',
    title: 'Combo Breaker',
    description: 'Chain: Swap -> Mint -> Share in order.',
    type: QuestType.GAME,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'POINTS', value: 180, label: '180 XP' }, { type: 'NFT', value: 1, label: 'Combo Badge' }],
    expiryTime: Date.now() + 86400000,
    actionLabel: 'Start Chain',
    chain: { current: 0, total: 3 },
    rarity: 'LEGENDARY'
  },
  {
    id: 'q_game_6',
    title: 'Top 50 Climber',
    description: 'Reach the top 50 on the weekly leaderboard.',
    type: QuestType.GAME,
    status: QuestStatus.ACTIVE,
    rewards: [{ type: 'NFT', value: 1, label: 'Rank NFT' }],
    expiryTime: Date.now() + 86400000 * 7,
    actionLabel: 'Check Rank',
    rarity: 'RARE'
  }
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { fid: 1, username: 'dwr.eth', pfpUrl: 'https://picsum.photos/100/100?r=1', points: 9000, rank: 1, isFriend: false },
  { fid: 2, username: 'vbuterin', pfpUrl: 'https://picsum.photos/100/100?r=2', points: 8500, rank: 2, isFriend: false },
  { fid: 3, username: 'jesse', pfpUrl: 'https://picsum.photos/100/100?r=3', points: 8200, rank: 3, isFriend: true },
  { fid: 4, username: 'linda', pfpUrl: 'https://picsum.photos/100/100?r=4', points: 7000, rank: 4, isFriend: true },
  { fid: 1234, username: 'baserunner', pfpUrl: 'https://picsum.photos/200/200', points: 1250, rank: 420, isFriend: false },
];