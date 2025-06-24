
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bot, Trash2 } from "lucide-react";
import { StoredBot } from "@/hooks/useStoredBots";

interface BotSelectorProps {
  storedBots: StoredBot[];
  onSelectBot: (token: string) => void;
  onRemoveBot: (token: string) => void;
}

export const BotSelector = ({ storedBots, onSelectBot, onRemoveBot }: BotSelectorProps) => {
  const [selectedToken, setSelectedToken] = useState<string>("");

  const handleSelect = (token: string) => {
    setSelectedToken(token);
    onSelectBot(token);
  };

  if (storedBots.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Saved Bots
        </CardTitle>
        <CardDescription>
          Select from your previously used bots
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select onValueChange={handleSelect} value={selectedToken}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a saved bot..." />
          </SelectTrigger>
          <SelectContent>
            {storedBots.map((bot) => (
              <SelectItem key={bot.token} value={bot.token}>
                <div className="flex items-center gap-2">
                  {bot.botInfo ? (
                    <>
                      <span className="font-medium">{bot.botInfo.first_name}</span>
                      <span className="text-muted-foreground">@{bot.botInfo.username}</span>
                    </>
                  ) : (
                    <span>{bot.token.substring(0, 5)}...{bot.token.slice(-5)}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2">
          {storedBots.map((bot) => (
            <div key={bot.token} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex-1">
                {bot.botInfo ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bot.botInfo.first_name}</span>
                      <span className="text-sm text-muted-foreground">@{bot.botInfo.username}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {bot.botInfo.can_join_groups && (
                        <Badge variant="secondary" className="text-xs">Groups</Badge>
                      )}
                      {bot.botInfo.supports_inline_queries && (
                        <Badge variant="secondary" className="text-xs">Inline</Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm">{bot.token.substring(0, 10)}...</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveBot(bot.token)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
