
import { useState, ChangeEvent, FormEvent } from "react";
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
    
    onConnect(inputToken);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Connect Your Telegram Bot</CardTitle>
        <CardDescription>
          Enter your bot token to start receiving real-time updates. Your token is processed locally and will not be stored anywhere.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            {isConnected ? (
              <div className="flex items-center h-10 pl-3 bg-secondary rounded-md">
                <span className="text-muted-foreground">
                  {inputToken.substring(0, 5)}...{inputToken.slice(-5)}
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
              <p className="text-destructive text-sm mt-1">{validationError}</p>
            )}
          </div>
          {isConnected ? (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={loading || !inputToken.trim()}
            >
              {loading ? "Connecting..." : "Connect"}
            </Button>
          )}
        </form>
        {isConnected && (
          <div className="mt-4 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-sm text-muted-foreground">
              Connected and listening for updates...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
