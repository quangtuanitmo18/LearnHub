'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chatbot';
import { LogIn, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

// Dynamic imports - default arrow function components
const ChatMessage = dynamic(() => import('./chat-message'), {
  ssr: false,
});

const ChatInput = dynamic(() => import('./chat-input'), {
  ssr: false,
});

interface ChatbotDialogProps {
  onClose: () => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isAuthenticated?: boolean;
}

const ChatbotDialog = ({
  onClose,
  messages,
  onSendMessage,
  isLoading = false,
  isAuthenticated = true,
}: ChatbotDialogProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      id="chatbot-dialog"
      role="dialog"
      aria-labelledby="chatbot-title"
      aria-describedby="chatbot-description"
      className={cn(
        'fixed right-4 bottom-20 z-[100] border shadow-2xl sm:right-6 sm:bottom-28',
        'h-[calc(100vh-6rem)] w-[calc(100vw-2rem)] sm:h-[580px] sm:w-[400px] md:h-[640px] md:w-[450px]',
        'max-h-[calc(100vh-5rem)] max-w-[calc(100vw-1rem)] sm:max-h-[calc(100vh-8rem)] sm:max-w-[calc(100vw-3rem)]',
        'gap-0 overflow-hidden rounded-2xl p-0',
        'flex flex-col',
        'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-8 duration-300',
      )}
    >
      {/* Enhanced Glass Background with Multiple Layers like header */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-xl"></div>
      <div className="absolute inset-0 rounded-2xl bg-white/90 backdrop-blur-xl"></div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-blue-500/5 to-purple-500/5"></div>

      {/* Subtle border with gradient like header */}
      <div className="absolute inset-0 rounded-2xl border border-gray-200/50 shadow-2xl shadow-purple-500/10"></div>
      <div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      {/* Content container */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <div className="relative flex flex-row items-center justify-between border-b border-gray-200/50 p-4 pb-3 sm:p-6 sm:pb-4">
          {/* Enhanced header background like main header */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-blue-700/5 to-purple-600/5"></div>
          <div className="absolute inset-0 bg-white/50"></div>

          <div className="relative flex items-center gap-3 sm:gap-4">
            <div className="relative">
              {/* Simple chatbot icon */}
              <div className="flex h-8 w-8 items-center justify-center sm:h-10 sm:w-10">
                <Image
                  src="/images/chatbot.png"
                  alt="AI Assistant"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <div>
              <h2
                id="chatbot-title"
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-lg font-bold text-transparent sm:text-xl"
              >
                AI Assistant
              </h2>
              <p
                id="chatbot-description"
                className="text-xs font-medium tracking-wide text-gray-500 sm:text-sm"
              >
                Here to help you learn <span aria-hidden="true">✨</span>
              </p>
            </div>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className={cn(
              'group relative h-8 w-8 rounded-full transition-all duration-300 sm:h-9 sm:w-9',
              'text-gray-500 hover:text-blue-600',
              'hover:bg-linear-to-br hover:from-blue-50 hover:via-blue-100/50 hover:to-purple-50',
              'border border-transparent hover:border-blue-100 hover:shadow-lg hover:shadow-blue-200/20',
              'hover:scale-110 active:scale-95',
            )}
            aria-label="Close chat"
          >
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-blue-500/8 group-hover:to-purple-500/8"></div>
            <X className="relative z-10 h-3 w-3 transition-transform duration-300 group-hover:scale-110 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 overflow-x-hidden overflow-y-auto border-r border-gray-200/30 bg-white/90 px-3 pt-3 backdrop-blur-sm sm:px-4 sm:pt-4"
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
        >
          {!isAuthenticated ? (
            <div className="animate-fade-in-slow flex h-full flex-col items-center justify-center p-2 text-center sm:p-4">
              <div className="relative mb-4 sm:mb-6">
                {/* Floating Orbs Animation */}
                <div className="bg-brand-purple-primary/30 animate-float absolute -top-2 -left-2 h-3 w-3 rounded-full sm:h-4 sm:w-4" />
                <div className="bg-brand-indigo-primary/40 animate-float-delay-1 absolute -top-1 -right-3 h-2 w-2 rounded-full sm:h-3 sm:w-3" />
                <div className="bg-brand-purple-light/50 animate-float-delay-2 absolute -right-1 -bottom-2 h-1 w-1 rounded-full sm:h-2 sm:w-2" />

                <div className="relative mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 to-purple-600 shadow-lg transition-all duration-300 hover:shadow-xl sm:h-20 sm:w-20">
                  <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent"></div>
                  <LogIn className="animate-float relative z-10 h-8 w-8 text-white sm:h-10 sm:w-10" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl dark:text-white">
                Sign in to chat with AI 🔐
              </h3>
              <p className="mb-4 max-w-[280px] px-2 text-xs leading-relaxed text-gray-600 sm:mb-6 sm:max-w-[300px] sm:text-sm dark:text-gray-300">
                You need to sign in to use the AI Assistant feature. Sign in now to get help with
                courses and learning questions.
              </p>
              <Link href="/auth/sign-in" className="w-full max-w-[180px] sm:max-w-[200px]">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm text-white hover:from-blue-700 hover:to-purple-700 sm:text-base"
                  size="lg"
                >
                  <LogIn className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Sign in now
                </Button>
              </Link>
            </div>
          ) : messages.length === 0 ? (
            <div className="animate-fade-in-slow flex h-full flex-col items-center justify-center p-2 text-center sm:p-4">
              <div className="relative mb-4 sm:mb-6">
                {/* Simple chatbot icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                  <Image
                    src="/images/chatbot.png"
                    alt="AI Assistant"
                    width={80}
                    height={80}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl dark:text-white">
                Welcome to AI Assistant! 👋
              </h3>
              <p className="mb-4 max-w-[280px] px-2 text-xs leading-relaxed text-gray-600 sm:mb-6 sm:max-w-[300px] sm:text-sm dark:text-gray-300">
                I&apos;m here to help you with your learning journey. Ask me anything about courses,
                lessons, or general questions.
              </p>
              <div className="text-brand-purple-primary dark:text-brand-purple-light flex items-center gap-2 text-xs font-medium sm:text-sm">
                <div className="bg-brand-purple-primary h-2 w-2 animate-pulse rounded-full" />
                Start by typing a message below
              </div>
            </div>
          ) : (
            <div className="min-h-0 w-full max-w-full space-y-2 break-words sm:space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="w-full max-w-full overflow-hidden break-words">
                  <ChatMessage
                    message={message.text}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                    courses={message.courses}
                    suggestions={message.suggestions}
                    intent={message.intent}
                    onSuggestionClick={(suggestion) => onSendMessage(suggestion)}
                  />
                </div>
              ))}
              {isLoading && (
                <div className="w-full max-w-full">
                  <ChatMessage message="" isUser={false} isLoading={true} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="relative z-20 shrink-0">
            <ChatInput
              onSendMessage={onSendMessage}
              disabled={isLoading}
              placeholder="Ask me anything about your learning..."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotDialog;
