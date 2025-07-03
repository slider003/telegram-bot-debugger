
import { useState, useRef, useCallback, useEffect } from "react";
import { TelegramUpdate } from "@/types/telegram";
import { toast } from "@/hooks/use-toast";

// Default polling interval in milliseconds
const DEFAULT_POLLING_INTERVAL = 2000;

export function useTelegramBot() {
  const [token, setToken] = useState<string>("");
  const [messages, setMessages] = useState<TelegramUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store the latest update_id to avoid duplicate messages
  const lastUpdateIdRef = useRef<number>(-1);
  // Store the earliest update_id for loading history
  const earliestUpdateIdRef = useRef<number>(-1);
  // Reference to the polling interval
  const pollingIntervalRef = useRef<number | null>(null);
  // Flag to identify first connection
  const isFirstFetchRef = useRef<boolean>(true);
  // Flag to check if we've loaded initial history
  const hasLoadedInitialHistoryRef = useRef<boolean>(false);

  // Function to delete webhook before polling
  const deleteWebhook = useCallback(async (botToken: string) => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);
      const data = await response.json();
      
      if (!data.ok) {
        console.warn("Failed to delete webhook:", data.description);
      }
    } catch (err) {
      console.warn("Error deleting webhook:", err);
      // Don't throw here as this is just a precaution
    }
  }, []);

  // Function to fetch updates from Telegram API
  const fetchUpdates = useCallback(async (botToken: string) => {
    try {
      // Build the URL with the offset parameter to avoid getting duplicate messages
      const offset = lastUpdateIdRef.current > -1 ? lastUpdateIdRef.current + 1 : undefined;
      
      // For the very first fetch when connecting, always use an offset to prevent loading old messages
      const url = `https://api.telegram.org/bot${botToken}/getUpdates${
        offset || isFirstFetchRef.current ? `?offset=${offset || -1}` : ''
      }`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || `HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.description || "Unknown error from Telegram API");
      }
      
      // Process updates
      if (data.result && data.result.length > 0) {
        // Find the highest update_id
        const highestUpdateId = Math.max(...data.result.map((update: TelegramUpdate) => update.update_id));
        lastUpdateIdRef.current = highestUpdateId;
        
        // Add new messages to the state
        setMessages(prev => [...prev, ...data.result]);
      }

      // Mark first fetch as complete
      if (isFirstFetchRef.current) {
        isFirstFetchRef.current = false;
      }
      
      // Clear any previous errors
      setError(null);
      
    } catch (err: any) {
      setError(`Failed to fetch updates: ${err.message}`);
      setIsConnected(false);
      stopPolling();
    }
  }, []);

  // Function to load historical messages
  const loadHistoricalMessages = useCallback(async (botToken: string, limit: number = 10) => {
    if (!botToken || loadingHistory) return;
    
    setLoadingHistory(true);
    try {
      // Calculate offset for historical messages
      const offset = earliestUpdateIdRef.current > 0 ? earliestUpdateIdRef.current - limit : undefined;
      
      const url = `https://api.telegram.org/bot${botToken}/getUpdates${
        offset ? `?offset=${offset}&limit=${limit}` : `?limit=${limit}`
      }`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || `HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.description || "Unknown error from Telegram API");
      }
      
      // Process historical updates
      if (data.result && data.result.length > 0) {
        // Filter out messages we already have
        const existingUpdateIds = new Set(messages.map(msg => msg.update_id));
        const newMessages = data.result.filter((update: TelegramUpdate) => !existingUpdateIds.has(update.update_id));
        
        if (newMessages.length > 0) {
          // Find the lowest update_id for future historical loading
          const lowestUpdateId = Math.min(...newMessages.map((update: TelegramUpdate) => update.update_id));
          earliestUpdateIdRef.current = lowestUpdateId;
          
          // Add historical messages to the beginning of the state
          setMessages(prev => [...newMessages, ...prev]);
        }
      }
      
    } catch (err: any) {
      setError(`Failed to load historical messages: ${err.message}`);
    } finally {
      setLoadingHistory(false);
    }
  }, [messages, loadingHistory]);

  // Function to load initial 10 messages when connecting
  const loadInitialHistory = useCallback(async (botToken: string) => {
    if (hasLoadedInitialHistoryRef.current) return;
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=10`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || `HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.description || "Unknown error from Telegram API");
      }
      
      // Process initial updates
      if (data.result && data.result.length > 0) {
        // Find the highest and lowest update_ids
        const updateIds = data.result.map((update: TelegramUpdate) => update.update_id);
        const highestUpdateId = Math.max(...updateIds);
        const lowestUpdateId = Math.min(...updateIds);
        
        lastUpdateIdRef.current = highestUpdateId;
        earliestUpdateIdRef.current = lowestUpdateId;
        
        // Set initial messages
        setMessages(data.result);
      }
      
      hasLoadedInitialHistoryRef.current = true;
      
    } catch (err: any) {
      console.warn("Failed to load initial history:", err.message);
      // Don't throw here, continue with normal polling
    }
  }, []);

  // Start polling Telegram API
  const startPolling = useCallback((botToken: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Delete webhook first to avoid conflicts, then load initial history and start polling
    deleteWebhook(botToken).then(async () => {
      // Load initial 10 messages first
      await loadInitialHistory(botToken);
      
      // Set up polling for new messages
      pollingIntervalRef.current = window.setInterval(() => {
        fetchUpdates(botToken);
      }, DEFAULT_POLLING_INTERVAL);
    }).catch(async (err) => {
      console.warn("Failed to delete webhook before polling:", err);
      // Continue with loading initial history and polling anyway
      await loadInitialHistory(botToken);
      pollingIntervalRef.current = window.setInterval(() => {
        fetchUpdates(botToken);
      }, DEFAULT_POLLING_INTERVAL);
    });
  }, [fetchUpdates, deleteWebhook, loadInitialHistory]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Connect to the bot
  const connectBot = useCallback((botToken: string) => {
    setLoading(true);
    setError(null);
    setToken(botToken);
    
    // Reset message history and refs when connecting a new bot
    setMessages([]);
    lastUpdateIdRef.current = -1;
    earliestUpdateIdRef.current = -1;
    // Reset flags
    isFirstFetchRef.current = true;
    hasLoadedInitialHistoryRef.current = false;
    
    try {
      // Start polling updates
      startPolling(botToken);
      setIsConnected(true);
      
      toast({
        title: "Connected to Telegram Bot",
        description: "Loading recent messages and listening for new ones...",
      });
    } catch (err: any) {
      setError(`Connection failed: ${err.message}`);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [startPolling]);

  // Disconnect from the bot
  const disconnectBot = useCallback(() => {
    stopPolling();
    setToken("");
    setIsConnected(false);
    setError(null);
    
    // We intentionally don't clear messages here so users can still see previous data
    // until they refresh or connect to another bot
    
    toast({
      title: "Disconnected from Telegram Bot",
      description: "No longer receiving updates.",
    });
  }, [stopPolling]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    messages,
    loading,
    loadingHistory,
    error,
    isConnected,
    connectBot,
    disconnectBot,
    loadHistoricalMessages: (limit?: number) => loadHistoricalMessages(token, limit),
  };
}
