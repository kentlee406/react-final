import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    // 添加通知訊息
    addNotification(state, action) {
      const { message, type = "info", id } = action.payload;
      state.messages.push({
        id: id || Date.now(),
        message,
        type, // success, error, warning, info
        timestamp: new Date().toISOString(),
      });
    },

    // 移除指定通知訊息
    removeNotification(state, action) {
      state.messages = state.messages.filter(
        (msg) => msg.id !== action.payload,
      );
    },

    // 清空所有通知訊息
    clearNotifications(state) {
      state.messages = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
