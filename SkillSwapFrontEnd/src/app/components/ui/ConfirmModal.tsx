import { Button } from "@/app/components/ui/skill-swap-button";
import { AlertTriangle, X } from "lucide-react";
import SpotlightCard from "./SpotlightCard";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconColor = variant === "danger" ? "var(--destructive)" : variant === "warning" ? "var(--warning)" : "var(--accent-indigo)";

  // Dynamic spotlight color based on variant
  const spotlightColor = variant === "danger" 
    ? "rgba(239, 68, 68, 0.15)" 
    : variant === "warning" 
      ? "rgba(245, 158, 11, 0.15)" 
      : "rgba(99, 102, 241, 0.15)";

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <SpotlightCard 
          className="w-full max-w-[420px] rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200"
          spotlightColor={spotlightColor as `rgba(${number}, ${number}, ${number}, ${number})`}
        >
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div 
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: variant === "danger" ? "rgba(239, 68, 68, 0.1)" : variant === "warning" ? "rgba(245, 158, 11, 0.1)" : "rgba(99, 102, 241, 0.1)",
                }}
              >
                <AlertTriangle className="w-6 h-6" style={{ color: iconColor }} />
              </div>
              <div className="flex-1">
                <h3 
                  className="text-[20px] mb-2"
                  style={{ color: 'var(--text-primary)', fontWeight: 600 }}
                >
                  {title}
                </h3>
                <p 
                  className="text-[14px]"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                >
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline" className="flex-1">
                {cancelText}
              </Button>
              <Button onClick={onConfirm} className="flex-1">
                {confirmText}
              </Button>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
