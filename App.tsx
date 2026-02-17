import React, { useState, useEffect, useMemo } from 'react';
import { User, Quest, QuestStatus, QuestType, LeaderboardEntry, AppNotification, NotificationPreferences } from './types';
import { MOCK_USER, MOCK_LEADERBOARD } from './constants';
import { fetchQuests, verifyQuestOnChain, claimQuestReward } from './services/mockService';
import { 
  Home, Trophy, User as UserIcon, Wallet, ChevronRight, Check, CheckCircle2, 
  X, Share2, Flame, Loader2, Bell, Settings, Filter, Zap, Clock, Users, ArrowLeft,
  Gamepad2, Gift, Crown, ArrowRight, HelpCircle, Sparkles, ArrowLeftRight, Repeat, Layers,
  Rocket, LineChart, TrendingUp, Plus, DollarSign, Upload, Globe, MessageCircle, 
  ChevronDown, ChevronUp, Image as ImageIcon, Settings2, Link as LinkIcon, CircleDollarSign, Info, Briefcase,
  ArrowUpDown, Star, Palette, PieChart, History, Copy, Bot, SendHorizontal, Terminal, Cpu,
  TrendingDown, Activity, CreditCard
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

type SortOption = 'recommended' | 'reward' | 'expiring' | 'newest';

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
      title: "Discover Base",
      desc: "Your daily gateway to the best onchain apps. Complete quests to earn XP and rewards.",
      image: "https://picsum.photos/400/400?random=10"
    },
    {
      title: "Action & Earn",
      desc: "Swap, Bridge, Mint, and Hold. Verify your onchain actions instantly to level up.",
      image: "https://picsum.photos/400/400?random=11"
    },
    {
      title: "Build Your Streak",
      desc: "Come back daily. Consistency unlocks exclusive NFTs and higher reward tiers.",
      image: "https://picsum.photos/400/400?random=12"
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-between p-6 fade-in">
      <div className="w-full flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-xs aspect-square rounded-3xl bg-gradient-to-tr from-blue-600 to-purple-600 mb-8 overflow-hidden shadow-2xl shadow-blue-900/50 p-1">
           <img src={slides[step].image} className="w-full h-full object-cover rounded-[20px] mix-blend-overlay opacity-90" />
        </div>
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white leading-tight">
          {slides[step].title}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-xs">
          {slides[step].desc}
        </p>
      </div>

      <div className="w-full space-y-6 mb-8 max-w-xs mx-auto">
        <div className="flex justify-center gap-2">
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
          className="bg-white text-black hover:bg-slate-200"
        >
          {step === 2 ? "Let's Go" : "Next"}
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
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 pb-safe pt-2 px-6 z-40">
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

// --- OpenClaw AI Assistant ---
const OpenClawAI: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Systems online. I am OpenClaw, your Base chain navigator. 🤖\n\nAsk me about quests, tokens, or gas fees." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;
    const userMsg = text;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Mock Intelligence
    setTimeout(() => {
        let response = "I'm not sure about that. Try asking about quests or trending tokens.";
        const lower = userMsg.toLowerCase();
        
        if (lower.includes('quest') || lower.includes('earn')) {
            response = "Recommendation: The 'Daily Swap Challenge' is currently offering 2x XP. It's an optimal use of your time.";
        } else if (lower.includes('token') || lower.includes('buy') || lower.includes('price')) {
            response = "Market Scan: $BRETT is up 12% in the last hour. $DEGEN volume is spiking. Proceed with caution, agent.";
        } else if (lower.includes('gas') || lower.includes('fees')) {
            response = "Network Status: Gas is exceptionally low (0.01 gwei). It's a perfect time to bridge or mint.";
        } else if (lower.includes('hello') || lower.includes('hi')) {
             response = "Greetings. Ready to optimize your onchain footprint.";
        } else if (lower.includes('analysis') || lower.includes('scan')) {
             response = "Running deep scan... \n\nLiquidity looks healthy on Aerodrome for ETH/USDC. No suspicious contract interactions detected in your recent history.";
        }

        setMessages(prev => [...prev, { role: 'ai', text: response }]);
        setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-4 border-b border-cyan-900/30 bg-slate-900 flex justify-between items-center shadow-lg shadow-cyan-900/10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center">
                    <Bot size={24} className="text-cyan-400" />
                </div>
                <div>
                    <h3 className="font-bold text-cyan-50 text-lg">OpenClaw AI</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                        <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">Online</span>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-900 border border-cyan-900/30 text-cyan-50 rounded-bl-none shadow-[0_0_15px_-3px_rgba(8,145,178,0.1)]'
                    }`}>
                        {m.text}
                    </div>
                </div>
            ))}
            {isTyping && (
                 <div className="flex justify-start">
                    <div className="bg-slate-900 border border-cyan-900/30 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150"></span>
                    </div>
                </div>
            )}
        </div>

        {/* Suggestions */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
            {['Best Quests?', 'Gas Price', 'Analyze $DEGEN', 'Bridge Help'].map(s => (
                <button 
                    key={s} 
                    onClick={() => handleSend(s)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-800/30 text-cyan-400 text-xs font-bold hover:bg-cyan-900/50 hover:border-cyan-500/50 transition-colors"
                >
                    {s}
                </button>
            ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-cyan-900/30">
            <div className="flex gap-2">
                <input 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600"
                    placeholder="Ask OpenClaw..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-black p-3 rounded-xl transition-colors font-bold"
                >
                    <SendHorizontal size={20} />
                </button>
            </div>
        </div>
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
                 <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
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

// --- NFT Mint Portal Component ---
const NFTPortal: React.FC<{ onAction: (msg: string) => void }> = ({ onAction }) => {
  const [activeTab, setActiveTab] = useState<'drops' | 'create'>('drops');
  const [loading, setLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
      name: '',
      symbol: '',
      price: '',
      supply: '1000',
      image: null as File | null
  });

  // Mock Drops
  const drops = [
    { id: 1, name: 'Based Punks', price: '0.01 ETH', minted: 4200, supply: 10000, img: 'https://picsum.photos/400/400?random=20', author: '@punk_dev' },
    { id: 2, name: 'Onchain Summer', price: 'FREE', minted: 85420, supply: 100000, img: 'https://picsum.photos/400/400?random=21', badge: 'Trending', author: '@base' },
    { id: 3, name: 'Base Apes', price: '0.05 ETH', minted: 120, supply: 5000, img: 'https://picsum.photos/400/400?random=22', author: '@ape_labs' },
  ];

  const handleMint = (name: string) => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        onAction(`Minted ${name} successfully! +100 XP`);
    }, 2000);
  }

  const handleDeploy = () => {
      if(!createForm.name || !createForm.symbol) return;
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          onAction(`Deployed collection ${createForm.name} ($${createForm.symbol})!`);
          setActiveTab('drops');
      }, 2000);
  }

  return (
     <div className="space-y-6 fade-in pt-2">
        {/* Header */}
        <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 flex items-center gap-2">
            <Sparkles className="text-pink-400" /> NFT Portal
            </h2>
            <div className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-xs font-bold text-slate-400">
                Gas: <span className="text-green-400">Low</span>
            </div>
        </div>

        {/* Tabs */}
         <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button 
                onClick={() => setActiveTab('drops')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'drops' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}
            >
                <Flame size={16} /> Hot Drops
            </button>
            <button 
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'create' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}
            >
                <Palette size={16} /> Create
            </button>
        </div>

        {activeTab === 'drops' && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4">
                {drops.map(drop => (
                    <div key={drop.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden group hover:border-slate-700 transition-colors">
                        <div className="relative h-48">
                            <img src={drop.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80" />
                            {drop.badge && (
                                <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                    <Flame size={10} fill="currentColor" /> {drop.badge}
                                </div>
                            )}
                            <div className="absolute bottom-3 left-4 right-4">
                                <h3 className="text-xl font-bold text-white mb-1">{drop.name}</h3>
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-slate-300">by {drop.author}</span>
                                    <span className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white border border-white/10">
                                        {drop.price}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between text-xs text-slate-400 mb-2">
                                <span>Total Minted</span>
                                <span>{Math.round((drop.minted / drop.supply) * 100)}% ({drop.minted}/{drop.supply})</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{width: `${(drop.minted / drop.supply) * 100}%`}} />
                            </div>
                            <Button fullWidth onClick={() => handleMint(drop.name)} isLoading={loading} className="bg-slate-800 hover:bg-slate-700">
                                Mint Now
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        {activeTab === 'create' && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                    <div className="text-center mb-2">
                        <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto flex items-center justify-center mb-3 text-pink-500">
                            <Palette size={32} />
                        </div>
                        <h3 className="font-bold text-lg">Deploy NFT Collection</h3>
                        <p className="text-xs text-slate-400">Launch an ERC-721 collection on Base instantly.</p>
                    </div>

                    <div className="flex justify-center">
                        <div className="w-32 h-32 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 hover:border-pink-500 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group">
                            {createForm.image ? (
                                <img src={URL.createObjectURL(createForm.image)} className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <ImageIcon className="text-slate-500 mb-2 group-hover:text-pink-500" size={24} />
                                    <span className="text-[10px] text-slate-500 font-bold">Cover Image</span>
                                </>
                            )}
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setCreateForm({...createForm, image: e.target.files?.[0] || null})} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-400 ml-1">Collection Name</label>
                            <input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-pink-500 transition-colors" placeholder="e.g. Base Cats" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-400 ml-1">Symbol</label>
                                <input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-pink-500 transition-colors" placeholder="BCAT" value={createForm.symbol} onChange={e => setCreateForm({...createForm, symbol: e.target.value})} />
                            </div>
                             <div>
                                <label className="text-xs font-bold text-slate-400 ml-1">Supply</label>
                                <input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-pink-500 transition-colors" placeholder="1000" value={createForm.supply} onChange={e => setCreateForm({...createForm, supply: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 ml-1">Mint Price (ETH)</label>
                            <input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-pink-500 transition-colors" placeholder="0.00" value={createForm.price} onChange={e => setCreateForm({...createForm, price: e.target.value})} />
                        </div>
                    </div>

                    <Button fullWidth onClick={handleDeploy} isLoading={loading} className="bg-pink-600 hover:bg-pink-500">
                        Deploy Collection
                    </Button>
                </div>
            </div>
        )}
     </div>
  )
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
  const [view, setView] = useState<'market' | 'launch' | 'manage'>('market');
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
      setView('market');
      const buyMsg = launchForm.initialBuy ? ` & Bought ${launchForm.initialBuy} ETH` : '';
      onAction(`Launched $${launchForm.ticker.toUpperCase()}${buyMsg}! +500 XP`);
    }, 2000);
  };

  const handleTrade = (type: 'buy' | 'sell') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('market');
      onAction(`Successfully ${type === 'buy' ? 'bought' : 'sold'} ${selectedToken?.ticker}`);
    }, 1500);
  };

  const isTradeView = !!selectedToken;

  // Helper for tabs
  const NavTab = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => { setView(id); setSelectedToken(null); }}
      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
        view === id && !isTradeView ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="space-y-6 fade-in pt-2">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 flex items-center gap-2">
          <Rocket className="text-orange-500" /> Launchpad
        </h2>
        {!isTradeView && view === 'market' && (
           <div className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-yellow-500/20">
              <Zap size={12} fill="currentColor" /> Earn 500 XP
           </div>
        )}
      </div>

      {/* Navigation Bar */}
      {!isTradeView && (
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <NavTab id="market" label="Market" icon={TrendingUp} />
            <NavTab id="launch" label="Launch" icon={Rocket} />
            <NavTab id="manage" label="Manage" icon={Briefcase} /> 
        </div>
      )}

      {/* Views */}
      {isTradeView && selectedToken ? (
         <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
             {/* Header */}
             <div className="flex items-center gap-2 mb-2">
               <button onClick={() => setSelectedToken(null)} className="p-1 hover:bg-slate-800 rounded">
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
      ) : (
        <>
            {view === 'market' && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                {/* Trending List */}
                <div className="space-y-3">
                    {tokens.map(token => (
                        <div 
                        key={token.id} 
                        onClick={() => setSelectedToken(token)}
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

            {view === 'launch' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">Create Token</h3>
                    </div>

                    <div className="space-y-4">
                    {/* Image Upload Area */}
                    <div className="flex justify-center">
                        <div className="relative group">
                            <div className={`w-24 h-24 rounded-2xl bg-slate-950 border-2 border-dashed ${launchForm.image ? 'border-orange-500' : 'border-slate-700 hover:border-orange-500'} flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden`}>
                                {launchForm.image ? (
                                    <img src={URL.createObjectURL(launchForm.image)} className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <ImageIcon className="text-slate-500 mb-1 group-hover:text-orange-500 transition-colors" size={24} />
                                        <span className="text-[10px] text-slate-500 font-bold group-hover:text-orange-400 transition-colors">UPLOAD</span>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                    onChange={(e) => setLaunchForm({...launchForm, image: e.target.files?.[0] || null})}
                                />
                            </div>
                            
                            {launchForm.image && (
                                <button 
                                    onClick={() => setLaunchForm({...launchForm, image: null})}
                                    className="absolute -top-2 -right-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-500 rounded-full p-1.5 shadow-xl transition-all z-20"
                                    title="Remove Image"
                                >
                                    <X size={12} />
                                </button>
                            )}
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
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-white flex items-center gap-1">
                                    <Zap size={12} className="text-yellow-400" /> Initial Buy (Snipe)
                                </span>
                                <span className="text-[10px] text-slate-500">Optional</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white outline-none w-full font-mono focus:border-orange-500"
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

            {view === 'manage' && (
                <div className="text-center py-10 space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                        <Briefcase size={32} className="text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white">No active deployments</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                        Tokens you launch or hold significantly will appear here for quick management.
                    </p>
                    <Button variant="secondary" onClick={() => setView('launch')}>
                        Launch New Token
                    </Button>
                </div>
            )}
        </>
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

const ShareModal: React.FC<{ quest: Quest; onClose: () => void; onConfirm: () => void }> = ({ quest, onClose, onConfirm }) => {
  const [text, setText] = useState(`I'm taking on the "${quest.title}" quest on BaseQuest! 🛡️\n\nRank up with me 🚀`);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-800 shadow-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Share Progress</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex gap-3 items-center">
           {quest.imageUrl && <img src={quest.imageUrl} className="w-12 h-12 rounded-lg object-cover" />}
           <div>
              <h4 className="font-bold text-sm text-white">{quest.title}</h4>
              <p className="text-xs text-slate-400">+{quest.rewards[0]?.value || 0} XP Reward</p>
           </div>
        </div>

        <textarea 
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500 min-h-[100px] resize-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex gap-2">
           <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
           <Button className="flex-1 bg-purple-600 hover:bg-purple-500" onClick={onConfirm}>
              <Share2 size={16} className="mr-2" /> Cast
           </Button>
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

const FilterBar: React.FC<{ current: string; onChange: (v: string) => void; children?: React.ReactNode }> = ({ current, onChange, children }) => {
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
    <div className="sticky top-0 bg-slate-950/95 z-20 backdrop-blur-sm pb-4 pt-2 -mx-4 px-4 border-b border-slate-800/50">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
          {filters.map(f => {
            const active = current === f.id;
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => onChange(f.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  active 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                {Icon && <Icon size={12} className={active ? 'text-white' : 'text-slate-500'} />}
                {f.label}
              </button>
            );
          })}
        </div>
        {children}
      </div>
    </div>
  );
};

const SortSheet: React.FC<{ 
  current: SortOption; 
  onSelect: (option: SortOption) => void; 
  onClose: () => void;
}> = ({ current, onSelect, onClose }) => {
  const options: { id: SortOption; label: string; icon: any }[] = [
    { id: 'recommended', label: 'Recommended', icon: Star },
    { id: 'reward', label: 'Highest Reward', icon: Zap },
    { id: 'expiring', label: 'Expiring Soon', icon: Clock },
    { id: 'newest', label: 'Newest Arrivals', icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-slate-900 w-full max-w-md rounded-t-3xl border-t border-slate-800 p-6 flex flex-col slide-in-from-bottom-10 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold">Sort Quests</h3>
           <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="space-y-2">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { onSelect(opt.id); onClose(); }}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                current === opt.id ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50' : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <opt.icon size={18} />
                <span className="font-bold">{opt.label}</span>
              </div>
              {current === opt.id && <Check size={18} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const SpotlightCard: React.FC<{ quest: Quest; onClick: () => void }> = ({ quest, onClick }) => (
  <div onClick={onClick} className="relative w-full aspect-[2/1] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-5 overflow-hidden shadow-2xl mb-6 cursor-pointer group">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white blur-[60px] opacity-20 rounded-full group-hover:opacity-30 transition-opacity"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
         <div className="flex justify-between items-start">
            <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest flex items-center gap-1">
               <Star size={10} fill="currentColor" /> Spotlight
            </span>
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg">
                <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">+{quest.rewards[0].value} XP</span>
            </div>
         </div>
         
         <div>
            <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{quest.title}</h2>
            <p className="text-white/80 text-sm line-clamp-1">{quest.description}</p>
         </div>
      </div>
  </div>
);

// --- Profile / Portfolio Components ---

const ProfilePortfolio: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'nfts' | 'history'>('overview');
  const [nftFilter, setNftFilter] = useState<'all' | 'collectibles' | 'badges'>('all');

  // Enhanced Mock Data
  const assets = [
    { symbol: 'ETH', name: 'Ethereum', balance: '1.42', price: 2680.00, value: 3805.60, change: 2.4, allocation: 65, icon: 'bg-blue-500' },
    { symbol: 'USDC', name: 'USD Coin', balance: '420.00', price: 1.00, value: 420.00, change: 0.01, allocation: 8, icon: 'bg-green-500' },
    { symbol: 'DEGEN', name: 'Degen', balance: '69,420', price: 0.012, value: 833.04, change: -5.2, allocation: 15, icon: 'bg-purple-500' },
    { symbol: 'BRETT', name: 'Brett', balance: '5,000', price: 0.08, value: 400.00, change: 12.5, allocation: 7, icon: 'bg-blue-400' },
    { symbol: 'AERO', name: 'Aerodrome', balance: '250', price: 1.20, value: 300.00, change: -1.5, allocation: 5, icon: 'bg-blue-600' },
  ];

  const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);

  const nfts = [
    { id: 1, name: 'Based Punk #420', collection: 'Based Punks', floor: 0.45, type: 'collectibles', image: 'https://picsum.photos/300/300?r=53' },
    { id: 2, name: 'Base Early Adopter', collection: 'Base Badges', floor: 0, type: 'badges', image: 'https://picsum.photos/300/300?r=50' },
    { id: 3, name: 'Streak Master', collection: 'Base Badges', floor: 0, type: 'badges', image: 'https://picsum.photos/300/300?r=51' },
    { id: 4, name: 'Onchain Summer', collection: 'OEA', floor: 0.005, type: 'collectibles', image: 'https://picsum.photos/300/300?r=52' },
    { id: 5, name: 'Base Ape #12', collection: 'Base Apes', floor: 0.12, type: 'collectibles', image: 'https://picsum.photos/300/300?r=55' },
  ];

  const filteredNfts = nftFilter === 'all' ? nfts : nfts.filter(n => n.type === nftFilter);

  const history = [
    { id: 1, action: 'Quest Complete', title: 'Daily Swap Challenge', time: '2h ago', amount: '+100 XP', type: 'quest' },
    { id: 2, action: 'Mint', title: 'Base Dawn Collection', time: '5h ago', amount: '-0.002 ETH', type: 'out' },
    { id: 3, action: 'Swap', title: '0.1 ETH → 260 USDC', time: '1d ago', amount: '$260.00', type: 'swap' },
    { id: 4, action: 'Reward Claim', title: 'Weekly Streak Bonus', time: '2d ago', amount: '+100 XP', type: 'quest' },
    { id: 5, action: 'Bridge', title: 'Mainnet → Base', time: '3d ago', amount: '+1.5 ETH', type: 'in' },
    { id: 6, action: 'Approve', title: 'Uniswap V3', time: '4d ago', amount: 'USDC', type: 'tx' },
  ];

  const Tabs = () => (
    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800 sticky top-0 z-20 shadow-lg shadow-black/20">
      {['overview', 'assets', 'nfts', 'history'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab as any)}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg capitalize transition-all ${
             activeTab === tab 
             ? 'bg-slate-800 text-white shadow-md border border-slate-700' 
             : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  return (
    <div className="fade-in pb-10">
      {/* Header Profile Card */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 mb-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 blur-[100px] opacity-20 rounded-full"></div>
         
         <div className="flex items-center gap-5 relative z-10 mb-6">
            <div className="relative">
               <img src={user.pfpUrl} className="w-20 h-20 rounded-2xl border-2 border-slate-700 shadow-2xl object-cover" />
               <div className="absolute -bottom-2 -right-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                   <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        LVL 5
                   </div>
               </div>
            </div>
            <div>
               <h2 className="text-2xl font-bold text-white mb-1">{user.displayName}</h2>
               <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
                  <span>@{user.username}</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  <button className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors">
                      {user.address?.slice(0,6)}...{user.address?.slice(-4)} <Copy size={12} />
                  </button>
               </div>
            </div>
         </div>

         {/* Level Progress */}
         <div className="relative z-10 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 backdrop-blur-sm">
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
               <span className="flex items-center gap-1"><Zap size={12} className="text-yellow-400" /> XP Progress</span>
               <span>1,250 / 2,000 XP</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-[62%] animate-pulse"></div>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                <span>Rank #420</span>
                <span>Next Level: Master</span>
            </div>
         </div>
      </div>

      <Tabs />

      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
           {/* Net Worth Card */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
               <div className="relative z-10">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-xs font-bold uppercase flex items-center gap-1">
                         <Wallet size={12} /> Net Worth
                      </span>
                      <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                          <TrendingUp size={12} className="text-green-400" />
                          <span className="text-green-400 text-xs font-bold">+4.2%</span>
                      </div>
                   </div>
                   <div className="text-4xl font-bold text-white mb-6">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                   
                   {/* Mock Chart Area */}
                   <div className="h-24 w-full flex items-end justify-between gap-1 mb-4">
                      {[35, 42, 38, 55, 48, 60, 58, 72, 68, 85, 80, 100].map((h, i) => (
                          <div 
                            key={i} 
                            style={{ height: `${h}%` }} 
                            className={`flex-1 rounded-t-sm transition-all hover:opacity-100 ${i === 11 ? 'bg-blue-500 opacity-100' : 'bg-slate-800 opacity-60'}`}
                          ></div>
                      ))}
                   </div>
               </div>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                 <div>
                     <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Rewards</span>
                     <span className="text-xl font-bold text-yellow-400 flex items-center gap-1">
                        <Zap size={16} fill="currentColor" /> {user.points}
                     </span>
                 </div>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                 <div>
                     <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Streak</span>
                     <span className="text-xl font-bold text-orange-500 flex items-center gap-1">
                        <Flame size={16} fill="currentColor" /> {user.streak} Days
                     </span>
                 </div>
              </div>
           </div>

           {/* Protocol Allocation */}
           <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
               <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                   <PieChart size={16} className="text-purple-400" /> Asset Allocation
               </h3>
               <div className="flex h-4 rounded-full overflow-hidden mb-4">
                   {assets.map(asset => (
                       <div 
                         key={asset.symbol} 
                         style={{ width: `${asset.allocation}%` }} 
                         className={asset.icon}
                       ></div>
                   ))}
               </div>
               <div className="space-y-2">
                   {assets.slice(0,3).map(asset => (
                       <div key={asset.symbol} className="flex items-center justify-between text-xs">
                           <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${asset.icon}`}></div>
                               <span className="text-slate-300">{asset.name}</span>
                           </div>
                           <span className="text-slate-500 font-mono">{asset.allocation}%</span>
                       </div>
                   ))}
               </div>
           </div>
        </div>
      )}

      {activeTab === 'assets' && (
         <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-white">Your Tokens</h3>
                <span className="text-xs text-slate-500">Value: ${totalValue.toLocaleString()}</span>
            </div>

            {assets.map(asset => (
               <div key={asset.symbol} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full ${asset.icon} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                        {asset.symbol[0]}
                     </div>
                     <div>
                        <div className="font-bold text-white flex items-center gap-2">
                            {asset.name} 
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">${asset.symbol}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            {asset.balance} <span className="w-1 h-1 bg-slate-700 rounded-full"></span> ${asset.price}
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="font-bold text-white">${asset.value}</div>
                     <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${asset.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.change > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(asset.change)}%
                     </div>
                  </div>
               </div>
            ))}
            
            <button className="w-full py-3 rounded-xl border border-dashed border-slate-700 text-slate-500 text-xs font-bold hover:bg-slate-900/50 hover:text-slate-300 transition-colors flex items-center justify-center gap-2">
                <Plus size={14} /> Add Custom Token
            </button>
         </div>
      )}

      {activeTab === 'nfts' && (
         <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {['all', 'collectibles', 'badges'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setNftFilter(f as any)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors border ${
                            nftFilter === f 
                            ? 'bg-purple-600 text-white border-purple-500' 
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
               {filteredNfts.map(nft => (
                  <div key={nft.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden group hover:border-purple-500/50 transition-colors">
                     <div className="aspect-square bg-slate-950 relative overflow-hidden">
                        <img src={nft.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] text-white font-bold border border-white/10 uppercase tracking-wide">
                           {nft.type}
                        </div>
                     </div>
                     <div className="p-3">
                        <h4 className="font-bold text-xs truncate text-white mb-1">{nft.name}</h4>
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="truncate max-w-[60%]">{nft.collection}</span>
                            {nft.floor > 0 && <span className="text-slate-400 font-mono">{nft.floor} ETH</span>}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {activeTab === 'history' && (
         <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            {history.map((item, idx) => (
               <div key={item.id} className="flex gap-4 relative pl-2 group">
                  {/* Timeline Line */}
                  {idx !== history.length - 1 && (
                      <div className="absolute left-[19px] top-8 bottom-[-16px] w-[2px] bg-slate-800 group-hover:bg-slate-700 transition-colors"></div>
                  )}
                  
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center z-10 shrink-0 shadow-lg ${
                      item.type === 'success' || item.type === 'quest' ? 'bg-green-900/20 border-green-500/30 text-green-500' :
                      item.type === 'out' ? 'bg-red-900/20 border-red-500/30 text-red-500' :
                      item.type === 'in' ? 'bg-blue-900/20 border-blue-500/30 text-blue-500' :
                      'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                     {item.type === 'success' || item.type === 'quest' ? <CheckCircle2 size={16} /> :
                      item.type === 'out' ? <ArrowRight size={16} className="-rotate-45" /> :
                      item.type === 'in' ? <ArrowRight size={16} className="rotate-135" /> :
                      <Activity size={16} />
                     }
                  </div>
                  
                  <div className="flex-1 pb-4 border-b border-slate-800/50 group-last:border-0">
                     <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-sm text-white">{item.title}</h4>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.action}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                     </div>
                     <div className={`mt-1 text-xs font-bold font-mono inline-block px-2 py-0.5 rounded border ${
                         item.type === 'quest' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                         item.type === 'out' ? 'bg-slate-800 text-slate-300 border-slate-700' :
                         'bg-slate-800 text-white border-slate-700'
                     }`}>
                        {item.amount}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}
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
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [defiMode, setDefiMode] = useState<'swap' | 'bridge' | 'dca' | 'pool' | 'earn'>('swap');
  
  // OpenClaw AI State
  const [showAI, setShowAI] = useState(false);
  
  // Share State
  const [sharingQuest, setSharingQuest] = useState<Quest | null>(null);

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

  const handleShareConfirm = () => {
    setSharingQuest(null);
    addToast('success', 'Shared to Farcaster', 'Your cast has been published!');
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

  // --- Discovery Engine Logic ---
  const displayQuests = useMemo(() => {
    if (!quests) return [];
    
    let result = [...quests];

    // 1. Filtering
    if (feedFilter !== 'all') {
      result = result.filter(q => {
        if (feedFilter === 'trending') return (q.popularity || 0) > 80;
        if (feedFilter === 'game') return q.type === QuestType.GAME;
        if (feedFilter === 'defi') return [QuestType.SWAP, QuestType.HOLD, QuestType.LIQUIDITY, QuestType.BRIDGE].includes(q.type);
        if (feedFilter === 'nft') return q.type === QuestType.MINT;
        if (feedFilter === 'social') return [QuestType.SOCIAL, QuestType.REFERRAL, QuestType.VOTE].includes(q.type);
        if (feedFilter === 'premium') return q.isPremium;
        return true;
      });
    }

    // 2. Sorting
    result.sort((a, b) => {
        if (sortOption === 'reward') {
            const valA = typeof a.rewards[0].value === 'number' ? a.rewards[0].value : 0;
            const valB = typeof b.rewards[0].value === 'number' ? b.rewards[0].value : 0;
            return valB - valA;
        }
        if (sortOption === 'expiring') {
            return a.expiryTime - b.expiryTime;
        }
        if (sortOption === 'newest') {
            // Simplified: Mock IDs or isNew flag
            if (a.isNew && !b.isNew) return -1;
            if (!a.isNew && b.isNew) return 1;
            return 0;
        }
        // Default: Recommended (Popularity + Status)
        const scoreA = (a.popularity || 50) + (a.status === QuestStatus.ACTIVE ? 100 : 0);
        const scoreB = (b.popularity || 50) + (b.status === QuestStatus.ACTIVE ? 100 : 0);
        return scoreB - scoreA;
    });

    return result;
  }, [quests, feedFilter, sortOption]);

  // Determine featured quest for 'Recommended' view
  const featuredQuest = useMemo(() => {
      if (feedFilter === 'all' && sortOption === 'recommended' && displayQuests.length > 0) {
          return displayQuests[0];
      }
      return null;
  }, [displayQuests, feedFilter, sortOption]);

  const listQuests = featuredQuest ? displayQuests.slice(1) : displayQuests;

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

            {view === 'nft' && <NFTPortal onAction={handleLaunchAction} />}

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
                <div className="grid grid-cols-3 gap-2">
                   <button onClick={() => { setView('defi'); setDefiMode('swap'); }} className="flex flex-col items-center group bg-slate-900/50 p-3 rounded-2xl hover:bg-slate-800 transition-colors border border-slate-800/50">
                      <div className="bg-blue-600/20 text-blue-400 p-2 rounded-xl mb-1 flex items-center justify-center group-active:scale-95 transition-transform border border-blue-600/30">
                         <ArrowLeftRight size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Swap</span>
                   </button>
                   <button onClick={() => { setView('defi'); setDefiMode('bridge'); }} className="flex flex-col items-center group bg-slate-900/50 p-3 rounded-2xl hover:bg-slate-800 transition-colors border border-slate-800/50">
                      <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-xl mb-1 flex items-center justify-center group-active:scale-95 transition-transform border border-indigo-600/30">
                         <ArrowRight size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Bridge</span>
                   </button>
                   <button onClick={() => { setView('nft'); }} className="flex flex-col items-center group bg-slate-900/50 p-3 rounded-2xl hover:bg-slate-800 transition-colors border border-slate-800/50">
                      <div className="bg-pink-600/20 text-pink-400 p-2 rounded-xl mb-1 flex items-center justify-center group-active:scale-95 transition-transform border border-pink-600/30">
                         <Sparkles size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Mint</span>
                   </button>
                   <button onClick={() => { setView('defi'); setDefiMode('dca'); }} className="flex flex-col items-center group bg-slate-900/50 p-3 rounded-2xl hover:bg-slate-800 transition-colors border border-slate-800/50">
                      <div className="bg-purple-600/20 text-purple-400 p-2 rounded-xl mb-1 flex items-center justify-center group-active:scale-95 transition-transform border border-purple-600/30">
                         <Repeat size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">DCA</span>
                   </button>
                   <button onClick={() => { setView('defi'); setDefiMode('pool'); }} className="flex flex-col items-center group bg-slate-900/50 p-3 rounded-2xl hover:bg-slate-800 transition-colors border border-slate-800/50">
                      <div className="bg-green-600/20 text-green-400 p-2 rounded-xl mb-1 flex items-center justify-center group-active:scale-95 transition-transform border border-green-600/30">
                         <Layers size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Pool</span>
                   </button>
                   <button onClick={() => { setView('defi'); setDefiMode('earn'); }} className="flex flex-col items-center group bg-slate-900/50 p-3 rounded-2xl hover:bg-slate-800 transition-colors border border-slate-800/50">
                      <div className="bg-emerald-600/20 text-emerald-400 p-2 rounded-xl mb-1 flex items-center justify-center group-active:scale-95 transition-transform border border-emerald-600/30">
                         <CircleDollarSign size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Earn</span>
                   </button>
                </div>

                {/* Discovery Feed */}
                <div>
                   <FilterBar current={feedFilter} onChange={setFeedFilter}>
                      <button 
                        onClick={() => setShowSortSheet(true)}
                        className="bg-slate-800 p-2 rounded-full text-slate-300 hover:text-white border border-slate-700 shadow-sm"
                      >
                        <ArrowUpDown size={16} />
                      </button>
                   </FilterBar>
                   
                   {/* Spotlight Section */}
                   {featuredQuest && (
                       <SpotlightCard quest={featuredQuest} onClick={() => setSelectedQuest(featuredQuest)} />
                   )}

                   <div className="space-y-3 mt-2 min-h-[300px]">
                     {listQuests.length > 0 ? (
                       listQuests.map(quest => (
                         <QuestCard 
                           key={quest.id} 
                           quest={quest} 
                           onClick={setSelectedQuest}
                           onShare={setSharingQuest}
                         />
                       ))
                     ) : (
                       <div className="text-center py-10 text-slate-500">
                         <div className="mb-2 text-4xl">🔭</div>
                         <p>No quests found in this category.</p>
                         <Button variant="ghost" onClick={() => setFeedFilter('all')} className="mt-2">Clear Filters</Button>
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

            {view === 'profile' && user && <ProfilePortfolio user={user} />}
             
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
      
      {/* OpenClaw AI FAB */}
      <button
        onClick={() => setShowAI(true)}
        className="fixed bottom-24 right-4 z-40 bg-cyan-500 hover:bg-cyan-400 text-black p-4 rounded-full shadow-lg shadow-cyan-500/20 transition-transform active:scale-95 animate-bounce-in flex items-center justify-center"
      >
        <Bot size={28} />
      </button>

      {/* Modals & Sheets */}
      {showAI && <OpenClawAI onClose={() => setShowAI(false)} />}

      {sharingQuest && (
        <ShareModal 
          quest={sharingQuest} 
          onClose={() => setSharingQuest(null)} 
          onConfirm={handleShareConfirm} 
        />
      )}

      {selectedQuest && (
        <QuestDetailModal 
           quest={selectedQuest} 
           user={user}
           onClose={() => setSelectedQuest(null)} 
           onClaim={handleClaim} 
        />
      )}
      
      {showSortSheet && (
        <SortSheet 
          current={sortOption} 
          onSelect={setSortOption} 
          onClose={() => setShowSortSheet(false)}
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