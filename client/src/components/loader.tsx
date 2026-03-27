import { cn } from '@/lib/utils';

// Loader.jsx
export default function Loader({ message }: { message?: string }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm',
      )}
    >
      <div className="flex h-[50px] w-[50px] animate-spin items-center justify-center rounded-full border-[7px] border-double border-t-[#43cec7] border-r-transparent border-b-[#43cec7] border-l-transparent">
        <div className="h-1/2 w-1/2 rounded-full bg-[#43cec7]"></div>
      </div>
      {message && <p className="animate-pulse text-lg font-medium text-gray-600">{message}</p>}
    </div>
  );
}
