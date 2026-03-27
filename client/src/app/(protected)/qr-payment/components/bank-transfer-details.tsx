'use client';

import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface BankTransferDetailsProps {
  amount: string;
  orderCode?: string;
}

export function BankTransferDetails({ amount, orderCode }: BankTransferDetailsProps) {
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  }

  function formatAmount(amount: string) {
    return new Intl.NumberFormat('vi-VN').format(parseInt(amount)) + 'đ';
  }

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-gray-700 sm:mb-6 sm:text-base">
        Method 2: Manual bank transfer using the following details
      </h3>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:rounded-xl">
        {/* Bank Header */}
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {/* OCB Logo */}
            <Image
              src="/images/ocb-icon.png"
              alt="OCB Bank"
              width={40}
              height={40}
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
          </div>
          <h4 className="mt-1.5 text-center text-sm font-semibold text-gray-800 sm:mt-2 sm:text-base">
            OCB Bank
          </h4>
        </div>

        {/* Bank Details */}
        <div className="p-3 sm:p-4">
          <div className="space-y-0">
            {/* Account Holder */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 py-2">
              <span className="shrink-0 text-xs font-medium text-gray-600 sm:text-sm">
                Account holder:
              </span>
              <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                <span className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                  PHAN THANH TIN
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('Phan Thành Tín')}
                  className="h-7 w-7 shrink-0 p-0 hover:bg-gray-100 sm:h-8 sm:w-8"
                >
                  <Copy className="h-3 w-3 text-gray-500 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Account Number */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 py-2">
              <span className="shrink-0 text-xs font-medium text-gray-600 sm:text-sm">
                Account number:
              </span>
              <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                <span className="text-xs font-semibold text-gray-900 sm:text-sm">
                  0004100035001
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('0004100035001')}
                  className="h-7 w-7 shrink-0 p-0 hover:bg-gray-100 sm:h-8 sm:w-8"
                >
                  <Copy className="h-3 w-3 text-gray-500 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 py-2">
              <span className="shrink-0 text-xs font-medium text-gray-600 sm:text-sm">Amount:</span>
              <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                <span className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                  {formatAmount(amount || '0')}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(amount || '')}
                  className="h-7 w-7 shrink-0 p-0 hover:bg-gray-100 sm:h-8 sm:w-8"
                >
                  <Copy className="h-3 w-3 text-gray-500 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Transfer Content */}
            <div className="flex items-center justify-between gap-2 py-2">
              <span className="shrink-0 text-xs font-medium text-gray-600 sm:text-sm">
                Transfer note:
              </span>
              <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                <span className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                  {orderCode}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(orderCode || '')}
                  className="h-7 w-7 shrink-0 p-0 hover:bg-gray-100 sm:h-8 sm:w-8"
                >
                  <Copy className="h-3 w-3 text-gray-500 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Note Section */}
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 sm:mt-6 sm:p-4">
            <p className="text-xs leading-relaxed text-amber-800 sm:text-sm">
              <strong>Note:</strong> Please keep the transfer note{' '}
              <span className="rounded bg-amber-100 px-1 font-semibold">{orderCode}</span> unchanged
              for automatic payment confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
