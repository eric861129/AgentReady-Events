import {
  EVENT_CATEGORIES,
  EVENT_LEVELS,
  EVENT_LOCATIONS,
  EVENT_PRICES,
  type SearchEventsQuery,
  type ValidationErrorItem
} from "../../contracts/src/index";

type ParseResult =
  | { ok: true; value: SearchEventsQuery }
  | { ok: false; errors: ValidationErrorItem[] };

type SearchField = keyof SearchEventsQuery;

const enumValues = {
  location: EVENT_LOCATIONS,
  price: EVENT_PRICES,
  category: EVENT_CATEGORIES,
  level: EVENT_LEVELS
} as const;

export function parseSearchEventsQuery(input: URLSearchParams | Record<string, unknown>): ParseResult {
  const errors: ValidationErrorItem[] = [];
  const query = readOptionalString(input, "query");
  const startDate = readOptionalString(input, "start_date");
  const endDate = readOptionalString(input, "end_date");
  const location = readEnum(input, "location", enumValues.location, errors);
  const price = readEnum(input, "price", enumValues.price, errors);
  const category = readEnum(input, "category", enumValues.category, errors);
  const level = readEnum(input, "level", enumValues.level, errors);

  if (query && query.length > 100) {
    errors.push({ field: "query", message: "關鍵字長度不可超過 100 個字元。" });
  }

  validateDate("start_date", startDate, errors);
  validateDate("end_date", endDate, errors);

  if (startDate && endDate && errors.length === 0 && endDate < startDate) {
    errors.push({ field: "end_date", message: "結束日期不可早於開始日期。" });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      ...(query ? { query } : {}),
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
      ...(location ? { location } : {}),
      ...(price ? { price } : {}),
      ...(category ? { category } : {}),
      ...(level ? { level } : {})
    }
  };
}

function readOptionalString(input: URLSearchParams | Record<string, unknown>, field: SearchField): string | undefined {
  const raw = input instanceof URLSearchParams ? input.get(field) : input[field];
  if (raw === undefined || raw === null) {
    return undefined;
  }

  const value = String(raw).trim();
  if (!value || value === "all") {
    return undefined;
  }

  return value;
}

function readEnum<TValue extends string>(
  input: URLSearchParams | Record<string, unknown>,
  field: SearchField,
  allowedValues: readonly TValue[],
  errors: ValidationErrorItem[]
): TValue | undefined {
  const value = readOptionalString(input, field);
  if (!value) {
    return undefined;
  }

  if (allowedValues.includes(value as TValue)) {
    return value as TValue;
  }

  errors.push({ field, message: `${field} 的值不在允許清單內。` });
  return undefined;
}

function validateDate(field: "start_date" | "end_date", value: string | undefined, errors: ValidationErrorItem[]): void {
  if (!value) {
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.push({ field, message: `${field} 必須是 YYYY-MM-DD 格式。` });
    return;
  }

  const parsed = new Date(`${value}T00:00:00+08:00`);
  if (Number.isNaN(parsed.getTime())) {
    errors.push({ field, message: `${field} 不是有效日期。` });
  }
}
