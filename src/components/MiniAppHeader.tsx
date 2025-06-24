
import { User } from "lucide-react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface MiniAppHeaderProps {
  user?: TelegramUser | null;
}

export const MiniAppHeader = ({ user }: MiniAppHeaderProps) => {
  return (
    <header className="bg-card border-b border-border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">Bot Debugger</h1>
            {user && (
              <p className="text-xs text-muted-foreground">
                {user.first_name} {user.last_name}
              </p>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Mini App
        </div>
      </div>
    </header>
  );
};
