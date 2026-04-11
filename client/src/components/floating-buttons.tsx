'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Dynamic imports with ssr: false to prevent hydration mismatch
const Chatbot = dynamic(() => import('@/components/chatbot/chatbot'), {
  ssr: false,
});

const TelegramButton = dynamic(() => import('@/components/telegram-button'), {
  ssr: false,
});

interface FloatingButtonsProps {
  telegramUrl?: string;
}

const FloatingButtons = ({ telegramUrl }: FloatingButtonsProps) => {
  const pathname = usePathname();

  // Hide on learning pages to avoid overlapping with lesson UI
  if (pathname?.startsWith('/learning')) return null;

  return (
    <>
      <Chatbot />
      <TelegramButton telegramUrl={telegramUrl} />
    </>
  );
};

export default FloatingButtons;
