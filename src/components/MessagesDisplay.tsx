
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { MessageCard } from "./MessageCard";
import { TelegramUpdate } from "@/types/telegram";

interface MessagesDisplayProps {
  messages: TelegramUpdate[];
}

export const MessagesDisplay = ({ messages }: MessagesDisplayProps) => {
  const [view, setView] = useState<"structured" | "raw">("structured");

  if (messages.length === 0) {
    return (
      <div className="flex-1 border border-border rounded-md bg-card p-6 flex items-center justify-center slide-in-up">
        <p className="text-muted-foreground">
          Connected and waiting for new messages...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col border border-border rounded-md bg-card overflow-hidden fade-in">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border slide-in-right">
        <h2 className="font-semibold">
          Messages ({messages.length})
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">View:</span>
          <div className="flex bg-secondary rounded-md">
            <Toggle
              pressed={view === "structured"} 
              onPressedChange={() => setView("structured")}
              className="rounded-r-none data-[state=on]:bg-primary/20 transition-all duration-200"
              size="sm"
            >
              Structured
            </Toggle>
            <Toggle
              pressed={view === "raw"} 
              onPressedChange={() => setView("raw")}
              className="rounded-l-none data-[state=on]:bg-primary/20 transition-all duration-200" 
              size="sm"
            >
              Raw JSON
            </Toggle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigator.clipboard.writeText(JSON.stringify(messages, null, 2))}
            className="transition-transform duration-200 pulse-on-hover"
          >
            Copy All
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {[...messages].reverse().map((message, index) => (
            <div key={message.update_id} className={`message-enter delay-${Math.min(index * 100, 300)}`} style={{animationDelay: `${Math.min(index * 0.05, 0.3)}s`}}>
              <MessageCard 
                message={message} 
                viewMode={view}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
