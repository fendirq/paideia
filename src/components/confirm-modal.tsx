"use client";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Remove",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-bg-inner border border-[rgba(168,152,128,0.20)] rounded-2xl p-6 max-w-xs text-center space-y-4">
        <h3 className="text-sm font-display font-semibold text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500/20 text-red-400 text-[12px] font-display font-semibold rounded-full px-4 py-1.5 hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {loading ? "Removing..." : confirmLabel}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-[12px] text-text-muted hover:text-text-secondary transition-colors px-3 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
