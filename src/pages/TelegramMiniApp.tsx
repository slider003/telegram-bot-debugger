
import { useState, useEffect } from "react";
import { BotTokenInput } from "@/components/BotTokenInput";
import { MessagesDisplay } from "@/components/MessagesDisplay";
import { MessageSender } from "@/components/MessageSender";
import { MiniAppHeader } from "@/components/MiniAppHeader";
import { EmptyState } from "@/components/EmptyState";
import { useTelegramBot } from "@/hooks/useTelegramBot";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

const TelegramMiniApp = () => {
  const [token, setToken] = useState<string>("");
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  
  const { 
    messages, 
    loading, 
    error, 
    connectBot, 
    disconnectBot, 
    isConnected
  } = useTelegramBot();

  const { webApp, user, isReady } = useTelegramWebApp();

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

  const handleConnect = (newToken: string) => {
    setToken(newToken);
    connectBot(newToken);
  };

  const handleDisconnect = () => {
    setToken("");
    setSelectedChatId("");
    disconnectBot();
  };

  const handleChatIdSelect = (chatId: string) => {
    setSelectedChatId(chatId);
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
        <BotTokenInput 
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          isConnected={isConnected}
          loading={loading}
        />
        
        {error && (
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-3 rounded-md my-3 text-sm">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
        )}

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
