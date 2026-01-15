'use client';

/**
 * Notification Toast Component
 * Displays real-time notification toasts at the bottom-right of the screen
 */

import { useState, useEffect } from 'react';
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSocket } from '@/contexts/socket-context';

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actions?: Array<{ label: string; url: string; type: 'primary' | 'secondary' }>;
}

interface ToastNotification extends Notification {
  timestamp: number;
}

export function NotificationToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const { socket } = useSocket();

  // Listen for new notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('notification:new', (notification: Notification) => {
      // Add toast
      setToasts((prev) => [
        ...prev,
        {
          ...notification,
          timestamp: Date.now(),
        },
      ]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== notification.id));
      }, 5000);

      // Request browser notification permission if not granted
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: notification.id,
        });
      }
    });

    return () => {
      socket.off('notification:new');
    };
  }, [socket]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-l-4 border-red-500 bg-white';
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-white';
      case 'success':
        return 'border-l-4 border-green-500 bg-white';
      case 'info':
      default:
        return 'border-l-4 border-blue-500 bg-white';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getTypeStyles(
            toast.type
          )} rounded-lg shadow-xl border border-gray-200 p-4 animate-slide-in-right`}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">{getTypeIcon(toast.type)}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-gray-900">{toast.title}</h4>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">{toast.message}</p>

              {/* Actions */}
              {toast.actions && toast.actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {toast.actions.map((action, index) => (
                    <a
                      key={index}
                      href={action.url}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        action.type === 'primary'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => dismissToast(toast.id)}
                    >
                      {action.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
