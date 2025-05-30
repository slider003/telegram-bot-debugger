
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { validateBotToken } from "@/lib/utils";

interface BotTokenInputProps {
  onConnect: (token: string) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  loading: boolean;
}

export const BotTokenInput = ({ 
  onConnect, 
  onDisconnect,
  isConnected,
  loading 
}: BotTokenInputProps) => {
  const [inputToken, setInputToken] = useState("");
  const [validationError, setValidationError] = useState("");
  const [connectedToken, setConnectedToken] = useState("");

  // Clear input when disconnected
  useEffect(() => {
    if (!isConnected) {
      setInputToken("");
      setConnectedToken("");
      setValidationError("");
    }
  }, [isConnected]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputToken(e.target.value);
    setValidationError("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate token format
    const error = validateBotToken(inputToken);
    if (error) {
      setValidationError(error);
      return;
    }
    
    setConnectedToken(inputToken);
    onConnect(inputToken);
  };

  const handleDisconnect = () => {
    setInputToken("");
    setConnectedToken("");
    setValidationError("");
    onDisconnect();
  };

  return (
    <Card className="mb-6 slide-in-up">
      <CardHeader>
        <CardTitle className="fade-in">Connect Your Telegram Bot</CardTitle>
        <CardDescription className="fade-in delay-100">
          Enter your bot token to start receiving real-time updates. Your token is processed locally and will not be stored anywhere.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
