
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
  const [error, setError] = useState<string | null>(null);
  
  // Store the latest update_id to avoid duplicate messages
  const lastUpdateIdRef = useRef<number>(-1);
  // Reference to the polling interval
  const pollingIntervalRef = useRef<number | null>(null);
  // Flag to identify first connection
  const isFirstFetchRef = useRef<boolean>(true);

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

  // Start polling Telegram API
  const startPolling = useCallback((botToken: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Initial fetch
    fetchUpdates(botToken);
    
    // Set up polling
    pollingIntervalRef.current = window.setInterval(() => {
      fetchUpdates(botToken);
    }, DEFAULT_POLLING_INTERVAL);
  }, [fetchUpdates]);

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
    
    // Reset message history and lastUpdateId when connecting a new bot
    setMessages([]);
    lastUpdateIdRef.current = -1;
    // Reset first fetch flag
    isFirstFetchRef.current = true;
    
    // Start polling updates
    startPolling(botToken);
    setIsConnected(true);
    setLoading(false);
    
    toast({
      title: "Connected to Telegram Bot",
      description: "Listening for incoming messages...",
    });
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
    error,
    isConnected,
    connectBot,
    disconnectBot,
  };
}
