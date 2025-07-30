import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <Bot className="w-4 h-4 text-secondary-foreground" />
        </div>
      </div>

      {/* Typing Animation */}
      <div className="flex flex-col max-w-xs lg:max-w-md">
        <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              JARVIS is typing
            </span>
            <div className="flex gap-1 ml-2">
              <div
                className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
