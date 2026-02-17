import React, { useState, useEffect, useMemo } from 'react';
import { User, Quest, QuestStatus, QuestType, LeaderboardEntry, AppNotification, NotificationPreferences } from './types';
import { MOCK_USER, MOCK_LEADERBOARD } from './constants';
import { fetchQuests, verifyQuestOnChain, claimQuestReward } from './services/mockService';
import { 
  Home, Trophy, User as UserIcon, Wallet, ChevronRight, Check, CheckCircle2, 
  X, Share2, Flame, Loader2, Bell, Settings, Filter, Zap, Clock, Users, ArrowLeft,
  Gamepad2, Gift, Crown, ArrowRight, HelpCircle, Sparkles, ArrowLeftRight, Repeat, Layers,
  Rocket, LineChart, TrendingUp, Plus, DollarSign, Upload, Globe, MessageCircle, 
  ChevronDown, ChevronUp, Image as ImageIcon, Settings2, Link as LinkIcon, CircleDollarSign, Info
} from 'lucide-react';
import { Button } from './components/Button';
import { QuestCard } from './components/QuestCard';

// --- Constants ---
const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 365];

// --- Types ---
interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'streak' | 'friend';
  title: string;
  message?: string;
}

// --- Sub-Components ---

const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    streak: 'bg-orange-600',
    friend: 'bg-purple-600'
  };

  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <X size={20} />,
    info: <Bell size={20} />,
    streak: <Flame size={20} />,
    friend: <Users size={20} />
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl text-white mb-3 w-full max-w-sm animate-in slide-in-from-top-5 fade-in duration-300 pointer-events-auto ${bgColors[toast.type]}`}>
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1">
        <h4 className="font-bold text-sm">{toast.title}</h4>
        {toast.message && <p className="text-xs text-white/90 mt-1">{toast.message}</p>}
      </div>
      <button onClick={() => onDismiss(toast.id)} className="opacity-70 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
};

const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "Welcome to BaseQuest",
      desc: "Your daily gateway to the Base ecosystem. Complete quests, earn XP, and collect exclusive rewards.",
      image: "https://picsum.photos/400/400?random=10"
    },
    {
      title: "Connect & Explore",
      desc: "Link your wallet to verify onchain actions. Swap, Mint, and Hold to level up your traveler rank.",
      image: "https://picsum.photos/400/400?random=11"
    },
    {
      title: "Gamified Rewards",
      desc: "Spin wheels, unlock mystery boxes, and complete chains for massive XP bonuses.",
      image: "https://picsum.photos/400/400?random=12"
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-between p-6 fade-in">
      <div className="w-full flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-64 h-64 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 mb-8 overflow-hidden shadow-2xl shadow-blue-900/50">
           <img src={slides[step].image} className="w-full h-full object-cover mix-blend-overlay opacity-80" />
        </div>
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
          {slides[step].title}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-xs">
          {slides[step].desc}
        </p>
      </div>

      <div className="w-full space-y-4 mb-8">
        <div className="flex justify-center gap-2 mb-4">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-blue-500' : 'w-2 bg-slate-800'}`} />
          ))}
        </div>
        <Button 
          fullWidth 
          onClick={() => {
            if (step < 2) setStep(s => s + 1);
            else onComplete();
          }}
        >
          {step === 2 ? "Start Questing" : "Next"}
        </Button>
      </div>
    </div>
  );
};

