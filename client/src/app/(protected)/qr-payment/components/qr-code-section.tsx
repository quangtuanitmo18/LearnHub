'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface QRCodeSectionProps {
  qrCodeUrl: string;
  orderCode?: string;
  paymentStatus: string;
}

export function QRCodeSection({ qrCodeUrl, orderCode, paymentStatus }: QRCodeSectionProps) {
  function downloadQR() {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR-${orderCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloading QR code...');
  }

  return (
    <div className="text-center">
      <h3 className="mb-4 text-sm font-semibold text-gray-700 sm:mb-6 sm:text-base">
        Method 1: Open banking app and scan QR code
      </h3>

      {/* QR Code */}
      <div className="relative inline-block">
        <div className="relative h-64 w-64 rounded-lg border-gray-200 bg-white p-3 shadow-sm sm:h-80 sm:w-80 sm:p-4">
          <div className="absolute top-0 left-0 z-10 h-6 w-6 border-t-2 border-l-2 border-blue-500 sm:h-8 sm:w-8 sm:border-t-4 sm:border-l-4"></div>
          <div className="absolute top-0 right-0 z-10 h-6 w-6 border-t-2 border-r-2 border-blue-500 sm:h-8 sm:w-8 sm:border-t-4 sm:border-r-4"></div>
          <div className="absolute bottom-0 left-0 z-10 h-6 w-6 border-b-2 border-l-2 border-blue-500 sm:h-8 sm:w-8 sm:border-b-4 sm:border-l-4"></div>
          <div className="absolute right-0 bottom-0 z-10 h-6 w-6 border-r-2 border-b-2 border-blue-500 sm:h-8 sm:w-8 sm:border-r-4 sm:border-b-4"></div>
          <Image
            src={qrCodeUrl}
            alt="Payment QR Code"
            width={300}
            height={300}
            className="mx-auto"
            sizes="(max-width: 640px) 228px, 284px"
          />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="qr-scan-animation absolute h-16 w-full bg-gradient-to-b from-blue-100/30 to-blue-400/90 sm:h-20"></div>
          </div>
        </div>

        <Button
          onClick={downloadQR}
          variant="outline"
          className="mt-3 h-9 w-full text-xs sm:mt-4 sm:h-10 sm:text-sm"
        >
          <Download className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
          Download QR
        </Button>
      </div>

      <div className="mt-3 text-xs text-gray-600 sm:mt-4 sm:text-sm">
        <div className="mb-2 flex items-center justify-center gap-1.5 sm:gap-2">
          <span>Status: {paymentStatus}</span>
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent sm:h-4 sm:w-4"></div>
        </div>
      </div>
    </div>
  );
}
