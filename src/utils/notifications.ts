// Real-time Order Notification Utility

// Play pleasant Web Audio API Synth Chime for New Order
export function playOrderNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // Notes: C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz) -> C6 (1046.50Hz)
    const freqs = [523.25, 659.25, 783.99, 1046.50];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.4);
    });
  } catch (e) {
    console.warn('Audio notification play failed:', e);
  }
}

// Trigger Web Browser Desktop Notification
export function sendBrowserOrderNotification(
  order: {
    invoiceNumber?: string;
    orderNumber: string;
    customerName: string;
    total: number;
  },
  onClick?: () => void
) {
  // Always play chime sound alert
  playOrderNotificationSound();

  // Check if browser supports notifications
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const orderId = order.invoiceNumber ? `#${order.invoiceNumber}` : `#${order.orderNumber}`;
    const title = `🎉 নতুন অর্ডার এসেছে! (${orderId})`;
    const options: any = {
      body: `গ্রাহক: ${order.customerName}\nমোট বিল: ৳${order.total.toLocaleString()}\nপ্যানেলে বিস্তারিত দেখতে এখানে ক্লিক করুন।`,
      tag: `order-${order.orderNumber}`,
      requireInteraction: true,
      renotify: true,
    };

    try {
      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.focus();
        if (onClick) onClick();
        notification.close();
      };
    } catch (e) {
      console.warn('Browser Notification trigger error:', e);
    }
  }
}

// Request Notification Permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    return Notification.permission;
  }
}
