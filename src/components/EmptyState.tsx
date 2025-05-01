
import { MessageSquare } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
      <div className="bg-secondary/40 p-5 rounded-full">
        <MessageSquare className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold">No Messages Yet</h2>
      <p className="text-muted-foreground max-w-md">
        Connect your Telegram bot using the token input above to start receiving real-time message updates.
      </p>
      <div className="mt-6 max-w-md text-left text-sm space-y-3 bg-secondary/40 p-4 rounded-md">
        <h3 className="font-semibold">How to use this debugger:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter your Telegram bot token above</li>
          <li>Send messages to your bot from Telegram</li>
          <li>View the messages and their structure in real-time</li>
        </ol>
        <p className="pt-2">
          All data is processed in your browser only. No information is stored or sent to any server except Telegram's API.
        </p>
      </div>
    </div>
  );
};
