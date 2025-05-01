
import { MessageSquare } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-secondary/40">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Telegram Bot Debugger</h1>
        </div>
        <div>
          <a 
            href="https://core.telegram.org/bots/api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Telegram Bot API Docs
          </a>
        </div>
      </div>
    </header>
  );
};
