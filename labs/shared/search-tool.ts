import { LAB_EVENTS, type LabEvent } from "./events";
import { failure, type ToolFailure } from "./tool-result";

export const SEARCH_EVENTS_TOOL_NAME = "search_events";
export const SEARCH_EVENTS_TOOL_DESCRIPTION = "依關鍵字、城市與活動形式搜尋公開活動；沒有符合項目時回傳空陣列。";

export const SEARCH_EVENTS_INPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    keyword: { type: "string", description: "比對活動名稱與摘要的關鍵字。" },
    city: { type: "string", enum: ["taipei", "kaohsiung"], description: "實體活動所在城市。" },
    format: { type: "string", enum: ["onsite", "online"], description: "活動參與形式。" }
  }
} as const;

export type SearchEventsInput = {
  keyword?: string;
  city?: "taipei" | "kaohsiung";
  format?: "onsite" | "online";
};

export type SearchEventsOutput = {
  ok: true;
  count: number;
  events: LabEvent[];
};

export type SearchEventsResult = SearchEventsOutput | ToolFailure;

type SearchEventsDependencies = {
  events: readonly LabEvent[];
  search: (events: readonly LabEvent[], input: SearchEventsInput) => LabEvent[] | Promise<LabEvent[]>;
};

const DEFAULT_DEPENDENCIES: SearchEventsDependencies = {
  events: LAB_EVENTS,
  search: searchEvents
};

const ALLOWED_FIELDS = new Set(["keyword", "city", "format"]);
const CITIES = ["taipei", "kaohsiung"] as const;
const FORMATS = ["onsite", "online"] as const;

function parseInput(input: unknown): SearchEventsInput | ToolFailure {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return failure("VALIDATION_ERROR", "輸入必須是物件。", { expected: "object" });
  }

  const record = input as Record<string, unknown>;
  const unknownFields = Object.keys(record).filter((field) => !ALLOWED_FIELDS.has(field));
  if (unknownFields.length > 0) {
    return failure("VALIDATION_ERROR", "輸入包含未定義的欄位。", { unknownFields });
  }

  if (record.keyword !== undefined && typeof record.keyword !== "string") {
    return failure("VALIDATION_ERROR", "欄位 keyword 必須是字串。", { field: "keyword", expected: "string" });
  }
  if (record.city !== undefined && !CITIES.includes(record.city as (typeof CITIES)[number])) {
    return failure("VALIDATION_ERROR", "欄位 city 的值不在允許範圍內。", { field: "city", allowed: [...CITIES] });
  }
  if (record.format !== undefined && !FORMATS.includes(record.format as (typeof FORMATS)[number])) {
    return failure("VALIDATION_ERROR", "欄位 format 的值不在允許範圍內。", { field: "format", allowed: [...FORMATS] });
  }

  const parsed: SearchEventsInput = {};
  if (typeof record.keyword === "string" && record.keyword.trim()) parsed.keyword = record.keyword.trim();
  if (record.city !== undefined) parsed.city = record.city as (typeof CITIES)[number];
  if (record.format !== undefined) parsed.format = record.format as (typeof FORMATS)[number];
  return parsed;
}

export function searchEvents(events: readonly LabEvent[], input: SearchEventsInput): LabEvent[] {
  const keyword = input.keyword?.toLocaleLowerCase("zh-Hant") ?? "";
  return events.filter((event) => {
    if (keyword && !`${event.title} ${event.summary}`.toLocaleLowerCase("zh-Hant").includes(keyword)) return false;
    if (input.city && event.city !== input.city) return false;
    if (input.format && event.format !== input.format) return false;
    return true;
  });
}

export async function executeSearchEvents(
  input: unknown,
  dependencies: SearchEventsDependencies = DEFAULT_DEPENDENCIES
): Promise<SearchEventsResult> {
  const parsed = parseInput(input);
  if ("ok" in parsed) return parsed;

  try {
    const events = await dependencies.search(dependencies.events, parsed);
    return { ok: true, count: events.length, events };
  } catch {
    return failure("TEMPORARY_FAILURE", "活動搜尋暫時無法完成，請稍後再試。");
  }
}
