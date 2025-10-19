import { useEffect, useState } from 'react';
import * as RadixToast from '@radix-ui/react-toast';

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  useEffect(() => {
    if (!open) {
      // allow exit animation before unmounting at parent
      const t = setTimeout(() => onClose && onClose(), 200);
      return () => clearTimeout(t);
    }
  }, [open, onClose]);

  const typeStyles = {
    success: 'bg-green-500/90 text-white border-white/20',
    error: 'bg-red-500/90 text-white border-white/20',
    warning: 'bg-yellow-500/90 text-white border-white/20',
    info: 'bg-blue-500/90 text-white border-white/20'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <RadixToast.Root
      open={open}
      onOpenChange={setOpen}
      className={`rounded-lg shadow-lg p-4 backdrop-blur-sm border ${typeStyles[type]} data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-right-2 data-[state=closed]:slide-out-to-right-2`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg font-semibold">{icons[type]}</span>
          <RadixToast.Description className="text-sm font-medium flex-1">
            {message}
          </RadixToast.Description>
        </div>
        <RadixToast.Close
          aria-label="Close notification"
          className="ml-3 text-white/80 hover:text-white transition-colors"
        >
          <span className="text-lg">×</span>
        </RadixToast.Close>
      </div>
    </RadixToast.Root>
  );
}
