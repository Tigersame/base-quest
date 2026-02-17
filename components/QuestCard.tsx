import React from 'react';
import { Quest, QuestStatus, QuestType } from '../types';
import { 
  ArrowRight, Lock, CheckCircle2, Flame, Zap, Sparkles, 
  Gamepad2, Users, ArrowLeftRight, Coins, Crown, HelpCircle,
  Vote, Send
} from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  onClick: (quest: Quest) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onClick }) => {
  const isLocked = quest.status === QuestStatus.LOCKED;
  const isCompleted = quest.status === QuestStatus.COMPLETED || quest.status === QuestStatus.CLAIMED;
  const isPremium = quest.isPremium;

  // Icon mapping
  const TypeIcon = {
    [QuestType.SWAP]: ArrowLeftRight,
    [QuestType.MINT]: Sparkles,
    [QuestType.HOLD]: Coins,
    [QuestType.SOCIAL]: Users,
    [QuestType.GAME]: Gamepad2,
    [QuestType.BRIDGE]: ArrowRight,
    [QuestType.LIQUIDITY]: Coins,
    [QuestType.REFERRAL]: Users,
    [QuestType.VOTE]: Vote,
    [QuestType.TRANSFER]: Send
  }[quest.type] || Zap;

  // Rarity Colors
  const rarityBorder = {
    'COMMON': 'border-slate-800',
    'UNCOMMON': 'border-green-800',
    'RARE': 'border-blue-800',
    'LEGENDARY': 'border-yellow-600'
  }[quest.rarity || 'COMMON'];

  const bgStyle = isPremium 
    ? 'bg-gradient-to-r from-slate-900 to-yellow-900/20 border-yellow-700/50' 
    : `bg-slate-900 ${rarityBorder}`;

  return (
    <div 
      onClick={() => !isLocked && onClick(quest)}
      className={`relative overflow-hidden rounded-2xl border ${isLocked ? 'border-slate-800 bg-slate-900/50 opacity-60' : `${bgStyle} hover:border-blue-500/50`} transition-all duration-200 group`}
    >
      {/* Badges */}
      <div className="absolute top-0 right-0 flex flex-col items-end z-10">
        {quest.isSponsored && (
          <div className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-yellow-500/20">
            SPONSORED
          </div>
        )}
        {quest.isNew && !quest.isSponsored && (
          <div className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-blue-500/20 flex items-center gap-1">
            <Sparkles size={8} /> NEW
          </div>
        )}
        {isPremium && !quest.isSponsored && (
          <div className="bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-yellow-500/20 flex items-center gap-1">
            <Crown size={8} /> VIP
          </div>
        )}
      </div>

      <div className="p-4 flex gap-4">
        {/* Icon/Image */}
        <div className="flex-shrink-0 relative">
          <div className={`w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700 ${quest.isMystery ? 'bg-purple-900/20' : 'bg-slate-800'}`}>
             {quest.imageUrl ? (
               <img src={quest.imageUrl} alt={quest.title} className="w-full h-full object-cover" />
             ) : (
               <div className="text-2xl"><TypeIcon size={24} className="text-slate-400" /></div>
             )}
             
             {quest.isMystery && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                 <HelpCircle size={24} className="text-white animate-pulse" />
               </div>
             )}
          </div>
          {/* Chain Step Badge */}
          {quest.chain && (
            <div className="absolute -bottom-2 -left-1 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-slate-600 flex items-center shadow-sm">
                Step {quest.chain.current}/{quest.chain.total}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon size={16} className={`flex-shrink-0 ${isPremium ? 'text-yellow-400' : 'text-blue-400'}`} />
            <h3 className={`font-bold truncate pr-6 ${isPremium ? 'text-yellow-100' : 'text-white'}`}>{quest.title}</h3>
            {/* Tag */}
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase tracking-wider ml-auto">
               {quest.type}
            </span>
          </div>
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {quest.description}
          </p>

          {/* Rewards & Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium">
               {quest.rewards.map((r, i) => (
                 <span key={i} className={`${quest.isMystery ? 'blur-sm select-none' : ''} bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1`}>
                   {r.type === 'POINTS' && <Zap size={10} className="text-yellow-400 fill-yellow-400" />}
                   {r.type === 'MYSTERY' ? '???' : r.label}
                 </span>
               ))}
            </div>

            {isCompleted ? (
              <div className="flex items-center gap-1 text-green-400 text-sm font-bold">
                <CheckCircle2 size={16} />
                <span>Done</span>
              </div>
            ) : isLocked ? (
              <Lock size={16} className="text-slate-600" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <ArrowRight size={16} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};