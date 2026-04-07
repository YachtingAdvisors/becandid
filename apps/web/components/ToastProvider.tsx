'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
  exiting: boolean;
}

interface ToastContextType {
  toast: (message: string, type?: Toast['type'], duration?: number) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType>({ toast: () => {}, toasts: [] });
export const useToast = () => useContext(ToastContext);

const MAX_VISIBLE = 3;

const ICON_MAP: Record<Toast['type'], { icon: string; color: string }> = {
  success: { icon: 'check_circle', color: 'text-emerald-600' },
  error:   { icon: 'error',        color: 'text-red-600' },
  info:    { icon: 'info',         color: 'text-teal-600' },
};

const TEXT_COLOR_MAP: Record<Toast['type'], string> = {
  success: 'text-emerald-800',
  error:   'text-red-800',
  info:    'text-teal-800',
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { icon, color } = ICON_MAP[t.type];
  const textColor = TEXT_COLOR_MAP[t.type];

  return (
    <button
      onClick={() => onDismiss(t.id)}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg bg-surface-container-lowest border border-outline-variant cursor-pointer transition-all duration-300 ease-out hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/30 ${
        t.exiting
          ? 'opacity-0 translate-y-2 pointer-events-none'
          : 'opacity-100 translate-y-0 animate-fade-up'
      }`}
      aria-label="Dismiss notification"
    >
      <span
        className={`material-symbols-outlined text-lg shrink-0 ${color}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <span className={`font-label text-sm font-medium ${textColor}`}>
        {t.message}
      </span>
    </button>
  );
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    // Clear any existing timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    // Mark as exiting for fade-out
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));

    // Remove after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback(
    (message: string, type: Toast['type'] = 'success', duration = 3000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newToast: Toast = { id, message, type, duration, exiting: false };

      setToasts((prev) => {
        const next = [...prev, newToast];
        // Trim oldest when exceeding max
        if (next.length > MAX_VISIBLE) {
          const toRemove = next.slice(0, next.length - MAX_VISIBLE);
          toRemove.forEach((t) => dismiss(t.id));
        }
        return next;
      });

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        dismiss(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  // Clean up timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts }}>
      {children}

      {/* Toast container */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-[100] flex flex-col-reverse gap-2 items-center md:items-end pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
