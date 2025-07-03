
import { useState, useEffect } from "react";
import { BotTokenInput } from "@/components/BotTokenInput";
import { MessagesDisplay } from "@/components/MessagesDisplay";
import { MessageSender } from "@/components/MessageSender";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";
import { BotCommandsManager } from "@/components/BotCommandsManager";
import { useTelegramBot } from "@/hooks/useTelegramBot";

const Index = () => {
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

  // Cleanup on component unmount or page refresh
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 flex flex-col">
        <BotTokenInput 
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          isConnected={isConnected}
          loading={loading}
        />
        
        {error && (
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-4 rounded-md my-4">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
        )}

        <BotCommandsManager 
          botToken={token}
          isConnected={isConnected}
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
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Telegram Bot Debugger • All data is processed in your browser only</p>
        <p className="mt-1">No data is stored on any server</p>
      </footer>
    </div>
  );
};

export default Index;
