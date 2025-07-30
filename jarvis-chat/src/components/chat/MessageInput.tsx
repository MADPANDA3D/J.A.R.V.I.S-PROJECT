import React, { KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { ToolsSelector } from './ToolsSelector';
import { useTools } from '@/hooks/useTools';
import { screenReader } from '@/lib/accessibility';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSendMessage: (message: string, selectedTools?: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showToolsSelector?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...',
  className = '',
  showToolsSelector = true,
}) {
  const { getSelectedToolIds } = useTools();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () {
    if (!value.trim() || disabled) return;

    // Get selected tools if tools selector is enabled
    const selectedTools = showToolsSelector ? getSelectedToolIds() : undefined;

    // Announce sending action
    screenReader.announce({
      message: `Sending message: ${value.slice(0, 50)}${value.length > 50 ? '...' : ''}`,
      priority: 'polite',
    });

    onSendMessage(value.trim(), selectedTools);
  };

  // Focus management for better accessibility
  useEffect(() {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  return (
    <div
      className={`flex flex-col gap-2 ${className}`}
      role="group"
      aria-label="Message composition area"
    >
      {/* Tools Selector Row */}
      {showToolsSelector && (
        <div className="flex justify-end">
          <ToolsSelector compact={false} />
        </div>
      )}

      {/* Message Input Row */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label htmlFor="message-input" className="sr-only">
            Type your message to JARVIS
          </label>
          <textarea
            id="message-input"
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full min-h-[44px] max-h-32 px-3 py-2 text-sm bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground"
            style={{
              resize: 'none',
              height: 'auto',
              minHeight: '44px',
              maxHeight: '128px',
            }}
            onInput={e => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
            aria-describedby="message-input-help"
            aria-required="true"
          />
          <div id="message-input-help" className="sr-only">
            Press Enter to send your message, or Shift+Enter for a new line
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          size="sm"
          className="h-11 px-3 bg-primary hover:bg-primary/90 text-primary-foreground"
          aria-label={`Send message${value.trim() ? `: ${value.slice(0, 30)}${value.length > 30 ? '...' : ''}` : ''}`}
          type="submit"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};
