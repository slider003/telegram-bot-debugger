
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { JsonView } from "./JsonView";
import { TelegramUpdate } from "@/types/telegram";

interface MessageCardProps {
  message: TelegramUpdate;
  viewMode: "structured" | "raw";
}

export const MessageCard = ({ message, viewMode }: MessageCardProps) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(message, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const messageObj = message.message;
  
  // Try to extract important information
  const messageText = messageObj?.text || '';
  const messageDate = messageObj?.date ? formatDate(messageObj.date) : '';
  const chatId = messageObj?.chat?.id;
  const userId = messageObj?.from?.id;
  const firstName = messageObj?.from?.first_name || '';
  const lastName = messageObj?.from?.last_name || '';

  return (
    <div className="p-4 hover:bg-secondary/30 transition-colors duration-200 message-container relative">
      {copied && (
        <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs opacity-90">
          Copied
        </div>
      )}
      
      {viewMode === "structured" ? (
        <div>
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs">
                #{message.update_id}
              </div>
              {messageDate && (
                <span className="text-xs text-muted-foreground">{messageDate}</span>
              )}
            </div>
            <div className="message-actions">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyToClipboard}
                className="h-6 text-xs transition-opacity duration-200"
              >
                Copy JSON
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            {messageObj && (
              <>
                {(firstName || lastName) && (
                  <div>
                    <span className="text-muted-foreground text-xs mr-2">From:</span>
                    <span>{firstName} {lastName}</span>
                    {userId && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (ID: {userId})
                      </span>
                    )}
                  </div>
                )}
                
                {chatId && (
                  <div>
                    <span className="text-muted-foreground text-xs mr-2">Chat ID:</span>
                    <code>{chatId}</code>
                  </div>
                )}

                {messageText && (
                  <div className="mt-1 bg-secondary p-3 rounded-md transition-colors duration-200">
                    <span className="text-muted-foreground text-xs block mb-1">Message:</span>
                    <p className="whitespace-pre-wrap">{messageText}</p>
                  </div>
                )}
              </>
            )}

            <div className="mt-2 pt-2 border-t border-border">
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Show all fields
                </summary>
                <div className="mt-2 p-3 bg-secondary/60 rounded-md overflow-x-auto">
                  <JsonView data={message} />
                </div>
              </details>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between mb-2">
            <div className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs">
              #{message.update_id}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyToClipboard}
              className="h-6 text-xs transition-opacity duration-200"
            >
              Copy JSON
            </Button>
          </div>
          <div className="bg-secondary/60 p-3 rounded-md overflow-x-auto transition-colors duration-200">
            <pre className="text-sm">
              <code>{JSON.stringify(message, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
