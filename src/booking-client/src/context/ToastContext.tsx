import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (message: string, title?: string, duration?: number) =>
        showToast(message, 'success', title, duration),
      error: (message: string, title?: string, duration?: number) =>
        showToast(message, 'error', title, duration),
      warning: (message: string, title?: string, duration?: number) =>
        showToast(message, 'warning', title, duration),
      info: (message: string, title?: string, duration?: number) =>
        showToast(message, 'info', title, duration),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// UI Component hiển thị danh sách các thông báo Toast
const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onRemove={() => onRemove(item.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{
  item: ToastItem;
  onRemove: () => void;
}> = ({ item, onRemove }) => {
  const config = {
    success: {
      icon: <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />,
      bg: 'bg-white/95 border-emerald-200/90 text-stone-800',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      defaultTitle: 'Thành Công',
      accentColor: 'bg-emerald-600',
    },
    error: {
      icon: <AlertCircle size={18} className="text-[#8c3e38] shrink-0" />,
      bg: 'bg-white/95 border-[#f2dedd] text-stone-800',
      badgeBg: 'bg-[#fdf6f5] text-[#8c3e38] border-[#f0dedd]',
      defaultTitle: 'Thông Báo Lỗi',
      accentColor: 'bg-[#b54a43]',
    },
    warning: {
      icon: <AlertTriangle size={18} className="text-[#9c7526] shrink-0" />,
      bg: 'bg-white/95 border-[#f0e3c5] text-stone-800',
      badgeBg: 'bg-[#faf6ee] text-[#9c7526] border-[#ebd9b2]',
      defaultTitle: 'Lưu Ý',
      accentColor: 'bg-[#c59b48]',
    },
    info: {
      icon: <Info size={18} className="text-[#0b1220] shrink-0" />,
      bg: 'bg-white/95 border-stone-200/90 text-stone-800',
      badgeBg: 'bg-stone-100 text-stone-700 border-stone-200',
      defaultTitle: 'Thông Báo',
      accentColor: 'bg-[#0b1220]',
    },
  }[item.type];

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-[0_12px_36px_rgba(15,23,42,0.1)] backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${config.bg}`}
    >
      <div className="pt-0.5">{config.icon}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-serif font-bold text-xs text-stone-900 tracking-tight">
            {item.title || config.defaultTitle}
          </span>
        </div>
        <p className="text-xs text-stone-600 font-light leading-relaxed break-words">
          {item.message}
        </p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition cursor-pointer shrink-0"
        title="Đóng thông báo"
      >
        <X size={14} />
      </button>
    </div>
  );
};
