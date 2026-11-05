/**
 * Web Notifications API & Real-time Alert System
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'status_change' | 'assignment' | 'sync' | 'alert';
  roleTarget: 'resident' | 'collector' | 'admin' | 'leader' | 'all';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

/**
 * Play gentle notification chime via Web Audio API (zero external assets needed)
 */
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Request permission for Web Notifications API
 */
export async function requestWebNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[Notification API] Web Notifications not supported in this browser.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('[Notification API] Permission request error:', err);
    return 'denied';
  }
}

/**
 * Dispatch a notification using the Web Notifications API and Service Worker if available
 */
export function dispatchWebNotification(
  title: string,
  body: string,
  options?: {
    tag?: string;
    icon?: string;
    data?: Record<string, unknown>;
  }
): void {
  // Always play gentle chime
  playNotificationChime();

  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      // If service worker is active, use showNotification
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: options?.icon || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=192&q=80',
            badge: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=72&q=80',
            tag: options?.tag || 'nabutiti-waste-alert',
            data: options?.data
          });
        });
      } else {
        // Fallback to standard Window Notification
        new Notification(title, {
          body,
          icon: options?.icon || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=192&q=80',
          tag: options?.tag || 'nabutiti-waste-alert'
        });
      }
    } catch (e) {
      console.warn('[Notification API] Standard notification constructor failed:', e);
    }
  }
}
