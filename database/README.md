# Database

本週先保留 SQLite migration 與 seed 骨架，API 實作仍讀取 `packages/test-fixtures` 的固定資料，確保文章截圖、API 測試與前端畫面一致。

後續若要切換成 SQLite，只需要把 `apps/api/src/app.ts` 的資料來源替換為 SQLite repository，DTO 與驗證層可以維持不變。
