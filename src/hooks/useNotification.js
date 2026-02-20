import { useDispatch, useSelector } from "react-redux";
import {
  addNotification,
  removeNotification,
} from "../store/notificationSlice";

/**
 * Custom hook for managing notifications
 * @returns {Object} - { notifications, showNotification, hideNotification }
 *
 * Usage example:
 * const { showNotification } = useNotification();
 * showNotification("Success!", "success");
 * showNotification("Error occurred", "error", 8000); // auto-dismiss after 8s
 */
export const useNotification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notification.messages);

  const showNotification = (message, type = "info", duration = null) => {
    const id = Date.now();
    dispatch(addNotification({ id, message, type }));

    // 如果設置了持續時間，自動移除
    if (duration) {
      setTimeout(() => {
        dispatch(removeNotification(id));
      }, duration);
    }

    return id; // 返回通知ID，方便手動移除
  };

  const hideNotification = (id) => {
    dispatch(removeNotification(id));
  };

  return {
    notifications,
    showNotification,
    hideNotification,
  };
};
