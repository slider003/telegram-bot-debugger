import { useState, useEffect } from "react";

export interface StoredBot {
  token: string;
  botInfo?: {
    id: number;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
  };
  lastUsed: number;
}

const STORAGE_KEY = "telegram_bots";

export const useStoredBots = () => {
  const [storedBots, setStoredBots] = useState<StoredBot[]>([]);

  // Load stored bots on initialization
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const bots = JSON.parse(stored) as StoredBot[];
        setStoredBots(bots);
      }
    } catch (error) {
      console.error("Failed to load stored bots:", error);
    }
  }, []);

  const saveBots = (bots: StoredBot[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bots));
      setStoredBots(bots);
    } catch (error) {
      console.error("Failed to save bots:", error);
    }
  };

  const addBot = (token: string, botInfo?: StoredBot["botInfo"]) => {
    const existingIndex = storedBots.findIndex(bot => bot.token === token);
    const newBot: StoredBot = {
      token,
      botInfo,
      lastUsed: Date.now()
    };

    let updatedBots;
    if (existingIndex >= 0) {
      // Update existing bot
      updatedBots = [...storedBots];
      updatedBots[existingIndex] = newBot;
    } else {
      // Add new bot
      updatedBots = [...storedBots, newBot];
    }

    // Sort by last used (most recent first) and keep only last 10
    updatedBots.sort((a, b) => b.lastUsed - a.lastUsed);
    updatedBots = updatedBots.slice(0, 10);

    saveBots(updatedBots);
  };

  const removeBot = (token: string) => {
    const updatedBots = storedBots.filter(bot => bot.token !== token);
    saveBots(updatedBots);
  };

  const getBotInfo = async (token: string) => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();
      
      if (data.ok) {
        return data.result;
      } else {
        throw new Error(data.description || "Failed to get bot info");
      }
    } catch (error) {
      console.error("Failed to fetch bot info:", error);
      throw error;
    }
  };

  return {
    storedBots,
    addBot,
    removeBot,
    getBotInfo
  };
};
