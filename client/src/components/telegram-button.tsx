'use client';

import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TelegramButtonProps {
  onClick?: () => void;
  telegramUrl?: string;
}

const TelegramButton = ({ onClick, telegramUrl }: TelegramButtonProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (telegramUrl) {
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Default telegram link - LearnHub7 Phan
      window.open('https://t.me/learnhub7phan', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="animate-fade-in-up fixed right-4 bottom-24 z-50 sm:right-6 sm:bottom-28">
      {/* Enhanced Glass Background with Multiple Layers */}
      <div className="absolute inset-0 rounded-full">
        {/* Base gradient background - Telegram colors */}
        <div className="absolute inset-0 rounded-full bg-linear-to-br from-sky-500 via-blue-600 to-blue-700 opacity-90 transition-all duration-500" />
        {/* Glass overlay */}
        <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-xl transition-all duration-500" />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500" />
      </div>

      {/* Floating Animation Ring */}
      <div
        className={cn(
          'absolute inset-0 rounded-full transition-all duration-500',
          'scale-110 animate-pulse bg-linear-to-br from-sky-400/30 via-blue-500/30 to-blue-600/30 opacity-20',
        )}
      />

      {/* Pulsing outer ring */}
      <div className="absolute inset-0 animate-ping rounded-full bg-sky-500/20 opacity-75" />

      {/* Notification badge */}
      <div className="absolute -top-1 -right-1 flex h-3 w-3 animate-bounce items-center justify-center rounded-full bg-red-500 sm:h-4 sm:w-4">
        <div className="h-1 w-1 animate-pulse rounded-full bg-white sm:h-2 sm:w-2"></div>
      </div>

      {/* Main Button */}
      <Button
        onClick={handleClick}
        size="icon"
        className={cn(
          'relative h-14 w-14 overflow-hidden rounded-full shadow-2xl transition-all duration-300 sm:h-16 sm:w-16',
          'bg-linear-to-br from-sky-500 via-blue-600 to-blue-700 text-white',
          'border-2 border-white/30 backdrop-blur-xl',
          'hover:scale-110 hover:shadow-xl hover:shadow-sky-500/25',
          'hover:from-sky-600 hover:via-blue-700 hover:to-blue-800',
          'group transform-gpu will-change-transform',
          'animate-bounce-gentle hover:rotate-12 active:scale-95',
        )}
        aria-label="Open Telegram"
      >
        {/* Animated shine effect */}
        <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 transform rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"></div>

        {/* Glass morphism overlay */}
        <div className="absolute inset-0 rounded-full bg-linear-to-br from-white/20 to-transparent"></div>

        {/* Icon Container */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <Send
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
        </div>
      </Button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded-lg bg-gray-900/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block sm:px-3 sm:text-sm">
        Contact @learnhub7phan
        <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-gray-900/90"></div>
      </div>
    </div>
  );
};

export default TelegramButton;
