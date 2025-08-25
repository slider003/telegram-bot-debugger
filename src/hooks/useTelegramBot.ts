
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
  // Error counter for retry logic
  const errorCountRef = useRef<number>(0);
  const maxRetries = 3;

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

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Function to fetch updates from Telegram API
  const fetchUpdates = useCallback(async (botToken: string) => {
    try {
      // Build the URL with the offset parameter to avoid getting duplicate messages
      const offset = lastUpdateIdRef.current > -1 ? lastUpdateIdRef.current + 1 : undefined;
      
      // For the very first fetch when connecting, always use an offset to prevent loading old messages
      const url = `https://api.telegram.org/bot${botToken}/getUpdates${
        offset ? `?offset=${offset}` : '?offset=-1'
      }`;
      
      console.log("Fetching updates from:", url);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check if it's an authentication error (should disconnect)
        if (response.status === 401 || response.status === 403) {
          console.error("Authentication error:", errorData);
          setError(`Authentication failed: ${errorData.description || 'Invalid bot token'}`);
          setIsConnected(false);
          stopPolling();
          return;
        }
        
        // For other errors, increment error count and retry
        errorCountRef.current++;
        console.warn(`API error (attempt ${errorCountRef.current}):`, errorData);
        
        if (errorCountRef.current >= maxRetries) {
          setError(`API error after ${maxRetries} attempts: ${errorData.description || `HTTP ${response.status}`}`);
          setIsConnected(false);
          stopPolling();
          return;
        }
        
        // Don't throw, just return to continue polling
        return;
      }
      
      const data = await response.json();
      
      if (!data.ok) {
        // Handle Telegram API errors
        console.error("Telegram API error:", data);
        
        // Check for token-related errors
        if (data.error_code === 401 || data.description?.includes('token')) {
          setError(`Bot token error: ${data.description}`);
          setIsConnected(false);
          stopPolling();
          return;
        }
        
        // For other API errors, retry with backoff
        errorCountRef.current++;
        if (errorCountRef.current >= maxRetries) {
          setError(`Telegram API error: ${data.description || "Unknown error"}`);
          setIsConnected(false);
          stopPolling();
          return;
        }
        
        return;
      }
      
      // Success - reset error counter
      errorCountRef.current = 0;
      
      // Process updates
      if (data.result && data.result.length > 0) {
        console.log(`Received ${data.result.length} new updates`);
        // Find the highest update_id
        const highestUpdateId = Math.max(...data.result.map((update: TelegramUpdate) => update.update_id));
        lastUpdateIdRef.current = highestUpdateId;
        
        // Add new messages to the state
        setMessages(prev => [...prev, ...data.result]);
      }

      // Mark first fetch as complete
      if (isFirstFetchRef.current) {
        isFirstFetchRef.current = false;
        console.log("First fetch completed successfully");
      }
      
      // Clear any previous errors
      setError(null);
      
    } catch (err: any) {
      console.error("Network error:", err);
      errorCountRef.current++;
      
      if (errorCountRef.current >= maxRetries) {
        setError(`Network error after ${maxRetries} attempts: ${err.message}`);
        setIsConnected(false);
        stopPolling();
      }
      
      // For network errors, don't immediately disconnect - let it retry
    }
  }, [stopPolling]);


  // Start polling Telegram API
  const startPolling = useCallback((botToken: string) => {
    // Reset error counter when starting new polling session
    errorCountRef.current = 0;
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Delete webhook first to avoid conflicts, then start polling
    deleteWebhook(botToken).then(() => {
      // Set up polling for new messages
      pollingIntervalRef.current = window.setInterval(() => {
        fetchUpdates(botToken);
      }, DEFAULT_POLLING_INTERVAL);
    }).catch((err) => {
      console.warn("Failed to delete webhook before polling:", err);
      // Continue with polling anyway
      pollingIntervalRef.current = window.setInterval(() => {
        fetchUpdates(botToken);
      }, DEFAULT_POLLING_INTERVAL);
    });
  }, [fetchUpdates, deleteWebhook]);

  // Connect to the bot
  const connectBot = useCallback((botToken: string) => {
    setLoading(true);
    setError(null);
    setToken(botToken);
    
    // Reset message history and refs when connecting a new bot
    setMessages([]);
    lastUpdateIdRef.current = -1;
    // Reset flags
    isFirstFetchRef.current = true;
    errorCountRef.current = 0;
    
    try {
      // Start polling updates
      startPolling(botToken);
      setIsConnected(true);
      
      toast({
        title: "Connected to Telegram Bot",
        description: "Listening for new messages...",
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
    error,
    isConnected,
    connectBot,
    disconnectBot,
  };
}
