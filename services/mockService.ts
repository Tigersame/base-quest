import { MOCK_QUESTS } from '../constants';
import { Quest, QuestStatus } from '../types';

export const fetchQuests = async (): Promise<Quest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_QUESTS);
    }, 800);
  });
};

export const verifyQuestOnChain = async (questId: string, walletAddress: string): Promise<boolean> => {
  // Simulate checking smart contracts or events
  console.log(`Verifying quest ${questId} for ${walletAddress}...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Always return true for MVP demo
      resolve(true);
    }, 2000);
  });
};

export const claimQuestReward = async (questId: string): Promise<{ success: boolean; txHash: string }> => {
    return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, txHash: '0x1234...abcd' });
    }, 1500);
  });
}