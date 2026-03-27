'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, X } from 'lucide-react';
import { TbMessageCircleFilled } from 'react-icons/tb';
interface ChatbotButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const ChatbotButton = ({ isOpen, onClick }: ChatbotButtonProps) => {
  return (
    <div className="animate-fade-in-up fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {/* Enhanced Glass Background with Multiple Layers */}
      <div className="absolute inset-0 rounded-full">
        {/* Base gradient background */}
        <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-600 via-blue-700 to-purple-600 opacity-90 transition-all duration-500" />
        {/* Glass overlay */}
        <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-xl transition-all duration-500" />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500" />
      </div>

      {/* Floating Animation Ring */}
      <div
        className={cn(
          'absolute inset-0 rounded-full transition-all duration-500',
          'animate-pulse bg-linear-to-br from-blue-500/30 via-purple-500/30 to-blue-600/30',
          isOpen ? 'scale-125 opacity-40' : 'scale-110 opacity-20',
        )}
      />

      {/* Pulsing outer ring - radiating effect */}
      <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20 opacity-75" />

      {/* Main Button */}
      <Button
        onClick={onClick}
        size="icon"
        className={cn(
          'relative h-14 w-14 overflow-hidden rounded-full shadow-2xl transition-all duration-300 sm:h-16 sm:w-16',
          'bg-linear-to-br from-blue-600 via-blue-700 to-purple-600 text-white',
          'border-2 border-white/30 backdrop-blur-xl',
          'hover:scale-110 hover:shadow-xl hover:shadow-purple-500/25',
          'hover:from-blue-700 hover:via-blue-800 hover:to-purple-700',
          'group transform-gpu will-change-transform',
          'animate-bounce-gentle',
          'focus:outline-none',
          isOpen ? 'scale-95 rotate-180 shadow-inner' : 'hover:rotate-12 active:scale-95',
        )}
        aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'chatbot-dialog' : undefined}
      >
        {/* Animated shine effect like header */}
        <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 transform rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"></div>

        {/* Glass morphism overlay */}
        <div className="absolute inset-0 rounded-full bg-linear-to-br from-white/20 to-transparent"></div>

        {/* Icon Container */}
        <div className="relative z-10 flex items-center justify-center">
          {isOpen ? (
            <X
              size={18}
              className={cn('transition-all duration-300 sm:h-5 sm:w-5', 'drop-shadow-sm')}
            />
          ) : (
            <div className="relative flex items-center justify-center">
              <TbMessageCircleFilled
                size={20}
                className="animate-float shrink-0 drop-shadow-sm transition-all duration-300 sm:h-[22px] sm:w-[22px]"
              />

              {/* Enhanced Sparkle Animation */}
              <Sparkles
                className={cn(
                  'absolute h-3 w-3 text-white/80 transition-all duration-500 sm:h-4 sm:w-4',
                  'animate-pulse opacity-0 group-hover:opacity-100',
                  '-top-1 -right-1 group-hover:scale-110',
                )}
              />
            </div>
          )}
        </div>
      </Button>
    </div>
  );
};

export default ChatbotButton;
