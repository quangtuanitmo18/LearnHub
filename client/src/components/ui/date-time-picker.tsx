'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { SimpleTimePicker } from '@/components/ui/simple-time-picker';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

interface DateTimePickerProps {
  value?: string; // ISO string or datetime-local format
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  placeholder = 'Pick date & time',
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? undefined : d;
    } catch {
      return undefined;
    }
  }, [value]);

  const timeString = React.useMemo(() => {
    if (!dateValue) return '00:00:00';
    return `${dateValue.getHours().toString().padStart(2, '0')}:${dateValue.getMinutes().toString().padStart(2, '0')}:00`;
  }, [dateValue]);

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return;
    const current = dateValue || new Date();
    day.setHours(current.getHours(), current.getMinutes(), 0, 0);
    onChange(toLocalISOString(day));
  };

  const handleTimeChange = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const d = dateValue ? new Date(dateValue) : new Date();
    d.setHours(h, m, 0, 0);
    onChange(toLocalISOString(d));
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !dateValue && 'text-muted-foreground',
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, 'dd/MM/yyyy HH:mm') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={dateValue} onSelect={handleDateSelect} initialFocus />
        <Separator />
        <div className="p-3">
          <p className="text-muted-foreground mb-2 text-xs font-medium">Time</p>
          <SimpleTimePicker value={timeString} onChange={handleTimeChange} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Convert Date to "YYYY-MM-DDTHH:mm" (local timezone, compatible with datetime-local input) */
function toLocalISOString(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
