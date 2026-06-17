import { useEffect, useState } from 'react';

export function AutoGenerationNotification() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkNotifications = () => {
      const notifications = JSON.parse(
        sessionStorage.getItem('autoGenNotifications') || '[]'
      );

      if (notifications.length > 0) {
        const latest = notifications[notifications.length - 1];
        setMessage(latest.message);

        // Auto-clear after 5 seconds
        const timer = setTimeout(() => setMessage(null), 5000);

        // Clear old notifications
        sessionStorage.setItem('autoGenNotifications', '[]');

        return () => clearTimeout(timer);
      }
    };

    const interval = setInterval(checkNotifications, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!message) return null;

  return (
    <div
      className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg shadow-lg animate-bounce"
      role="status"
    >
      {message}
    </div>
  );
}
