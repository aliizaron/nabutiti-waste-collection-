/**
 * NotificationCenter Component
 * Floating Web Notification Toasts, Notification Drawer, and Permission Activator
 * Design Variation 3: Deep carbon aesthetic, Space Mono metadata, Phosphor accents
 */

import React, { useState } from 'react';
import { useWasteApp } from '../context/WasteAppContext';
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Truck, 
  RefreshCw, 
  X
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    activeToast, 
    dismissToast, 
    notificationPermission, 
    requestPermission,
    markAllNotificationsRead 
  } = useWasteApp();

  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <Truck className="w-4 h-4 text-[#38bdf8]" />;
      case 'status_change':
        return <CheckCircle2 className="w-4 h-4 text-[#5ef38c]" />;
      case 'sync':
        return <RefreshCw className="w-4 h-4 text-[#c084fc]" />;
      default:
        return <Bell className="w-4 h-4 text-[#fbbf24]" />;
    }
  };

  return (
    <>
      {/* 1. Floating Live Toast (Appears automatically on status change or assignment) */}
      {activeToast && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 max-w-sm w-full bg-[var(--surface)] border border-[#5ef38c] shadow-2xl p-4 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[var(--surface-muted)] border border-[var(--border)] shrink-0 mt-0.5">
              {getNotifIcon(activeToast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono-tech font-bold uppercase text-[#5ef38c] truncate">
                  {activeToast.title}
                </h4>
                <span className="font-mono-tech text-[10px] text-[var(--ink-muted)] ml-2">{activeToast.timestamp}</span>
              </div>
              <p className="text-xs text-[var(--ink-secondary)] mt-1 leading-snug">
                {activeToast.message}
              </p>
            </div>
            <button
              onClick={dismissToast}
              className="text-[var(--ink-muted)] hover:text-[var(--ink)] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Top-bar Bell Button & Permission Controller */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-[var(--ink-secondary)] hover:text-[#5ef38c] hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border)] transition cursor-pointer"
          title="Notification Center"
        >
          {unreadCount > 0 ? (
            <BellRing className="w-4 h-4 text-[#5ef38c] animate-pulse" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1 bg-[#5ef38c] text-[#111113] font-mono-tech text-[9px] font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {/* 3. Notifications Dropdown Drawer */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--surface)] border border-[var(--border-bright)] shadow-2xl z-50 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 bg-[var(--surface-muted)] border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block">
                  [ NOTIFICATION DISPATCH ]
                </span>
                <h3 className="font-display italic text-lg font-semibold text-[var(--ink)] leading-tight">
                  Real-Time Event Feed
                </h3>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="font-mono-tech text-[10px] text-[#5ef38c] hover:underline uppercase cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </div>

            {/* Permission Request Banner if not granted */}
            {notificationPermission !== 'granted' && (
              <div className="p-3 bg-[var(--surface-muted)] border-b border-[var(--border)] flex items-center justify-between text-xs font-mono-tech">
                <span className="text-[var(--ink-secondary)] text-[10px]">
                  Browser push alerts inactive:
                </span>
                <button
                  onClick={requestPermission}
                  className="px-2 py-1 bg-[#5ef38c] text-[#111113] font-bold text-[10px] uppercase cursor-pointer"
                >
                  Enable Push
                </button>
              </div>
            )}

            {/* Feed List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono-tech text-[var(--ink-muted)]">
                  NO RECENT NOTIFICATIONS
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-[var(--surface-muted)]/60 transition flex items-start gap-3">
                    <div className="p-1.5 bg-[var(--surface-muted)] border border-[var(--border)] shrink-0 mt-0.5">
                      {getNotifIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono-tech font-bold text-[11px] text-[var(--ink)] uppercase">{n.title}</span>
                        <span className="font-mono-tech text-[9px] text-[var(--ink-muted)]">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-[var(--ink-secondary)] mt-1 leading-snug">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
