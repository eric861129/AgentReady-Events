# Day 09｜`name`、`toolparamdescription` 與 Schema Snapshot

## 核心定位

Day 9 把焦點從 Tool identity 推進到 Tool inputs。Agent 不只需要知道有 `search_events`，也需要知道每個欄位代表什麼。HTML 的 `name`、欄位型別、選項與 `toolparamdescription` 會影響 Declarative Schema 的可讀性。

## 文章要回答的問題

- HTML form 欄位如何對應到 Tool parameters？
- `name`、`type`、`select option` 和 `required` 各自提供什麼語意？
- `toolparamdescription` 應該補充什麼，才能讓 Agent 更準確填參數？

## 寫作主軸

1. `name` 是欄位參數名稱，也是後端 query contract 的接點。
2. input type 和 select options 提供欄位型別與允許值的線索。
3. `toolparamdescription` 補的是欄位語意，不是重複 label。
4. diagnostics page 顯示 schema snapshot，是文章素材與回歸檢查工具，不是正式規格保證。

## 素材清單

- 專案文件：WebMCP Baseline Declarative API Surface
- 程式版本：`day-09-search-events-schema`
- 程式重點：`toolparamdescription`、field schema snapshot
- 操作畫面：schema/attribute 檢視

## 截圖 / GIF

| 素材 | 文章位置 | 用途 | 對應 git tag | WebMCP 觀念 |
| --- | --- | --- | --- | --- |
| `docs/articles/assets/day-09/01-schema-snapshot.png` | 說明 Schema Snapshot 時 | 展示欄位名稱、型別與描述如何被整理成可讀結構。 | `day-09-search-events-schema` | HTML form 欄位會成為 Tool parameters 的來源。 |
| `docs/articles/assets/day-09/02-field-descriptions.png` | 解釋 `toolparamdescription` 時 | 聚焦欄位描述，說明它補充的是參數語意。 | `day-09-search-events-schema` | `toolparamdescription` 幫 Agent 理解欄位用途，不是重複 label。 |
| `docs/articles/assets/day-09/01-schema-snapshot.png` | 文章結尾的限制說明 | 提醒 snapshot 是 demo 觀察值，不是永久規格輸出格式。 | `day-09-search-events-schema` | Declarative Schema 仍需以當前 Chrome/WebMCP 實作驗證。 |

## 不要誤寫

- 不要把 diagnostics snapshot 寫成 Chrome 最終輸出的永久 schema 格式。
- 不要宣稱 Declarative API 已提供和 Imperative annotations 完全對等的能力。
- 不要讓欄位描述變成 UI 文案；它是 Agent 讀參數時的上下文。

發布前套用：`docs/06-webmcp-reality-checklist.md`
