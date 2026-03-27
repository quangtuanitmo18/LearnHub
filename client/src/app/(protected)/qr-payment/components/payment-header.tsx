'use client';

import { CheckCircle } from 'lucide-react';

interface PaymentHeaderProps {
  orderCode?: string;
}

export function PaymentHeader({ orderCode }: PaymentHeaderProps) {
  return (
    <div className="mb-6 text-center sm:mb-8">
      <div className="mb-3 flex items-center justify-center sm:mb-4">
        <CheckCircle className="h-12 w-12 text-green-500 sm:h-16 sm:w-16" />
      </div>
      <h1 className="mb-1.5 text-2xl font-bold text-gray-900 sm:mb-2 sm:text-3xl">
        Order Placed Successfully
      </h1>
      <p className="text-sm text-gray-600 sm:text-base">
        Order Code <span className="font-semibold text-blue-600">#{orderCode}</span>
      </p>
    </div>
  );
}
