'use client';

import { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...',
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSendMessage(trimmedMessage);
    setMessage('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  const canSend = message.trim() && !disabled;

  return (
    <div className="border-t border-gray-200/50 bg-white/90 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="p-3 sm:p-4">
        <div
          className={cn(
            'flex items-end gap-2 rounded-xl p-2 sm:gap-3 sm:p-3',
            'border bg-white shadow-sm',
            isFocused ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200',
          )}
        >
          {/* Attachment Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 sm:h-8 sm:w-8"
            disabled={disabled}
            aria-label="Attach file"
          >
            <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          {/* Input Field */}
          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              className="border-0 bg-transparent px-0 py-1 text-sm shadow-none placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 sm:py-2 sm:text-base"
              autoComplete="off"
              aria-label="Type your message to the AI assistant"
              aria-describedby="chat-input-help"
            />
            <div id="chat-input-help" className="sr-only">
              Press Enter to send your message, or Shift+Enter for a new line
            </div>
          </div>

          {/* Emoji Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-lg text-gray-400 hover:bg-purple-50 hover:text-purple-600 sm:h-8 sm:w-8"
            disabled={disabled}
            aria-label="Add emoji"
          >
            <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          {/* Send Button */}
          <Button
            type="submit"
            size="icon"
            disabled={!canSend}
            className={cn(
              'h-8 w-8 shrink-0 rounded-lg sm:h-10 sm:w-10',
              canSend
                ? 'bg-linear-to-br from-blue-600 to-purple-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-400',
            )}
            aria-label="Send message"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
