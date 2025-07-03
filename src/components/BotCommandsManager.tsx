
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Plus, Trash2, Save, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BotCommand {
  command: string;
  description: string;
}

interface BotCommandsManagerProps {
  botToken: string;
  isConnected: boolean;
}

export const BotCommandsManager = ({ botToken, isConnected }: BotCommandsManagerProps) => {
  const [commands, setCommands] = useState<BotCommand[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCommand, setNewCommand] = useState({ command: "", description: "" });
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch current bot commands
  const fetchCommands = async () => {
    if (!botToken || !isConnected) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMyCommands`);
      const data = await response.json();
      
      if (data.ok) {
        setCommands(data.result || []);
      } else {
        throw new Error(data.description || "Failed to fetch commands");
      }
    } catch (error: any) {
      toast({
        title: "Error fetching commands",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set bot commands
  const saveCommands = async () => {
    if (!botToken || !isConnected) return;
    
    setSaving(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commands: commands
        }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        toast({
          title: "Commands updated",
          description: "Bot commands have been successfully updated.",
        });
      } else {
        throw new Error(data.description || "Failed to update commands");
      }
    } catch (error: any) {
      toast({
        title: "Error updating commands",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Load commands when bot connects
  useEffect(() => {
    if (isConnected && botToken) {
      fetchCommands();
    } else {
      setCommands([]);
    }
  }, [isConnected, botToken]);

  const addCommand = () => {
    if (!newCommand.command.trim() || !newCommand.description.trim()) {
      toast({
        title: "Invalid command",
        description: "Please enter both command and description.",
        variant: "destructive",
      });
      return;
    }

    // Validate command format (should start with letter, contain only letters, digits, and underscores)
    if (!/^[a-z][a-z0-9_]*$/i.test(newCommand.command)) {
      toast({
        title: "Invalid command format",
        description: "Command should start with a letter and contain only letters, digits, and underscores.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    if (commands.some(cmd => cmd.command === newCommand.command)) {
      toast({
        title: "Duplicate command",
        description: "This command already exists.",
        variant: "destructive",
      });
      return;
    }

    setCommands([...commands, { ...newCommand }]);
    setNewCommand({ command: "", description: "" });
  };

  const removeCommand = (commandToRemove: string) => {
    setCommands(commands.filter(cmd => cmd.command !== commandToRemove));
  };

  const updateCommand = (index: number, field: 'command' | 'description', value: string) => {
    const updatedCommands = [...commands];
    updatedCommands[index][field] = value;
    setCommands(updatedCommands);
  };

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <CardTitle>Bot Commands</CardTitle>
            <Badge variant="secondary">{commands.length} commands</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Hide" : "Show"}
          </Button>
        </div>
        <CardDescription>
          Manage your bot's command menu that users see when typing "/"
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCommands}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={saveCommands}
              disabled={saving || commands.length === 0}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {/* Add new command */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Command
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Command (e.g., start)"
                value={newCommand.command}
                onChange={(e) => setNewCommand({ ...newCommand, command: e.target.value })}
              />
              <div className="md:col-span-2">
                <Input
                  placeholder="Description (e.g., Start the bot)"
                  value={newCommand.description}
                  onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={addCommand} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Command
            </Button>
          </div>

          {/* Commands table */}
          {commands.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Command</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commands.map((command, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-1">/</span>
                          <Input
                            value={command.command}
                            onChange={(e) => updateCommand(index, 'command', e.target.value)}
                            className="h-8 border-none p-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={command.description}
                          onChange={(e) => updateCommand(index, 'description', e.target.value)}
                          className="min-h-[2rem] resize-none border-none p-1"
                          rows={1}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCommand(command.command)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No commands configured</p>
              <p className="text-sm">Add commands to create a menu for your bot users</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
