import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import SpotlightCard from "./SpotlightCard";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  /**
 * Toast Component - Design System v2.0
 * 
 * Features:
 * - Glassmorphism backdrop with claymorphism accent
 * - 8px grid spacing (px-6 = 24px, py-4 = 16px)
 * - 60:30:10 color compliance
 * - Design system semantic colors
 */

  const colors = {
    success: {
      bg: 'var(--color-success)',
      icon: 'white',
      spotlight: 'var(--color-success-subtle)',
    },
    error: {
      bg: 'var(--color-error)',
      icon: 'white',
      spotlight: 'var(--color-error-subtle)',
    },
    warning: {
      bg: 'var(--color-warning)',
      icon: 'white',
      spotlight: 'var(--color-warning-subtle)',
    },
    info: {
      bg: 'var(--color-accent-3)',
      icon: 'white',
      spotlight: 'var(--color-accent-10-subtle)',
    },
  };

  const Icon = icons[type];
  const color = colors[type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <SpotlightCard
        className="rounded-[var(--radius-xl)] shadow-2xl max-w-md border border-[var(--glass-border-light)] overflow-hidden"
        spotlightColor={color.spotlight as `rgba(${number}, ${number}, ${number}, ${number})`}
      >
        <div 
          className="px-6 py-4 flex items-center gap-3"
          style={{
            backgroundColor: color.bg,
            color: 'white',
          }}
        >
          <Icon className="w-5 h-5 flex-shrink-0" style={{ color: color.icon }} />
          <span className="font-medium flex-1 text-sm">{message}</span>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-[var(--radius-sm)] transition-colors flex-shrink-0 clay-xs"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </SpotlightCard>
    </div>
  );
}

// Toast Context
interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: number; type: ToastType; message: string }>>([]);

  const showToast = (type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
