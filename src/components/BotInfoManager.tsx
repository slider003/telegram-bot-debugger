import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Bot, RefreshCw, Save, Trash2, Globe } from "lucide-react";

interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
  max_connections?: number;
  allowed_updates?: string[];
}

interface BotInfoManagerProps {
  botToken: string;
  isConnected: boolean;
}

export const BotInfoManager = ({ botToken, isConnected }: BotInfoManagerProps) => {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [botName, setBotName] = useState("");
  const [botDescription, setBotDescription] = useState("");
  const [botShortDescription, setBotShortDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch bot info
  const fetchBotInfo = async () => {
    if (!botToken) return;

    setLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const data = await response.json();
      
      if (data.ok) {
        setBotInfo(data.result);
        setBotName(data.result.first_name);
      } else {
        toast({
          title: "Error",
          description: data.description || "Failed to fetch bot info",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bot information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch webhook info
  const fetchWebhookInfo = async () => {
    if (!botToken) return;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
      const data = await response.json();
      
      if (data.ok) {
        setWebhookInfo(data.result);
        setWebhookUrl(data.result.url || "");
      }
    } catch (error) {
      console.warn("Failed to fetch webhook info:", error);
    }
  };

  // Fetch bot description
  const fetchBotDescription = async () => {
    if (!botToken) return;

    try {
      const [descResponse, shortDescResponse] = await Promise.all([
        fetch(`https://api.telegram.org/bot${botToken}/getMyDescription`),
        fetch(`https://api.telegram.org/bot${botToken}/getMyShortDescription`)
      ]);
      
      const [descData, shortDescData] = await Promise.all([
        descResponse.json(),
        shortDescResponse.json()
      ]);
      
      if (descData.ok) {
        setBotDescription(descData.result.description || "");
      }
      if (shortDescData.ok) {
        setBotShortDescription(shortDescData.result.short_description || "");
      }
    } catch (error) {
      console.warn("Failed to fetch bot descriptions:", error);
    }
  };

  // Update bot name
  const updateBotName = async () => {
    if (!botToken || !botName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setMyName`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: botName.trim() })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        toast({
          title: "Success",
          description: "Bot name updated successfully",
        });
        fetchBotInfo();
      } else {
        toast({
          title: "Error",
          description: data.description || "Failed to update bot name",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bot name",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update bot description
  const updateBotDescription = async () => {
    if (!botToken) return;

    setLoading(true);
    try {
      const [descResponse, shortDescResponse] = await Promise.all([
        fetch(`https://api.telegram.org/bot${botToken}/setMyDescription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: botDescription })
        }),
        fetch(`https://api.telegram.org/bot${botToken}/setMyShortDescription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ short_description: botShortDescription })
        })
      ]);
      
      const [descData, shortDescData] = await Promise.all([
        descResponse.json(),
        shortDescResponse.json()
      ]);
      
      if (descData.ok && shortDescData.ok) {
        toast({
          title: "Success",
          description: "Bot descriptions updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update bot descriptions",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bot descriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set webhook
  const setWebhook = async () => {
    if (!botToken) return;

    setLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        toast({
          title: "Success",
          description: "Webhook set successfully",
        });
        fetchWebhookInfo();
      } else {
        toast({
          title: "Error",
          description: data.description || "Failed to set webhook",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set webhook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete webhook
  const deleteWebhook = async () => {
    if (!botToken) return;

    setLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.ok) {
        toast({
          title: "Success",
          description: "Webhook deleted successfully",
        });
        setWebhookUrl("");
        fetchWebhookInfo();
      } else {
        toast({
          title: "Error",
          description: data.description || "Failed to delete webhook",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && botToken) {
      fetchBotInfo();
      fetchWebhookInfo();
      fetchBotDescription();
    }
  }, [isConnected, botToken]);

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Bot Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bot Info */}
        {botInfo && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Bot Information</h3>
              <Button variant="outline" size="sm" onClick={fetchBotInfo} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>ID:</strong> {botInfo.id}</p>
                <p><strong>Username:</strong> @{botInfo.username}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={botInfo.can_join_groups ? "default" : "secondary"}>
                  {botInfo.can_join_groups ? "Can join groups" : "Cannot join groups"}
                </Badge>
                <Badge variant={botInfo.can_read_all_group_messages ? "default" : "secondary"}>
                  {botInfo.can_read_all_group_messages ? "Reads all messages" : "Privacy mode"}
                </Badge>
                <Badge variant={botInfo.supports_inline_queries ? "default" : "secondary"}>
                  {botInfo.supports_inline_queries ? "Inline queries" : "No inline"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Bot Name & Description */}
        <div className="space-y-4">
          <h3 className="font-semibold">Bot Profile</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bot-name">Bot Name</Label>
              <div className="flex gap-2">
                <Input
                  id="bot-name"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="Enter bot name"
                />
                <Button onClick={updateBotName} disabled={loading}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="bot-description">Description</Label>
              <Textarea
                id="bot-description"
                value={botDescription}
                onChange={(e) => setBotDescription(e.target.value)}
                placeholder="Enter bot description (up to 512 characters)"
                maxLength={512}
              />
            </div>
            <div>
              <Label htmlFor="bot-short-description">Short Description</Label>
              <Input
                id="bot-short-description"
                value={botShortDescription}
                onChange={(e) => setBotShortDescription(e.target.value)}
                placeholder="Enter short description (up to 120 characters)"
                maxLength={120}
              />
            </div>
            <Button onClick={updateBotDescription} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Update Descriptions
            </Button>
          </div>
        </div>

        <Separator />

        {/* Webhook Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Webhook Management
            </h3>
            <Button variant="outline" size="sm" onClick={fetchWebhookInfo} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {webhookInfo && (
            <div className="p-3 bg-muted rounded-md">
              <p><strong>Current URL:</strong> {webhookInfo.url || "Not set"}</p>
              <p><strong>Pending Updates:</strong> {webhookInfo.pending_update_count}</p>
              {webhookInfo.last_error_message && (
                <p className="text-destructive"><strong>Last Error:</strong> {webhookInfo.last_error_message}</p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                type="url"
              />
              <Button onClick={setWebhook} disabled={loading}>
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="destructive" onClick={deleteWebhook} disabled={loading}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};