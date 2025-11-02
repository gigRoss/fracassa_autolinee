"use client";

import { useEffect } from "react";

type ToastType = "error" | "success" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const colors = {
    error: {
      border: "var(--error)",
      text: "var(--error)",
    },
    success: {
      border: "var(--success)",
      text: "var(--success)",
    },
    info: {
      border: "var(--brand-primary)",
      text: "var(--brand-primary)",
    },
  };

  const color = colors[type];

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full mx-4 animate-slide-in"
      role="alert"
      aria-live="assertive"
    >
      <div
        className="text-sm rounded-md p-4 shadow-lg border-2 flex items-start justify-between gap-3 bg-white dark:bg-neutral-900"
        style={{
          color: color.text,
          borderColor: color.border,
        }}
      >
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Chiudi notifica"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

