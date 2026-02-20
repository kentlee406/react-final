# Redux Toolkit 通知訊息功能

## 功能說明

利用 Redux Toolkit 實現的全局通知系統，可以在應用的任何地方顯示通知訊息。

### 特點：

- ✅ 簡單易用的 Hook API
- ✅ 支持多種通知類型（success, error, warning, info）
- ✅ 自動消散功能（可選）
- ✅ 響應式設計
- ✅ 動畫效果

---

## 使用方法

### 基本使用

在任何組件中使用 `useNotification` hook：

```jsx
import { useNotification } from "../hooks/useNotification";

function MyComponent() {
  const { showNotification, hideNotification } = useNotification();

  const handleSuccess = () => {
    showNotification("操作成功！", "success");
  };

  const handleError = () => {
    showNotification("發生錯誤", "error", 5000); // 5秒後自動消散
  };

  return (
    <div>
      <button onClick={handleSuccess}>成功</button>
      <button onClick={handleError}>錯誤</button>
    </div>
  );
}
```

### API 方法

#### `showNotification(message, type, duration)`

顯示通知訊息

**參數：**

- `message` (string) - 通知訊息內容 ✅ 必填
- `type` (string) - 通知類型：`success`, `error`, `warning`, `info` - 預設：`info`
- `duration` (number) - 自動消散時間（毫秒） - 預設：`null`（不自動消散）

**返回值：** 通知 ID（便於手動移除）

**例子：**

```jsx
// 不自動消散
showNotification("保存成功", "success");

// 5秒後自動消散
showNotification("載入中...", "info", 5000);

// 獲取通知ID，便於手動移除
const notificationId = showNotification("处理中...", "warning");
// 稍後...
hideNotification(notificationId);
```

#### `hideNotification(id)`

手動移除指定的通知訊息

**參數：**

- `id` (number) - 通知 ID

---

## 場景範例

### 1. 表單提交

```jsx
import { useNotification } from "../hooks/useNotification";
import axios from "axios";

function LoginForm() {
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/login", formData);
      showNotification("登入成功", "success", 3000);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "登入失敗",
        "error",
        5000,
      );
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 2. API 請求

```jsx
function ProductList() {
  const { showNotification } = useNotification();

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      showNotification("刪除成功", "success", 3000);
      // 重新載入列表...
    } catch (error) {
      showNotification("刪除失敗，請重試", "error");
    }
  };

  return <button onClick={() => deleteProduct(id)}>刪除</button>;
}
```

### 3. 複製到剪貼板

```jsx
function CopyButton({ text }) {
  const { showNotification } = useNotification();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    showNotification("已複製到剪貼板", "success", 2000);
  };

  return <button onClick={handleCopy}>複製</button>;
}
```

---

## 通知類型樣式

| 類型    | 顏色 | 用途          |
| ------- | ---- | ------------- |
| success | 綠色 | 操作成功      |
| error   | 紅色 | 操作失敗/錯誤 |
| warning | 黃色 | 警告訊息      |
| info    | 藍色 | 一般資訊      |

---

## Redux 結構

### Store

```
src/
├── store/
│   ├── index.js               # Store 配置
│   └── notificationSlice.js   # Notification reducer
├── hooks/
│   └── useNotification.js     # Custom hook
└── component/
    └── Notification.jsx       # 通知元件
```

### 如何擴展

如果需要添加其他功能，可以修改 `notificationSlice.js`：

```javascript
// 添加新的 reducer
reducers: {
  // 例如：批量移除通知
  removeNotificationsByType(state, action) {
    state.messages = state.messages.filter(
      (msg) => msg.type !== action.payload
    );
  }
}
```

---

## 注意事項

1. **Notification 元件位置**：已在 `Layout.jsx` 中引入，會固定在視口右上角
2. **Z-index**：設為 9999，確保在其他元素上方顯示
3. **自動消散**：如果設定了 duration，訊息會在指定時間後自動消失
4. **多個通知**：支持同時顯示多條訊息，會垂直堆疊

---

## 高級用法

### 自定義通知時長

```jsx
const NOTIFICATION_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
};

showNotification("操作完成", "success", NOTIFICATION_DURATION.MEDIUM);
```

### 作為確認提示

```jsx
function ConfirmDelete() {
  const { showNotification } = useNotification();

  const handleDelete = () => {
    showNotification("已刪除，按 Ctrl+Z 復原", "success", 5000);
    // 提供復原功能...
  };

  return <button onClick={handleDelete}>刪除</button>;
}
```
