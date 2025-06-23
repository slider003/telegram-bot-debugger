
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MessageSenderProps {
  botToken: string;
  onChatIdSelect?: (chatId: string) => void;
}

export const MessageSender = ({ botToken, onChatIdSelect }: MessageSenderProps) => {
  const [chatId, setChatId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!chatId.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please enter both chat ID and message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        toast({
          title: "Message sent successfully",
          description: `Sent to chat ID: ${chatId}`,
        });
        setMessage("");
      } else {
        throw new Error(data.description || "Failed to send message");
      }
    } catch (err: any) {
      toast({
        title: "Failed to send message",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Send Message
        </CardTitle>
        <CardDescription>
          Send messages as your bot to any chat ID or username
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Chat ID or Username
          </label>
          <Input
            placeholder="@username or chat ID (e.g., 123456789)"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            Message
          </label>
          <Textarea
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>
        <Button 
          onClick={sendMessage} 
          disabled={sending || !chatId.trim() || !message.trim()}
          className="w-full"
        >
          {sending ? "Sending..." : "Send Message"}
        </Button>
      </CardContent>
    </Card>
  );
};
