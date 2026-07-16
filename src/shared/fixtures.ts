import type { EventDetail } from "./contracts";
import { securityEventFixtures } from "./security-fixtures";

export const EVENTS: EventDetail[] = [
  {
    id: "evt-webmcp-intro",
    title: "WebMCP 入門工作坊",
    summary: "從語意 HTML 到第一個網站 Tool。",
    startsAt: "2026-08-01T10:00:00+08:00",
    endsAt: "2026-08-01T12:00:00+08:00",
    location: "taipei",
    venue: "台北前端共學空間",
    price: "free",
    level: "beginner",
    remainingCapacity: 8,
    registrationDeadline: "2026-07-30T23:59:59+08:00",
    state: "open"
  },
  {
    id: "evt-semantic-html",
    title: "語意 HTML 不老派",
    summary: "讓人類、輔助科技與 Agent 共用誠實的介面。",
    startsAt: "2026-08-08T14:00:00+08:00",
    endsAt: "2026-08-08T16:00:00+08:00",
    location: "kaohsiung",
    venue: "高雄軟體共創基地",
    price: "free",
    level: "intermediate",
    remainingCapacity: 0,
    registrationDeadline: "2026-08-05T23:59:59+08:00",
    state: "full"
  },
  {
    id: "evt-agent-testing",
    title: "Agent 測試實戰",
    summary: "用 deterministic tests 與固定 Evals 拆解失敗。",
    startsAt: "2026-08-15T09:30:00+08:00",
    endsAt: "2026-08-15T12:30:00+08:00",
    location: "online",
    venue: "線上直播",
    price: "paid",
    level: "advanced",
    remainingCapacity: 24,
    registrationDeadline: "2026-08-12T23:59:59+08:00",
    state: "open"
  },
  ...securityEventFixtures
];
