const a={"title 屬性不得為空":"【商品名稱】不得空白","category 屬性不得為空":"【分類】不得空白","unit 屬性不得為空":"【單位】不得空白"},e=r=>String(r).split(",").map(t=>t.trim()).filter(Boolean).map(t=>a[t]||t).join("、");export{e as f};
