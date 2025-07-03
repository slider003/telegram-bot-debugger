
import { useState, useEffect } from "react";
import { BotTokenInput } from "@/components/BotTokenInput";
import { BotSelector } from "@/components/BotSelector";
import { MessagesDisplay } from "@/components/MessagesDisplay";
import { MessageSender } from "@/components/MessageSender";
import { MiniAppHeader } from "@/components/MiniAppHeader";
import { EmptyState } from "@/components/EmptyState";
import { BotCommandsManager } from "@/components/BotCommandsManager";
import { useTelegramBot } from "@/hooks/useTelegramBot";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useStoredBots } from "@/hooks/useStoredBots";
import { useStoredChatIds } from "@/hooks/useStoredChatIds";
import { ChatIdSelector } from "@/components/ChatIdSelector";

const TelegramMiniApp = () => {
  const [token, setToken] = useState<string>("");
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("");
  
  const { 
    messages, 
    loading, 
    error, 
    connectBot, 
    disconnectBot, 
    isConnected
  } = useTelegramBot();

  const { webApp, user, isReady } = useTelegramWebApp();
  const { storedBots, addBot, removeBot } = useStoredBots();
  const { storedChatIds, addChatId, removeChatId } = useStoredChatIds();

  // Auto-fill chat ID with current user's ID if available
  useEffect(() => {
    if (user && !selectedChatId) {
      setSelectedChatId(user.id.toString());
    }
  }, [user, selectedChatId]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnectBot();
      }
    };
  }, [isConnected, disconnectBot]);

  // Add effect to store chat IDs from incoming messages
  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach(message => {
        if (message.message?.chat) {
          const chatId = message.message.chat.id.toString();
          const chatInfo = {
            type: message.message.chat.type,
            title: message.message.chat.title,
            username: message.message.chat.username,
            first_name: message.message.chat.first_name,
            last_name: message.message.chat.last_name
          };
          addChatId(chatId, chatInfo);
        }
      });
    }
  }, [messages, addChatId]);

  const handleConnect = (newToken: string, botInfo?: any) => {
    setToken(newToken);
    connectBot(newToken);
    
    // Store bot info
    if (botInfo) {
      addBot(newToken, botInfo);
    }
  };

  const handleDisconnect = () => {
    setToken("");
    setSelectedChatId("");
    setSelectedToken("");
    disconnectBot();
  };

  const handleChatIdSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    // Also store this as a used chat ID
    addChatId(chatId);
  };

  const handleRemoveChatId = (chatId: string) => {
    removeChatId(chatId);
    if (selectedChatId === chatId) {
      setSelectedChatId("");
    }
  };

  const handleBotSelect = (token: string) => {
    setSelectedToken(token);
  };

  const handleRemoveBot = (token: string) => {
    removeBot(token);
    if (selectedToken === token) {
      setSelectedToken("");
    }
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading Telegram Mini App...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MiniAppHeader user={user} />
      
      <main className="flex-1 container mx-auto p-3 flex flex-col max-w-md">
        <BotSelector 
          storedBots={storedBots}
          onSelectBot={handleBotSelect}
          onRemoveBot={handleRemoveBot}
        />

        <BotTokenInput 
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          isConnected={isConnected}
          loading={loading}
          selectedToken={selectedToken}
        />
        
        {error && (
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-3 rounded-md my-3 text-sm">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
        )}

        <BotCommandsManager 
          botToken={token}
          isConnected={isConnected}
        />

        <ChatIdSelector 
          storedChatIds={storedChatIds}
          onSelectChatId={handleChatIdSelect}
          onRemoveChatId={handleRemoveChatId}
          selectedChatId={selectedChatId}
        />

        {isConnected && (
          <MessageSender 
            botToken={token}
            selectedChatId={selectedChatId}
            onChatIdSelect={handleChatIdSelect}
          />
        )}

        {isConnected ? (
          <MessagesDisplay 
            messages={messages} 
            onChatIdSelect={handleChatIdSelect}
          />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};

export default TelegramMiniApp;
