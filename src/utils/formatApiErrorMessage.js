const messageMap = {
  "title 屬性不得為空": "【商品名稱】不得空白",
  "category 屬性不得為空": "【分類】不得空白",
  "unit 屬性不得為空": "【單位】不得空白",
};

export const formatApiErrorMessage = (message) => {
  return String(message)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => messageMap[item] || item)
    .join("、");
};
