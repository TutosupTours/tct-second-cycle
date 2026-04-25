"use client";

import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

const alertStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: AlertCircle,
};

export default function Alert({ type, message, onClose }: AlertProps) {
  const Icon = iconStyles[type];

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-4 ${alertStyles[type]}`}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1 text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current opacity-70 hover:opacity-100"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}