const TabBar: React.FC<{ current: string; onChange: (v: string) => void }> = ({ current, onChange }) => {
  const tabs = [
    { id: 'quests', icon: Home, label: 'Quests' },
    { id: 'launch', icon: Rocket, label: 'Launch' },
    { id: 'defi', icon: ArrowLeftRight, label: 'DeFi' },
    { id: 'leaderboard', icon: Trophy, label: 'Rank' },
    { id: 'profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 pb-safe pt-2 px-6">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {tabs.map((t) => {
          const isActive = current === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`flex flex-col items-center gap-1 transition-colors duration-200 ${isActive ? 'text-blue-500' : 'text-slate-500'}`}
            >
              <t.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface TopBarProps {
  user: User | null;
  onConnect: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, onConnect, onOpenNotifications, onOpenSettings }) => {
  const unreadCount = user?.notifications.filter(n => !n.read).length || 0;

  return (
    <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">Q</div>
        <span className="font-bold text-lg tracking-tight">BaseQuest</span>
      </div>
      
      {user ? (
        <div className="flex items-center gap-3">
           <button onClick={onOpenNotifications} className="relative p-2 text-slate-400 hover:text-white transition-colors">
             <Bell size={20} />
             {unreadCount > 0 && (
               <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-950"></div>
             )}
           </button>
           <button onClick={onOpenSettings} className="p-2 text-slate-400 hover:text-white transition-colors">
             <Settings size={20} />
           </button>
           <div className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 pr-3 pl-1 py-1 rounded-full border border-slate-800 transition-colors cursor-pointer">
             <img src={user.pfpUrl} alt="profile" className="w-6 h-6 rounded-full border border-slate-700" />
             <span className="text-xs font-bold text-slate-200 max-w-[80px] truncate">@{user.username}</span>
           </div>
        </div>
      ) : (
        <Button variant="secondary" className="px-3 py-1.5 text-xs h-auto" onClick={onConnect}>
          <Wallet size={14} className="mr-1" /> Connect
        </Button>
      )}
    </div>
  );
};

// Reusable Widget for Quests
const SwapWidget: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');

  const handleSwap = async () => {
    setLoading(true);
    setStep('processing');
    await new Promise(r => setTimeout(r, 2000)); // Simulate tx
    setLoading(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center animate-bounce-in">
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
          <Check size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Swap Confirmed!</h3>
        <p className="text-slate-400 text-sm mb-6">You swapped 0.002 ETH for 5.32 USDC</p>
        <Button onClick={onComplete} fullWidth>Continue</Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-4">
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Sell</span>
          <span>Balance: 0.42 ETH</span>
        </div>
        <div className="flex justify-between items-center">
          <input type="text" value="0.002" readOnly className="bg-transparent text-xl font-mono text-white outline-none w-1/2" />
          <span className="bg-slate-800 px-2 py-1 rounded text-sm font-bold flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div> ETH
          </span>
        </div>
      </div>
      
      <div className="flex justify-center -my-2 relative z-10">
        <div className="bg-slate-800 p-1.5 rounded-full border border-slate-700">
          <div className="w-4 h-4 border-2 border-slate-500 rounded-full" />
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Buy</span>
          <span>Balance: 120 USDC</span>
        </div>
        <div className="flex justify-between items-center">
          <input type="text" value="5.32" readOnly className="bg-transparent text-xl font-mono text-white outline-none w-1/2" />
          <span className="bg-slate-800 px-2 py-1 rounded text-sm font-bold flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-green-500"></div> USDC
          </span>
        </div>
      </div>

      <div className="flex justify-between text-xs text-slate-500 px-1">
        <span>Slippage: Auto (0.5%)</span>
        <span>Est. Gas: $0.02</span>
      </div>

      <Button fullWidth onClick={handleSwap} isLoading={loading}>
        {loading ? "Swapping..." : "Swap"}
      </Button>
    </div>
  );
};

const BridgeWidget: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');

  const handleBridge = async () => {
    setLoading(true);
    setStep('processing');
    await new Promise(r => setTimeout(r, 3000));
    setLoading(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center animate-bounce-in">
        <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <Check size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Bridge Initiated!</h3>
        <p className="text-slate-400 text-sm mb-6">Funds arriving on Base in ~3 mins.</p>
        <Button onClick={onComplete} fullWidth>Continue</Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-4">
      {/* Chain Selector Visualization */}
      <div className="flex items-center justify-between px-2 pb-2">
         <div className="flex flex-col items-center gap-1">
             <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center relative">
                 <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-[8px]">ETH</div>
                 <span className="text-xs font-bold absolute mt-14">Mainnet</span>
             </div>
         </div>
         
         <div className="flex-1 flex flex-col items-center px-4 relative">
             <div className="w-full h-[2px] bg-slate-800 absolute top-5"></div>
             <div className="bg-slate-900 p-1 rounded-full z-10 border border-slate-800">
                 <ArrowRight size={14} className="text-slate-500" />
             </div>
             <span className="text-xs text-slate-500 mt-2">~5 mins</span>
         </div>

         <div className="flex flex-col items-center gap-1">
             <div className="w-10 h-10 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/50 relative">
                 <span className="font-bold text-white text-xs">BASE</span>
                 <span className="text-xs font-bold absolute mt-14 text-blue-400">Base</span>
             </div>
         </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mt-4">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Bridge Amount</span>
          <span>Max: 1.42 ETH</span>
        </div>
        <div className="flex justify-between items-center">
          <input type="text" defaultValue="0.1" className="bg-transparent text-2xl font-mono text-white outline-none w-full" />
          <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded-lg">
             <div className="w-4 h-4 rounded-full bg-blue-500"></div> 
             <span className="text-sm font-bold">ETH</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-3 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Zap size={14} className="text-blue-400" />
            <span className="text-xs text-blue-200">Superbridge Mode</span>
         </div>
         <span className="text-xs font-bold text-green-400">Active</span>
      </div>

      <Button fullWidth onClick={handleBridge} isLoading={loading}>
        {loading ? 'Bridging Assets...' : 'Bridge to Base'}
      </Button>
    </div>
  );
};

const EarnWidget: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState('');

  const handleAction = async () => {
    if (!amount) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center animate-bounce-in bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <Check size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{tab === 'deposit' ? 'Deposit' : 'Withdrawal'} Successful!</h3>
        <p className="text-slate-400 text-sm mb-6">Your transaction has been processed via Morpho.</p>
        <Button onClick={() => { setSuccess(false); setAmount(''); onComplete(); }} fullWidth>Done</Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4 relative overflow-hidden">
        {/* Header Section replicating EarnDetails */}
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border border-slate-700">
                   <DollarSign size={20} />
                </div>
                <div>
                   <h3 className="font-bold text-lg">Steakhouse USDC</h3>
                   <div className="flex items-center gap-2">
                       <span className="text-xs text-slate-400">Morpho Vault</span>
                       <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                           APY 4.82%
                       </span>
                   </div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Net APY</div>
                <div className="text-xl font-mono font-bold text-green-400">4.82%</div>
            </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-950 p-1 rounded-xl flex gap-1 border border-slate-800">
            <button 
               onClick={() => setTab('deposit')}
               className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'deposit' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            >
               Deposit
            </button>
            <button 
               onClick={() => setTab('withdraw')}
               className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'withdraw' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            >
               Withdraw
            </button>
        </div>

        {/* Input Area */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Amount</span>
                <span className="flex items-center gap-1 cursor-pointer hover:text-white">
                    {tab === 'deposit' ? 'Wallet Bal: 420.00' : 'Deposited: 0.00'} USDC
                    <span className="text-[10px] bg-slate-800 px-1 rounded text-blue-400">MAX</span>
                </span>
            </div>
            <div className="flex items-center justify-between">
                <input 
                   type="text" 
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                   placeholder="0.00" 
                   className="bg-transparent text-3xl font-mono text-white outline-none w-full placeholder:text-slate-700" 
                />
                <div className="flex items-center gap-2 bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-700">
                   <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] font-bold text-black">$</div>
                   <span className="font-bold text-sm">USDC</span>
                </div>
            </div>
        </div>

        {/* Info/Stats */}
        <div className="grid grid-cols-2 gap-3">
             <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                 <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                     <TrendingUp size={10} /> Rewards
                 </div>
                 <div className="text-sm font-mono text-white">0.42% <span className="text-slate-500 text-xs">MORPHO</span></div>
             </div>
             <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                 <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                     <Info size={10} /> Liquidity
                 </div>
                 <div className="text-sm font-mono text-white">$14.2M</div>
             </div>
        </div>

        {/* Action Button */}
        <Button fullWidth onClick={handleAction} isLoading={loading} className={tab === 'deposit' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'}>
            {tab === 'deposit' ? 'Deposit USDC' : 'Withdraw USDC'}
        </Button>
    </div>
  );
};

// --- DeFi Portal Component ---
interface DeFiPortalProps {
  mode: 'swap' | 'bridge' | 'dca' | 'pool' | 'earn';
  setMode: (mode: 'swap' | 'bridge' | 'dca' | 'pool' | 'earn') => void;
}

const DeFiPortal: React.FC<DeFiPortalProps> = ({ mode, setMode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  // Helper to render tabs
  const TabButton = ({ id, label, icon: Icon, colorClass }: any) => (
    <button
      onClick={() => setMode(id)}
      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 min-w-[80px] ${
        mode === id ? `${colorClass} text-white shadow-lg` : 'text-slate-400 hover:text-white'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="space-y-6 fade-in pt-2">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">DeFi Portal</h2>
        <div className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-xs font-mono text-slate-400">
           Gas: <span className="text-green-400">12 gwei</span>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar gap-1">
          <TabButton id="swap" label="Swap" icon={ArrowLeftRight} colorClass="bg-blue-600" />
          <TabButton id="bridge" label="Bridge" icon={ArrowRight} colorClass="bg-indigo-600" />
          <TabButton id="dca" label="DCA" icon={Repeat} colorClass="bg-purple-600" />
          <TabButton id="pool" label="Pool" icon={Layers} colorClass="bg-green-600" />
          <TabButton id="earn" label="Earn" icon={CircleDollarSign} colorClass="bg-emerald-600" />
       </div>

       {/* Main Card */}
       <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden min-h-[400px]">
          
          {/* Background Glow */}
          <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] opacity-20 rounded-full pointer-events-none transition-colors duration-500 ${
              mode === 'swap' ? 'bg-blue-600' : mode === 'bridge' ? 'bg-indigo-600' : mode === 'dca' ? 'bg-purple-600' : mode === 'earn' ? 'bg-emerald-600' : 'bg-green-600'
          }`} />

          {/* Swap View */}
          {mode === 'swap' && (
              <div className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Sell</span>
                        <span>Bal: 1.42 ETH</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <input type="text" defaultValue="0.1" className="bg-transparent text-2xl font-mono text-white outline-none w-full" />
                        <button className="bg-slate-800 px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700">
                             <div className="w-5 h-5 rounded-full bg-blue-500" /> ETH <ChevronRight size={14} />
                        </button>
                    </div>
                 </div>
                 
                 <div className="flex justify-center -my-3 relative z-20">
                    <button className="bg-slate-800 p-2 rounded-xl border border-slate-700 hover:bg-slate-700 shadow-xl">
                        <ArrowLeftRight size={16} className="text-slate-300" />
                    </button>
                 </div>

                 <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Buy</span>
                        <span>Bal: 420.00 USDC</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <input type="text" defaultValue="285.42" className="bg-transparent text-2xl font-mono text-white outline-none w-full" />
                        <button className="bg-slate-800 px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700">
                             <div className="w-5 h-5 rounded-full bg-green-500" /> USDC <ChevronRight size={14} />
                        </button>
                    </div>
                 </div>

                 <Button fullWidth isLoading={isLoading} onClick={handleAction}>
                    Swap Tokens
                 </Button>
              </div>
          )}

          {/* Bridge View */}
          {mode === 'bridge' && (
              <div className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <BridgeWidget onComplete={() => handleAction()} />
              </div>
          )}

          {/* DCA View */}
          {mode === 'dca' && (
              <div className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl mb-2">
                      <p className="text-xs text-purple-200 leading-relaxed">
                          <strong className="block text-purple-400 mb-1">Dollar Cost Average</strong>
                          Automate your investments. Buy ETH with USDC every week to mitigate volatility.
                      </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-xs text-slate-400 block mb-1">From</span>
                        <div className="flex items-center gap-2 font-bold">
                            <div className="w-4 h-4 rounded-full bg-green-500" /> USDC
                        </div>
                     </div>
                     <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-xs text-slate-400 block mb-1">To</span>
                        <div className="flex items-center gap-2 font-bold">
                            <div className="w-4 h-4 rounded-full bg-blue-500" /> ETH
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-slate-300">Amount per trade</span>
                          <span className="text-xs font-mono text-slate-500">Bal: 1200 USDC</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                           <input type="text" defaultValue="50" className="bg-transparent text-2xl font-mono text-white outline-none w-full" />
                           <span className="text-sm font-bold text-slate-500">USDC</span>
                      </div>

                      <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Frequency</span>
                          <select className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm outline-none">
                              <option>Daily</option>
                              <option>Weekly</option>
                              <option>Monthly</option>
                          </select>
                      </div>
                  </div>

                  <Button fullWidth variant="primary" className="bg-purple-600 hover:bg-purple-500" isLoading={isLoading} onClick={handleAction}>
                    Start DCA Stream
                 </Button>
              </div>
          )}

          {/* Pool View */}
          {mode === 'pool' && (
              <div className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                     <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-2">
                             <div className="flex -space-x-2">
                                 <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-950" />
                                 <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-slate-950" />
                             </div>
                             <div>
                                 <h3 className="font-bold">ETH-USDC</h3>
                                 <span className="text-xs text-slate-400">Volatile • 0.05%</span>
                             </div>
                         </div>
                         <div className="text-right">
                             <span className="block font-bold text-green-400 text-lg">42.5%</span>
                             <span className="text-xs text-slate-500">APR</span>
                         </div>
                     </div>

                     <div className="space-y-3">
                         <div className="bg-slate-900 p-2 rounded-lg flex justify-between items-center">
                             <span className="text-sm text-slate-400 pl-2">ETH Amount</span>
                             <input className="bg-transparent text-right font-mono w-24 outline-none" placeholder="0.0" />
                         </div>
                         <div className="bg-slate-900 p-2 rounded-lg flex justify-between items-center">
                             <span className="text-sm text-slate-400 pl-2">USDC Amount</span>
                             <input className="bg-transparent text-right font-mono w-24 outline-none" placeholder="0.0" />
                         </div>
                     </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl">
                     <div>Pool Share</div> <div className="text-right text-white">0%</div>
                     <div>Est. Earnings</div> <div className="text-right text-green-400">$12.40/mo</div>
                 </div>

                 <Button fullWidth variant="primary" className="bg-green-600 hover:bg-green-500" isLoading={isLoading} onClick={handleAction}>
                    Add Liquidity
                 </Button>
              </div>
          )}

          {/* Earn View (New) */}
          {mode === 'earn' && (
              <div className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <EarnWidget onComplete={() => handleAction()} />
              </div>
          )}
       </div>
    </div>
  );
};

// --- Token Launch Portal Component ---
interface Token {
  id: string;
  name: string;
  ticker: string;
  desc: string;
  progress: number;
  marketCap: string;
  creator: string;
  imageUrl: string;
}

const TokenLaunchPortal: React.FC<{ onAction: (msg: string) => void }> = ({ onAction }) => {
  const [view, setView] = useState<'list' | 'create' | 'trade'>('list');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Create Form State
  const [launchForm, setLaunchForm] = useState({
      name: '',
      ticker: '',
      desc: '',
      supply: '1000000000',
      initialBuy: '',
      image: null as File | null,
      website: '',
      telegram: '',
      twitter: ''
  });
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Mock Tokens
  const tokens: Token[] = [
    { 
      id: 't1', name: 'Based Doge', ticker: 'BDOGE', desc: 'The most based dog on Base.', 
      progress: 85, marketCap: '$42.5k', creator: '@based_dev', imageUrl: 'https://picsum.photos/100/100?r=doge' 
    },
    { 
      id: 't2', name: 'Clank AI', ticker: 'CLANK', desc: 'Autonomous AI agent token.', 
      progress: 42, marketCap: '$18.2k', creator: '@ai_wizard', imageUrl: 'https://picsum.photos/100/100?r=ai' 
    },
    { 
      id: 't3', name: 'Blue Orb', ticker: 'ORB', desc: 'Just a mysterious orb.', 
      progress: 12, marketCap: '$5.1k', creator: '@orb_master', imageUrl: 'https://picsum.photos/100/100?r=orb' 
    }
  ];

  const handleLaunch = () => {
    if (!launchForm.name || !launchForm.ticker) return; // Simple validation
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('list');
      const buyMsg = launchForm.initialBuy ? ` & Bought ${launchForm.initialBuy} ETH` : '';
      onAction(`Launched $${launchForm.ticker.toUpperCase()}${buyMsg}! +500 XP`);
    }, 2000);
  };

  const handleTrade = (type: 'buy' | 'sell') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('list');
      onAction(`Successfully ${type === 'buy' ? 'bought' : 'sold'} ${selectedToken?.ticker}`);
    }, 1500);
  };

  return (
    <div className="space-y-6 fade-in pt-2">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 flex items-center gap-2">
          <Rocket className="text-orange-500" /> Launchpad
        </h2>
        {view === 'list' && (
           <div className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-yellow-500/20">
              <Zap size={12} fill="currentColor" /> Earn 500 XP
           </div>
        )}
      </div>

      {view === 'list' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
           {/* Create Banner */}
           <div 
             onClick={() => setView('create')}
             className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-orange-500 hover:bg-slate-800 transition-all group"
           >
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                 <Plus size={24} className="text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Launch your Token</h3>
              <p className="text-slate-400 text-sm">Instant deploy. Bonding curve liquidity. No dev needed.</p>
           </div>

           {/* Trending List */}
           <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2 px-1">
                 <TrendingUp size={14} /> Trending on Curve
              </h3>
              {tokens.map(token => (
                 <div 
                   key={token.id} 
                   onClick={() => { setSelectedToken(token); setView('trade'); }}
                   className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-4 hover:border-slate-600 transition-colors cursor-pointer"
                 >
                    <img src={token.imageUrl} className="w-12 h-12 rounded-lg bg-slate-800" />
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between mb-1">
                          <h4 className="font-bold truncate">{token.name} <span className="text-slate-500 font-normal text-xs ml-1">${token.ticker}</span></h4>
                          <span className="text-xs font-mono text-green-400">{token.marketCap}</span>
                       </div>
                       
                       {/* Progress Bar */}
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className={`h-full rounded-full ${token.progress > 80 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                             style={{width: `${token.progress}%`}}
                          />
                       </div>
                       <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">Created by <span className="text-slate-300 font-bold">{token.creator}</span></span>
                          <span>{token.progress}% curve</span>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {view === 'create' && (
         <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-2">
               <button onClick={() => setView('list')} className="p-1 hover:bg-slate-800 rounded">
                  <ArrowLeft size={20} />
               </button>
               <h3 className="font-bold text-lg">Create Token</h3>
            </div>

            <div className="space-y-4">
               {/* Image Upload Area */}
               <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 hover:border-orange-500 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group">
                      {launchForm.image ? (
                          <img src={URL.createObjectURL(launchForm.image)} className="w-full h-full object-cover" />
                      ) : (
                          <>
                             <ImageIcon className="text-slate-500 mb-1 group-hover:text-orange-500" size={24} />
                             <span className="text-[10px] text-slate-500 font-bold">UPLOAD</span>
                          </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => setLaunchForm({...launchForm, image: e.target.files?.[0] || null})}
                      />
                  </div>
               </div>

               {/* Core Info */}
               <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Name</label>
                    <input 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-colors" 
                        placeholder="Based Cat"
                        value={launchForm.name}
                        onChange={(e) => setLaunchForm({...launchForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Ticker</label>
                    <input 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-colors text-center font-mono" 
                        placeholder="$BCAT"
                        value={launchForm.ticker}
                        onChange={(e) => setLaunchForm({...launchForm, ticker: e.target.value.toUpperCase()})}
                    />
                  </div>
               </div>
               
               <div>
                  <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Description</label>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-colors h-20 resize-none text-sm" 
                    placeholder="Tell the world about your token..." 
                    value={launchForm.desc}
                    onChange={(e) => setLaunchForm({...launchForm, desc: e.target.value})}
                  />
               </div>

               {/* Advanced Toggle */}
               <button 
                 onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                 className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors w-full justify-center py-2"
               >
                  {isAdvancedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isAdvancedOpen ? 'Hide Advanced Options' : 'Show Advanced Options'}
               </button>

               {isAdvancedOpen && (
                   <div className="space-y-4 animate-in slide-in-from-top-2">
                       {/* Supply */}
                       <div>
                          <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block flex justify-between">
                              <span>Max Supply</span>
                              <span className="text-[10px] text-slate-600">Default: 1B</span>
                          </label>
                          <input 
                            type="number"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-colors font-mono" 
                            value={launchForm.supply}
                            onChange={(e) => setLaunchForm({...launchForm, supply: e.target.value})}
                          />
                       </div>
                       
                       {/* Socials */}
                       <div className="space-y-2">
                           <div className="relative">
                               <Globe size={16} className="absolute left-3 top-3.5 text-slate-500" />
                               <input 
                                 className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 outline-none focus:border-orange-500 transition-colors text-sm"
                                 placeholder="Website (Optional)"
                                 value={launchForm.website}
                                 onChange={(e) => setLaunchForm({...launchForm, website: e.target.value})}
                               />
                           </div>
                           <div className="relative">
                               <MessageCircle size={16} className="absolute left-3 top-3.5 text-slate-500" />
                               <input 
                                 className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 outline-none focus:border-orange-500 transition-colors text-sm"
                                 placeholder="Telegram Link (Optional)"
                                 value={launchForm.telegram}
                                 onChange={(e) => setLaunchForm({...launchForm, telegram: e.target.value})}
                               />
                           </div>
                           <div className="relative">
                               <LinkIcon size={16} className="absolute left-3 top-3.5 text-slate-500" />
                               <input 
                                 className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 outline-none focus:border-orange-500 transition-colors text-sm"
                                 placeholder="Twitter/X Link (Optional)"
                                 value={launchForm.twitter}
                                 onChange={(e) => setLaunchForm({...launchForm, twitter: e.target.value})}
                               />
                           </div>
                       </div>
                   </div>
               )}
               
               {/* Initial Buy / Snipe */}
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                            <Zap size={12} className="text-yellow-400" /> Initial Buy (Snipe)
                        </span>
                        <span className="text-[10px] text-slate-500">Optional</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white outline-none w-full font-mono focus:border-orange-500"
                            placeholder="0.0"
                            value={launchForm.initialBuy}
                            onChange={(e) => setLaunchForm({...launchForm, initialBuy: e.target.value})}
                        />
                        <span className="text-xs font-bold text-slate-500">ETH</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">
                        Buy tokens immediately in the deployment block to secure a position.
                    </p>
               </div>

               <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-xs text-orange-200">
                  ⚠️ <strong>Instant Deploy:</strong> Curve liquidity is locked automatically.
               </div>

               <Button fullWidth onClick={handleLaunch} isLoading={loading} className="bg-orange-600 hover:bg-orange-500">
                  {launchForm.initialBuy && parseFloat(launchForm.initialBuy) > 0 
                     ? `Deploy & Buy (${launchForm.initialBuy} ETH)`
                     : "Launch Token (0.02 ETH)"}
               </Button>
            </div>
         </div>
      )}

      {view === 'trade' && selectedToken && (
         <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
             {/* Header */}
             <div className="flex items-center gap-2 mb-2">
               <button onClick={() => setView('list')} className="p-1 hover:bg-slate-800 rounded">
                  <ArrowLeft size={20} />
               </button>
               <div className="flex items-center gap-2">
                   <img src={selectedToken.imageUrl} className="w-8 h-8 rounded-md" />
                   <div>
                       <h3 className="font-bold text-sm leading-tight">{selectedToken.name}</h3>
                       <p className="text-xs text-slate-500 leading-tight">${selectedToken.ticker}</p>
                   </div>
               </div>
            </div>

            {/* Chart Area Mock */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl h-48 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent"></div>
               <LineChart size={48} className="text-slate-700" />
               <p className="absolute bottom-2 right-2 text-xs font-mono text-green-400">+142% today</p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <span className="text-xs text-slate-500 block">Market Cap</span>
                  <span className="font-bold text-white">{selectedToken.marketCap}</span>
               </div>
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <span className="text-xs text-slate-500 block">Curve Prog</span>
                  <span className="font-bold text-orange-400">{selectedToken.progress}%</span>
               </div>
            </div>

            {/* Trade Action */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
               <div className="flex justify-between mb-4 bg-slate-950 p-1 rounded-lg">
                   <button className="flex-1 py-1.5 rounded-md text-sm font-bold bg-green-600 text-white shadow">Buy</button>
                   <button className="flex-1 py-1.5 rounded-md text-sm font-bold text-slate-400 hover:text-white">Sell</button>
               </div>

               <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 mb-4">
                   <input type="text" placeholder="0.0" className="bg-transparent outline-none text-white font-mono text-lg w-full" />
                   <span className="text-xs font-bold text-slate-500 ml-2">ETH</span>
               </div>

               <Button fullWidth onClick={() => handleTrade('buy')} isLoading={loading} className="bg-green-600 hover:bg-green-500">
                  Place Trade
               </Button>
            </div>
         </div>
      )}
    </div>
  );
};

const QuestDetailModal: React.FC<{ quest: Quest; user: User | null; onClose: () => void; onClaim: (id: string) => void }> = ({ quest, user, onClose, onClaim }) => {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [revealedReward, setRevealedReward] = useState<string | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);

  const handleAction = async () => {
    // Chain or Hold verification
    if (quest.type === QuestType.HOLD || quest.chain) {
      setVerifying(true);
      await verifyQuestOnChain(quest.id, "0x123");
      setVerifying(false);
      setVerified(true);
    } else {
      setVerified(true);
    }
  };

  const handleCopyReferral = () => {
     if (user) {
         navigator.clipboard.writeText(`https://basequest.xyz?ref=${user.username}`);
         setReferralCopied(true);
         setTimeout(() => setReferralCopied(false), 2000);
     }
  };

  const handleClaimReward = async () => {
    setClaiming(true);
    
    // Simulate Mystery reveal
    if (quest.isMystery) {
        await new Promise(r => setTimeout(r, 1000));
        setRevealing(true);
        setClaiming(false);
        setTimeout(() => {
            setRevealedReward("500 XP + Rare NFT");
        }, 1500);
        return;
    }

    await claimQuestReward(quest.id);
    setClaiming(false);
    onClaim(quest.id);
    onClose();
  };
  
  const finishReveal = () => {
      onClaim(quest.id);
      onClose();
  };

  if (revealing) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6 fade-in">
           <div className="text-center">
               {!revealedReward ? (
                   <div className="animate-bounce">
                       <Gift size={64} className="text-purple-500 mx-auto mb-4" />
                       <h2 className="text-2xl font-bold text-white">Opening Mystery Box...</h2>
                   </div>
               ) : (
                   <div className="animate-in zoom-in duration-300">
                       <Sparkles size={64} className="text-yellow-400 mx-auto mb-4" />
                       <h2 className="text-3xl font-bold text-white mb-2">You Found:</h2>
                       <div className="text-2xl font-bold text-yellow-400 mb-6">{revealedReward}</div>
                       <Button onClick={finishReveal}>Awesome!</Button>
                   </div>
               )}
           </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="relative h-32 bg-slate-800">
          {quest.imageUrl && <img src={quest.imageUrl} className="w-full h-full object-cover opacity-60" />}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
          
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 backdrop-blur rounded-full p-2 text-white hover:bg-black/60 z-10">
            <X size={20} />
          </button>
          
          {quest.isPremium && (
             <div className="absolute top-4 left-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-500/20">
                <Crown size={12} fill="black" /> VIP EXCLUSIVE
             </div>
          )}
        </div>

        <div className="p-6 flex-1 overflow-y-auto no-scrollbar -mt-10 relative">
          <div className="flex items-start justify-between mb-4">
            <div>
               <h2 className="text-2xl font-bold text-white mb-1">{quest.title}</h2>
               <div className="flex items-center gap-2">
                 <span className={`text-xs px-2 py-0.5 rounded ${quest.status === QuestStatus.COMPLETED ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                   {quest.status}
                 </span>
                 <span className="text-xs text-slate-400">Ends in 22h</span>
               </div>
            </div>
          </div>
          
          {/* Chain Progress */}
          {quest.chain && (
              <div className="mb-6">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>Step {quest.chain.current} of {quest.chain.total}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500" 
                        style={{ width: `${(quest.chain.current / quest.chain.total) * 100}%` }} 
                      />
                  </div>
              </div>
          )}

          <p className="text-slate-300 leading-relaxed mb-6">{quest.description}</p>
          
          {/* Referral Section */}
          {quest.type === QuestType.REFERRAL && (
             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                   <Share2 size={12} /> Your Referral Link
                </h4>
                {user ? (
                    <>
                        <div className="flex items-center gap-2 mb-3">
                        <div className="bg-slate-900 border border-slate-800 text-slate-400 text-sm px-3 py-3 rounded-lg flex-1 truncate font-mono select-all">
                            basequest.xyz?ref={user.username}
                        </div>
                        <button 
                            onClick={handleCopyReferral}
                            className={`font-bold p-3 rounded-lg transition-colors min-w-[80px] ${referralCopied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                        >
                            {referralCopied ? 'Copied!' : 'Copy'}
                        </button>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-400">
                           <div className="flex items-center gap-2">
                                <Users size={16} />
                                <span>Ref Count:</span>
                           </div>
                           <span className="text-white font-bold">2 Friends</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                             <div className="h-full bg-blue-500 w-2/3"></div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 text-right">1 more to next reward</p>
                    </>
                ) : (
                    <div className="text-center py-4 text-slate-400 text-sm">
                        Please connect your wallet to generate a referral link.
                    </div>
                )}
             </div>
          )}

          <div className="bg-slate-950 rounded-xl p-4 mb-6 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                {quest.isMystery && <HelpCircle size={12} />} Rewards
            </h4>
            <div className="flex gap-2">
              {quest.rewards.map((r, i) => (
                <div key={i} className={`flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 ${quest.isMystery ? 'opacity-50 blur-[2px]' : ''}`}>
                   {r.type === 'POINTS' ? <Zap size={16} className="text-yellow-400 fill-yellow-400" /> : <Trophy size={16} className="text-purple-500" />}
                   <span className="text-sm font-bold">{r.label}</span>
                </div>
              ))}
              {quest.isMystery && <span className="text-sm text-slate-500 italic ml-2 self-center">Revealed on claim</span>}
            </div>
          </div>

          {verified ? (
             <div className="space-y-4">
                <div className="p-4 bg-green-900/20 border border-green-900/50 rounded-xl flex items-center gap-3">
                   <CheckCircle2 className="text-green-500" />
                   <span className="text-green-100 font-medium">Quest requirements met!</span>
                </div>
                <Button 
                    fullWidth 
                    variant="primary" 
                    isLoading={claiming}
                    className={quest.isMystery ? "bg-purple-600 hover:bg-purple-500" : "bg-green-600 hover:bg-green-500"}
                    onClick={handleClaimReward}
                >
                    {quest.isMystery ? "Claim & Reveal" : "Claim Rewards"}
                </Button>
             </div>
          ) : (
            <div className="space-y-4">
              {quest.type === QuestType.SWAP ? (
                <SwapWidget onComplete={() => setVerified(true)} />
              ) : quest.type === QuestType.BRIDGE ? (
                <BridgeWidget onComplete={() => setVerified(true)} />
              ) : (
                 <Button fullWidth onClick={handleAction} isLoading={verifying}>
                   {quest.actionLabel}
                 </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationSheet: React.FC<{ 
  notifications: AppNotification[]; 
  onClose: () => void; 
  onMarkRead: () => void;
}> = ({ notifications, onClose, onMarkRead }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-slate-900 h-full border-l border-slate-800 p-6 flex flex-col shadow-2xl slide-in-from-right-10 duration-200">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold">Notifications</h2>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full">
             <X size={20} />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
          {notifications.length === 0 ? (
             <div className="text-center text-slate-500 py-10">No notifications</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-4 rounded-xl border ${n.read ? 'bg-slate-900 border-slate-800 opacity-60' : 'bg-slate-800 border-slate-700'}`}>
                 <div className="flex items-start gap-3">
                   <div className={`mt-1 w-2 h-2 rounded-full ${n.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                   <div>
                      <h4 className="font-bold text-sm mb-1">{n.title}</h4>
                      <p className="text-xs text-slate-400 mb-2">{n.message}</p>
                      <span className="text-[10px] text-slate-500">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                 </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.some(n => !n.read) && (
          <Button variant="secondary" onClick={onMarkRead} className="mt-4">
             Mark all as read
          </Button>
        )}
      </div>
    </div>
  );
};

const SettingsSheet: React.FC<{ 
  user: User; 
  onClose: () => void;
  onUpdate: (prefs: NotificationPreferences) => void;
}> = ({ user, onClose, onUpdate }) => {
  const [prefs, setPrefs] = useState(user.preferences);

  const toggleQuestType = (type: QuestType) => {
    setPrefs(p => ({
      ...p,
      questType: { ...p.questType, [type]: !p.questType[type] }
    }));
  };

  const toggle = (key: keyof Omit<NotificationPreferences, 'questType'>) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = () => {
    onUpdate(prefs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
         <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold">Alert Preferences</h2>
            <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
         </div>
         
         <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
            {/* Quest Types */}
            <div>
               <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                 <Filter size={12} /> Quest Types
               </h3>
               <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                 {Object.values(QuestType).map(type => (
                   <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{type.toLowerCase()}</span>
                      <button 
                        onClick={() => toggleQuestType(type)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${prefs.questType[type] ? 'bg-blue-600' : 'bg-slate-700'}`}
                      >
                         <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs.questType[type] ? 'translate-x-4' : ''}`} />
                      </button>
                   </div>
                 ))}
               </div>
            </div>

            {/* General */}
            <div>
               <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                 <Bell size={12} /> Activity
               </h3>
               <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Clock size={16} className="text-slate-400" />
                         <span className="text-sm font-medium">Expiring Soon</span>
                      </div>
                      <button 
                        onClick={() => toggle('expiry')}
                        className={`w-10 h-6 rounded-full transition-colors relative ${prefs.expiry ? 'bg-blue-600' : 'bg-slate-700'}`}
                      >
                         <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs.expiry ? 'translate-x-4' : ''}`} />
                      </button>
                  </div>

                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Users size={16} className="text-slate-400" />
                         <span className="text-sm font-medium">Friend Activity</span>
                      </div>
                      <button 
                        onClick={() => toggle('friendActivity')}
                        className={`w-10 h-6 rounded-full transition-colors relative ${prefs.friendActivity ? 'bg-blue-600' : 'bg-slate-700'}`}
                      >
                         <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs.friendActivity ? 'translate-x-4' : ''}`} />
                      </button>
                  </div>

                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Flame size={16} className="text-slate-400" />
                         <span className="text-sm font-medium">Streak Milestones</span>
                      </div>
                      <button 
                        onClick={() => toggle('streakMilestone')}
                        className={`w-10 h-6 rounded-full transition-colors relative ${prefs.streakMilestone ? 'bg-blue-600' : 'bg-slate-700'}`}
                      >
                         <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs.streakMilestone ? 'translate-x-4' : ''}`} />
                      </button>
                  </div>
               </div>
            </div>
         </div>

         <div className="p-4 border-t border-slate-800">
            <Button fullWidth onClick={handleSave}>Save Preferences</Button>
         </div>
      </div>
    </div>
  );
};

const FilterBar: React.FC<{ current: string; onChange: (v: string) => void }> = ({ current, onChange }) => {
  const filters = [
    { id: 'all', label: 'For You' },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'game', label: 'Games', icon: Gamepad2 },
    { id: 'defi', label: 'DeFi' },
    { id: 'nft', label: 'NFTs' },
    { id: 'social', label: 'Social' },
    { id: 'premium', label: 'VIP', icon: Crown },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sticky top-0 bg-slate-950/95 z-20 backdrop-blur-sm pb-4 pt-2">
      {filters.map(f => {
        const active = current === f.id;
        const Icon = f.icon;
        return (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              active 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
            }`}
          >
            {Icon && <Icon size={14} className={active ? 'text-white' : 'text-slate-500'} />}
            {f.label}
          </button>
        );
      })}
    </div>
  );
};

// --- Main App Logic ---

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [view, setView] = useState('quests');
  const [user, setUser] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // New States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all');
  const [defiMode, setDefiMode] = useState<'swap' | 'bridge' | 'dca' | 'pool' | 'earn'>('swap');

  useEffect(() => {
    const init = async () => {
        await new Promise(r => setTimeout(r, 500));
        const qData = await fetchQuests();
        setQuests(qData);
        setLoading(false);
    };
    init();
  }, []);

  // --- Friend Activity Simulation ---
  useEffect(() => {
    // Only run if user is logged in, has friend activity enabled, and quests are loaded
    if (!user || !user.preferences.friendActivity || quests.length === 0) return;

    const interval = setInterval(() => {
      // 40% chance to trigger per interval to vary timing
      if (Math.random() > 0.6) {
        const friends = MOCK_LEADERBOARD.filter(f => f.isFriend);
        if (friends.length === 0) return;

        const randomFriend = friends[Math.floor(Math.random() * friends.length)];
        const randomQuest = quests[Math.floor(Math.random() * quests.length)];

        // Create Notification
        const newNotif: AppNotification = {
          id: `friend-${Date.now()}`,
          title: 'Friend Update',
          message: `@${randomFriend.username} just completed ${randomQuest.title}!`,
          timestamp: Date.now(),
          read: false,
          type: 'FRIEND'
        };

        // Update User State
        setUser(prev => {
           if (!prev) return null;
           return {
             ...prev,
             notifications: [newNotif, ...prev.notifications]
           };
        });

        // Show Toast
        addToast('friend', 'Friend Activity', `@${randomFriend.username} completed ${randomQuest.title}`);
      }
    }, 12000); // Check every 12 seconds

    return () => clearInterval(interval);
  }, [user?.preferences.friendActivity, quests, user?.fid]);

  // --- New Quest Simulation ---
  useEffect(() => {
    // Only run if user is logged in
    if (!user) return;

    const interval = setInterval(() => {
      // 20% chance every 10s to simulate a new quest dropping
      if (Math.random() > 0.8) {
        const types = Object.values(QuestType);
        // Pick a random type
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        // Check if user has notifications enabled for this specific quest type
        // preferences.questType is a Record<QuestType, boolean>
        if (user.preferences.questType[randomType]) {
            const newQuest: Quest = {
                id: `new-q-${Date.now()}`,
                title: `New ${randomType.toLowerCase()} Opportunity`,
                description: `A limited time ${randomType} quest just appeared! Complete it before it's gone.`,
                type: randomType,
                status: QuestStatus.ACTIVE,
                rewards: [{ type: 'POINTS', value: 150, label: '150 XP' }],
                expiryTime: Date.now() + 3600000, // 1 hour
                actionLabel: 'View Quest',
                isNew: true,
                rarity: 'RARE'
            };

            // Add to quest list
            setQuests(prev => [newQuest, ...prev]);

            // Create in-app notification
            const newNotif: AppNotification = {
                id: `quest-${Date.now()}`,
                title: 'New Quest Alert',
                message: `A new ${randomType} quest has appeared!`,
                timestamp: Date.now(),
                read: false,
                type: 'QUEST'
            };

            // Update user state
            setUser(prev => prev ? ({
                ...prev,
                notifications: [newNotif, ...prev.notifications]
            }) : null);

            // Trigger Toast
            addToast('info', 'New Quest Alert', `A new ${randomType} quest dropped!`);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.preferences.questType, user?.fid]);

  // --- Expiry Simulation ---
  useEffect(() => {
      if (!user || !user.preferences.expiry) return;

      const interval = setInterval(() => {
          // 15% chance to warn about expiry
          if (Math.random() > 0.85 && quests.length > 0) {
              const activeQuests = quests.filter(q => q.status === QuestStatus.ACTIVE);
              if (activeQuests.length === 0) return;
              
              const randomQuest = activeQuests[Math.floor(Math.random() * activeQuests.length)];

              const newNotif: AppNotification = {
                  id: `expiry-${Date.now()}`,
                  title: 'Quest Expiring',
                  message: `${randomQuest.title} ends soon!`,
                  timestamp: Date.now(),
                  read: false,
                  type: 'SYSTEM'
              };

              setUser(prev => prev ? ({
                  ...prev,
                  notifications: [newNotif, ...prev.notifications]
              }) : null);

              addToast('info', 'Expiring Soon', `${randomQuest.title} is ending!`);
          }
      }, 15000);

      return () => clearInterval(interval);
  }, [user?.preferences.expiry, quests, user?.fid]);

  const handleConnect = () => {
    setUser(MOCK_USER);
    addToast('success', 'Wallet Connected', 'Welcome back, Base Runner!');
  };

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleClaim = (questId: string) => {
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, status: QuestStatus.CLAIMED } : q));
    addToast('success', 'Quest Completed', 'Rewards claimed successfully!');
    
    if (user) {
        // Simulate daily streak increment
        // In production this would check last login date
        const newStreak = user.streak + 1;
        let newNotifications = [...user.notifications];

        // Check Milestone Logic
        if (STREAK_MILESTONES.includes(newStreak) && user.preferences.streakMilestone) {
            newNotifications.unshift({
                id: `streak-${Date.now()}`,
                title: "🔥 Streak Milestone!",
                message: `You've reached a ${newStreak}-day streak! Keep it up!`,
                timestamp: Date.now(),
                read: false,
                type: 'STREAK'
            });
            // Show immediate toast
            addToast('streak', '🔥 Streak Milestone!', `You've reached a ${newStreak}-day streak!`);
        }

        setUser({ 
            ...user, 
            points: user.points + 100, 
            completedQuests: [...user.completedQuests, questId],
            streak: newStreak,
            notifications: newNotifications
        });
    }
  };

  const handleLaunchAction = (msg: string) => {
    addToast('success', 'Action Success', msg);
    if (user) {
       setUser(prev => prev ? ({...prev, points: prev.points + 500}) : null);
    }
  };

  const handleMarkRead = () => {
    if (user) {
      const updated = user.notifications.map(n => ({...n, read: true}));
      setUser({...user, notifications: updated});
    }
  };

  const handleUpdatePrefs = (newPrefs: NotificationPreferences) => {
    if (user) {
      setUser({...user, preferences: newPrefs});
      addToast('info', 'Settings Updated', 'Your preferences have been saved.');
    }
  };

  // Filter Logic
  const filteredQuests = useMemo(() => {
    if (!quests) return [];
    return quests.filter(q => {
      if (feedFilter === 'all') return true;
      if (feedFilter === 'trending') return (q.popularity || 0) > 80;
      if (feedFilter === 'game') return q.type === QuestType.GAME;
      if (feedFilter === 'defi') return q.type === QuestType.SWAP || q.type === QuestType.HOLD || q.type === QuestType.LIQUIDITY || q.type === QuestType.BRIDGE;
      if (feedFilter === 'nft') return q.type === QuestType.MINT;
      if (feedFilter === 'social') return q.type === QuestType.SOCIAL || q.type === QuestType.REFERRAL;
      if (feedFilter === 'premium') return q.isPremium;
      return true;
    });
  }, [quests, feedFilter]);

  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={() => setHasOnboarded(true)} />;
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-950 text-white relative">
      <TopBar 
        user={user} 
        onConnect={handleConnect} 
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Toast Container */}
      <div className="fixed top-20 left-0 right-0 z-50 flex flex-col items-center pointer-events-none px-4">
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>

      <main className="px-4 py-6 max-w-md mx-auto">
        {loading ? (
           <div className="space-y-4">
             {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-900 rounded-2xl animate-pulse" />)}
           </div>
        ) : (
          <>
            {view === 'defi' && <DeFiPortal mode={defiMode} setMode={setDefiMode} />}

            {view === 'launch' && <TokenLaunchPortal onAction={handleLaunchAction} />}

            {view === 'quests' && (
              <div className="space-y-6 fade-in">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 blur-[60px] opacity-40 rounded-full pointer-events-none" />
                    <h2 className="text-xl font-bold mb-1 relative z-10">Daily Quests</h2>
                    <p className="text-blue-200 text-sm mb-4 relative z-10">Resets in 14h 32m</p>
                    <div className="flex gap-3 relative z-10">
                        <div className="bg-black/30 backdrop-blur rounded-lg px-3 py-2">
                             <span className="block text-xs text-blue-300">Available XP</span>
                             <span className="font-bold text-lg">350</span>
                        </div>
                        <div className="bg-black/30 backdrop-blur rounded-lg px-3 py-2">
                             <span className="block text-xs text-blue-300">Completed</span>
                             <span className="font-bold text-lg">{user?.completedQuests.length || 0}/{quests.length}</span>
                        </div>
                    </div>
                </div>
                
                {/* Quick Actions Portal */}
                <div className="grid grid-cols-4 gap-2">
                   <button onClick={() => { setView('defi'); setDefiMode('swap'); }} className="flex flex-col items-center group">
                      <div className="bg-blue-600/20 text-blue-400 p-3 rounded-2xl mb-2 w-14 h-14 flex items-center justify-center group-active:scale-95 transition-transform border border-blue-600/30">
                         <ArrowLeftRight size={22} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Swap</span>
                   </button>
                   <button onClick={() => { setView('defi'); setDefiMode('bridge'); }} className="flex flex-col items-center group">
                      <div className="bg-indigo-600/20 text-indigo-400 p-3 rounded-2xl mb-2 w-14 h-14 flex items-center justify-center group-active:scale-95 transition-transform border border-indigo-600/30">
                         <ArrowRight size={22} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Bridge</span>
                   </button>
                   <button onClick={() => { setView('defi'); setDefiMode('dca'); }} className="flex flex-col items-center group">
                      <div className="bg-purple-600/20 text-purple-400 p-3 rounded-2xl mb-2 w-14 h-14 flex items-center justify-center group-active:scale-95 transition-transform border border-purple-600/30">
                         <Repeat size={22} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">DCA</span>
                   </button>
                   <button onClick={() => { setView('defi'); setDefiMode('pool'); }} className="flex flex-col items-center group">
                      <div className="bg-green-600/20 text-green-400 p-3 rounded-2xl mb-2 w-14 h-14 flex items-center justify-center group-active:scale-95 transition-transform border border-green-600/30">
                         <Layers size={22} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Pool</span>
                   </button>
                </div>

                {/* Discovery Feed */}
                <div>
                   <FilterBar current={feedFilter} onChange={setFeedFilter} />
                   
                   <div className="space-y-3 mt-2 min-h-[300px]">
                     {filteredQuests.length > 0 ? (
                       filteredQuests.map(quest => (
                         <QuestCard 
                           key={quest.id} 
                           quest={quest} 
                           onClick={setSelectedQuest} 
                         />
                       ))
                     ) : (
                       <div className="text-center py-10 text-slate-500">
                         <div className="mb-2 text-4xl">🔭</div>
                         <p>No quests found in this category.</p>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            )}

            {view === 'leaderboard' && (
              <div className="fade-in space-y-4">
                 <div className="flex gap-2 mb-4 bg-slate-900 p-1 rounded-xl">
                    <button className="flex-1 py-2 text-sm font-bold rounded-lg bg-slate-800 text-white shadow">Global</button>
                    <button className="flex-1 py-2 text-sm font-medium rounded-lg text-slate-400">Friends</button>
                 </div>
                 
                 <div className="space-y-2">
                   {MOCK_LEADERBOARD.map((entry, idx) => (
                     <div key={entry.fid} className={`flex items-center p-3 rounded-xl border ${entry.fid === user?.fid ? 'bg-blue-900/20 border-blue-500/30' : 'bg-slate-900 border-slate-800'}`}>
                        <div className={`w-8 font-bold text-center ${idx < 3 ? 'text-yellow-400' : 'text-slate-500'}`}>#{entry.rank}</div>
                        <img src={entry.pfpUrl} className="w-10 h-10 rounded-full mx-3 bg-slate-800" />
                        <div className="flex-1">
                           <div className="font-bold text-sm">{entry.username}</div>
                           <div className="text-xs text-slate-400">{entry.points} XP</div>
                        </div>
                        {entry.rank === 1 && <Trophy className="text-yellow-400 w-5 h-5" />}
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {view === 'profile' && user && (
              <div className="fade-in text-center pt-6">
                <div className="relative inline-block mb-4">
                   <img src={user.pfpUrl} className="w-24 h-24 rounded-full border-4 border-slate-800" />
                   <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-slate-950">
                     Lvl 5
                   </div>
                </div>
                <h2 className="text-2xl font-bold mb-1">{user.displayName}</h2>
                <p className="text-slate-400 text-sm mb-6">@{user.username}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                     <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                     <div className="text-2xl font-bold">{user.streak}</div>
                     <div className="text-xs text-slate-500 uppercase tracking-wider">Day Streak</div>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                     <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                     <div className="text-2xl font-bold">{user.points}</div>
                     <div className="text-xs text-slate-500 uppercase tracking-wider">Total XP</div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-left">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Share2 size={16} /> Invite Friends
                  </h3>
                  <div className="bg-slate-950 p-3 rounded-xl flex justify-between items-center">
                    <code className="text-slate-400 text-sm">basequest.xyz?ref={user.username}</code>
                    <button className="text-blue-500 text-xs font-bold">COPY</button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Earn 50 XP for every friend who completes a quest.</p>
                </div>
              </div>
            )}
             
            {view === 'profile' && !user && (
                 <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-slate-400 mb-4">Connect your wallet to view your profile and stats.</p>
                    <Button onClick={handleConnect}>Connect Wallet</Button>
                 </div>
            )}
          </>
        )}
      </main>

      {/* Navigation */}
      <TabBar current={view} onChange={setView} />

      {/* Modals & Sheets */}
      {selectedQuest && (
        <QuestDetailModal 
           quest={selectedQuest} 
           user={user}
           onClose={() => setSelectedQuest(null)} 
           onClaim={handleClaim} 
        />
      )}
      
      {showNotifications && user && (
        <NotificationSheet 
          notifications={user.notifications} 
          onClose={() => setShowNotifications(false)} 
          onMarkRead={handleMarkRead}
        />
      )}

      {showSettings && user && (
        <SettingsSheet 
          user={user} 
          onClose={() => setShowSettings(false)}
          onUpdate={handleUpdatePrefs}
        />
      )}
    </div>
  );
}