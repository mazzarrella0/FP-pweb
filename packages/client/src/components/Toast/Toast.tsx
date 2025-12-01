import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right`}
      role="alert"
    >
      <div className="shrink-0 w-6 h-6 rounded-full bg-white bg-opacity-30 flex items-center justify-center font-bold">
        {icon}
      </div>
      <p className="font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200 transition-colors"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};
