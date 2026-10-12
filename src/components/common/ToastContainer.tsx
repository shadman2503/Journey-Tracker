import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, type ToastType } from '@/stores/useToastStore';
import { cn } from '@/lib/utils';

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  const renderIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-4.5 w-4.5 text-sky-500 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30';
      case 'error':
        return 'border-rose-500/30';
      case 'info':
      default:
        return 'border-sky-500/30';
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-16 sm:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2"
      data-testid="toast-container"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            'pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl bg-card text-foreground animate-in slide-in-from-bottom-3 duration-200',
            getBorderColor(item.type)
          )}
          data-testid={`toast-${item.id}`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {renderIcon(item.type)}
            <p className="text-xs sm:text-sm font-medium leading-snug break-words">
              {item.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => removeToast(item.id)}
            aria-label="Dismiss notification"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
