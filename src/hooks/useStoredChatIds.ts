import { useState, useEffect } from "react";

export interface StoredChatId {
  chatId: string;
  chatInfo?: {
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  lastUsed: number;
}

const STORAGE_KEY = "telegram_chat_ids";

export const useStoredChatIds = () => {
  const [storedChatIds, setStoredChatIds] = useState<StoredChatId[]>([]);

  // Load stored chat IDs on initialization
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const chatIds = JSON.parse(stored) as StoredChatId[];
        setStoredChatIds(chatIds);
      }
    } catch (error) {
      console.error("Failed to load stored chat IDs:", error);
    }
  }, []);

  const saveChatIds = (chatIds: StoredChatId[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatIds));
      setStoredChatIds(chatIds);
    } catch (error) {
      console.error("Failed to save chat IDs:", error);
    }
  };

  const addChatId = (chatId: string, chatInfo?: StoredChatId["chatInfo"]) => {
    const existingIndex = storedChatIds.findIndex(stored => stored.chatId === chatId);
    const newChatId: StoredChatId = {
      chatId,
      chatInfo,
      lastUsed: Date.now()
    };

    let updatedChatIds;
    if (existingIndex >= 0) {
      // Update existing chat ID
      updatedChatIds = [...storedChatIds];
      updatedChatIds[existingIndex] = newChatId;
    } else {
      // Add new chat ID
      updatedChatIds = [...storedChatIds, newChatId];
    }

    // Sort by last used (most recent first) and keep only last 20
    updatedChatIds.sort((a, b) => b.lastUsed - a.lastUsed);
    updatedChatIds = updatedChatIds.slice(0, 20);

    saveChatIds(updatedChatIds);
  };

  const removeChatId = (chatId: string) => {
    const updatedChatIds = storedChatIds.filter(stored => stored.chatId !== chatId);
    saveChatIds(updatedChatIds);
  };

  return {
    storedChatIds,
    addChatId,
    removeChatId
  };
};
