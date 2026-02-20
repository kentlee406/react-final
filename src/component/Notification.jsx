import { useNotification } from "../hooks/useNotification";
import "../scss/notification.scss";

export const Notification = () => {
  const { notifications, hideNotification } = useNotification();

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          role="alert"
        >
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button
              className="notification-close"
              onClick={() => hideNotification(notification.id)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
