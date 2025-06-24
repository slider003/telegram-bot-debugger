
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { validateBotToken } from "@/lib/utils";
import { Bot } from "lucide-react";

interface BotInfo {
  id: number;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

interface BotTokenInputProps {
  onConnect: (token: string, botInfo?: BotInfo) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  loading: boolean;
  selectedToken?: string;
}

export const BotTokenInput = ({ 
  onConnect, 
  onDisconnect,
  isConnected,
  loading,
  selectedToken 
}: BotTokenInputProps) => {
  const [inputToken, setInputToken] = useState("");
  const [validationError, setValidationError] = useState("");
  const [connectedToken, setConnectedToken] = useState("");
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);

  // Update input when selectedToken changes
  useEffect(() => {
    if (selectedToken && !isConnected) {
      setInputToken(selectedToken);
    }
  }, [selectedToken, isConnected]);

  // Clear input when disconnected
  useEffect(() => {
    if (!isConnected) {
      setInputToken(selectedToken || "");
      setConnectedToken("");
      setBotInfo(null);
      setValidationError("");
    }
  }, [isConnected, selectedToken]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputToken(e.target.value);
    setValidationError("");
  };

  const fetchBotInfo = async (token: string): Promise<BotInfo | null> => {
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
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate token format
    const error = validateBotToken(inputToken);
    if (error) {
      setValidationError(error);
      return;
    }
    
    setConnectedToken(inputToken);
    
    // Fetch bot info
    const info = await fetchBotInfo(inputToken);
    setBotInfo(info);
    
    onConnect(inputToken, info || undefined);
  };

  const handleDisconnect = () => {
    setInputToken("");
    setConnectedToken("");
    setBotInfo(null);
    setValidationError("");
    onDisconnect();
  };

  return (
    <Card className="mb-6 slide-in-up">
      <CardHeader>
        <CardTitle className="fade-in flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Connect Your Telegram Bot
        </CardTitle>
        <CardDescription className="fade-in delay-100">
          Enter your bot token to start receiving real-time updates. Your token is processed locally and will not be stored anywhere.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected && botInfo && (
          <div className="mb-4 p-3 bg-secondary/50 rounded-md fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4" />
              <span className="font-medium">{botInfo.first_name}</span>
              <span className="text-muted-foreground">@{botInfo.username}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {botInfo.can_join_groups && (
                <Badge variant="secondary" className="text-xs">Can join groups</Badge>
              )}
              {botInfo.can_read_all_group_messages && (
                <Badge variant="secondary" className="text-xs">Reads all messages</Badge>
              )}
              {botInfo.supports_inline_queries && (
                <Badge variant="secondary" className="text-xs">Inline queries</Badge>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 fade-in delay-200">
          <div className="flex-1">
            {isConnected ? (
              <div className="flex items-center h-10 pl-3 bg-secondary rounded-md">
                <span className="text-muted-foreground">
                  {connectedToken.substring(0, 5)}...{connectedToken.slice(-5)}
                </span>
              </div>
            ) : (
              <Input
                id="bot-token"
                type="password"
                placeholder="123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ"
                value={inputToken}
                onChange={handleInputChange}
                required
                className={validationError ? "border-destructive" : ""}
              />
            )}
            {validationError && (
              <p className="text-destructive text-sm mt-1 fade-in">{validationError}</p>
            )}
          </div>
          {isConnected ? (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDisconnect}
              className="transition-all duration-300 hover:scale-105"
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={loading || !inputToken.trim()}
              className="transition-all duration-300 hover:scale-105"
            >
              {loading ? "Connecting..." : "Connect"}
            </Button>
          )}
        </form>
        {isConnected && (
          <div className="mt-4 flex items-center fade-in">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm text-muted-foreground">
              Connected and listening for updates...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
