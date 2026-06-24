# AgentReady Events

> 網站不只給人用：30 天打造 AI Agent 看得懂的 WebMCP 網站

AgentReady Events 是一個為 2026 iThome 鐵人賽所設計的實作專案。

本專案目標是打造一個「AI Agent 友善」的活動探索與報名平台，示範網站如何在保留人類使用介面的同時，額外公開結構化工具，讓瀏覽器中的 AI Agent 能夠理解、選擇並呼叫網站功能。

## 系列主張

別再讓 AI 猜按鈕，讓網站主動說明自己能做什麼。

傳統網站主要服務人類使用者，AI Agent 若要操作網站，通常需要依賴畫面辨識、DOM 分析與模擬點擊。

WebMCP 嘗試提供另一種方式：網站可以將搜尋、篩選、收藏、表單填寫、取消報名等功能，公開為具備名稱、描述與結構化參數的工具，讓 Agent 不必猜測網站能做什麼。

## 實作目標

本專案將完成：

- 活動搜尋與篩選
- 活動詳情
- 收藏活動
- 活動報名
- 查看我的報名
- 取消報名
- Agent Debug Panel
- WebMCP Declarative Tools
- WebMCP Imperative Tools
- Human-in-the-loop 操作流程
- 權限與安全檢查
- Prompt Injection 測試案例
- Agent Evals

## 預計 WebMCP Tools

| Tool | 說明 |
|---|---|
| `search_events` | 搜尋與篩選活動 |
| `get_event_details` | 查看活動詳細資訊 |
| `save_event` | 收藏活動 |
| `prepare_event_registration` | 協助填寫活動報名表 |
| `get_my_registrations` | 查看目前使用者的報名紀錄 |
| `cancel_registration` | 取消指定活動報名 |
| `export_my_schedule` | 匯出我的活動行程 |

## 技術方向

- TypeScript
- Vite
- Semantic HTML
- WebMCP
- JSON Schema
- Node.js
- SQLite
- Vitest
- Playwright

## 系列文章

本專案對應 iThome 鐵人賽 30 天系列文章：

《網站不只給人用：30 天打造 AI Agent 看得懂的 WebMCP 網站》

文章將從 Agentic Web 的概念開始，逐步完成一個可被 AI Agent 理解與操作的 WebMCP 網站。

## 專案狀態

目前狀態：規劃文件已完成，準備進入 7/1～7/7 基本網站與 Declarative API 實作

- [x] 確定主題
- [x] 建立 GitHub Repository
- [x] 完成系列文章大綱
- [x] 建立技術來源清單
- [x] 完成架構圖
- [x] 完成 Tool Catalog
- [x] 固定 WebMCP 技術基準版本
