'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PartyPopper } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTE_CONFIG } from '@/configs/routes';

interface SuccessOverlayProps {
  countdown: number;
}

export function SuccessOverlay({ countdown }: SuccessOverlayProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center sm:p-8">
          <div className="mb-4 sm:mb-6">
            <PartyPopper className="mx-auto mb-3 h-12 w-12 animate-bounce text-green-500 sm:mb-4 sm:h-16 sm:w-16" />
            <h2 className="mb-1.5 text-xl font-bold text-green-600 sm:mb-2 sm:text-2xl">
              Payment Successful!
            </h2>
            <p className="mb-3 text-sm text-gray-600 sm:mb-4 sm:text-base">
              Your order has been confirmed and is being processed.
            </p>
            <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3 sm:mb-4 sm:p-4">
              <p className="text-sm text-green-800 sm:text-base">
                Automatically redirecting in{' '}
                <span className="text-lg font-bold sm:text-xl">{countdown}</span> seconds
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(ROUTE_CONFIG.PROFILE.MY_ORDERS)}
            className="h-10 w-full bg-green-600 text-sm hover:bg-green-700 sm:h-11 sm:text-base"
          >
            View Order Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
