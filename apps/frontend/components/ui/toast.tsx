'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const iconByVariant: Record<ToastVariant, React.ComponentType<{ className?: string; size?: number }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
};

export function ToastProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = idRef.current++;
      const item: ToastItem = { id, ...toast };
      setToasts((prev) => [...prev, item]);
      setTimeout(() => dismiss(id), 3600);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      push,
      dismiss
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  dismiss
}: {
  toasts: ToastItem[];
  dismiss: (id: number) => void;
}): React.JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] mx-auto w-[min(96vw,420px)] space-y-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = iconByVariant[toast.variant];
          return (
            <motion.div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto rounded-2xl border bg-white/95 px-4 py-3 shadow-lg backdrop-blur',
                toast.variant === 'success' && 'border-emerald-200',
                toast.variant === 'error' && 'border-red-200',
                toast.variant === 'info' && 'border-slate-200'
              )}
              initial={reduceMotion ? false : { opacity: 0, y: -14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              <div className="flex items-start gap-3">
                <Icon
                  size={18}
                  className={cn(
                    'mt-0.5',
                    toast.variant === 'success' && 'text-emerald-600',
                    toast.variant === 'error' && 'text-red-600',
                    toast.variant === 'info' && 'text-brand-700'
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{toast.title}</p>
                  {toast.description ? <p className="mt-0.5 text-xs text-slateInk">{toast.description}</p> : null}
                </div>
                <button
                  type="button"
                  className="rounded-lg p-1 text-slateInk transition hover:bg-slate-100"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}

