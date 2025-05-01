
import { MessageSquare } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-secondary/40 fade-in">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 slide-in-right">
          <MessageSquare className="h-6 w-6 text-primary pulse-on-hover" />
          <h1 className="text-xl font-bold">Telegram Bot Debugger</h1>
        </div>
        <div className="slide-in-right delay-200">
          <a 
            href="https://core.telegram.org/bots/api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline transition-all duration-300 hover:text-opacity-80"
          >
            Telegram Bot API Docs
          </a>
        </div>
      </div>
    </header>
  );
};
