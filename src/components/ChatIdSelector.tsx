
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Trash2 } from "lucide-react";
import { StoredChatId } from "@/hooks/useStoredChatIds";

interface ChatIdSelectorProps {
  storedChatIds: StoredChatId[];
  onSelectChatId: (chatId: string) => void;
  onRemoveChatId: (chatId: string) => void;
  selectedChatId?: string;
}

export const ChatIdSelector = ({ 
  storedChatIds, 
  onSelectChatId, 
  onRemoveChatId, 
  selectedChatId 
}: ChatIdSelectorProps) => {
  if (storedChatIds.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Recent Chat IDs
        </CardTitle>
        <CardDescription>
          Select from previously used chat IDs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select onValueChange={onSelectChatId} value={selectedChatId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a recent chat ID..." />
          </SelectTrigger>
          <SelectContent>
            {storedChatIds.map((stored) => (
              <SelectItem key={stored.chatId} value={stored.chatId}>
                <div className="flex items-center gap-2">
                  <code className="text-sm">{stored.chatId}</code>
                  {stored.chatInfo && (
                    <span className="text-muted-foreground text-sm">
                      {stored.chatInfo.title || stored.chatInfo.first_name || stored.chatInfo.username}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2">
          {storedChatIds.slice(0, 5).map((stored) => (
            <div key={stored.chatId} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">{stored.chatId}</code>
                  {stored.chatInfo && (
                    <>
                      <Badge variant="outline" className="text-xs">
                        {stored.chatInfo.type}
                      </Badge>
                      {stored.chatInfo.title && (
                        <span className="text-sm text-muted-foreground">{stored.chatInfo.title}</span>
                      )}
                      {stored.chatInfo.first_name && (
                        <span className="text-sm text-muted-foreground">
                          {stored.chatInfo.first_name} {stored.chatInfo.last_name}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveChatId(stored.chatId)}
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
