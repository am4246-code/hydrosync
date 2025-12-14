import React, { useEffect, useState } from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number; // duration in milliseconds
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`notification notification--${type}`}>
      <p>{message}</p>
      <button className="notification__close-button" onClick={() => { setIsVisible(false); onClose(); }}>
        &times;
      </button>
    </div>
  );
};

export default Notification;
