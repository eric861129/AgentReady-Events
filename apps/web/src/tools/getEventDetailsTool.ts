import type {
  GetEventDetailsResponse,
  ToolResult
} from "../../../../packages/contracts/src/index";
import { parseEventDetailsParams } from "../../../../packages/validation/src/index";
import type { ProjectWebMcpTool } from "../webmcpAdapter";

export const GET_EVENT_DETAILS_TOOL_NAME = "get_event_details";

export const GET_EVENT_DETAILS_TOOL_DESCRIPTION =
  "取得一個公開活動的日期、地點、費用、剩餘名額、報名期限與摘要。已從搜尋結果辨識到活動 ID，或使用者詢問特定活動時使用。";

export interface GetEventDetailsToolInput {
  event_id?: unknown;
}

interface GetEventDetailsToolOptions {
  loadEventDetails(eventId: string): Promise<GetEventDetailsResponse>;
  showEventDetails(detail: GetEventDetailsResponse): void;
}

export function createGetEventDetailsTool(
  options: GetEventDetailsToolOptions
): ProjectWebMcpTool<GetEventDetailsToolInput, ToolResult<GetEventDetailsResponse>> {
  return {
    name: GET_EVENT_DETAILS_TOOL_NAME,
    title: "查看活動詳情",
    description: GET_EVENT_DETAILS_TOOL_DESCRIPTION,
    inputSchema: {
      type: "object",
      properties: {
        event_id: {
          type: "string",
          maxLength: 64,
          description: "搜尋結果或目前頁面提供的活動識別碼。"
        }
      },
      required: ["event_id"]
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true
    },
    async execute(input) {
      const parsed = parseEventDetailsParams(input);
      if (!parsed.ok) {
        return {
          ok: false,
          message: parsed.errors.map((error) => error.message).join(" ")
        };
      }

      try {
        const detail = await options.loadEventDetails(parsed.value.event_id);
        options.showEventDetails(detail);
        return {
          ok: true,
          message: "已取得活動詳情並更新畫面。",
          data: detail
        };
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : "取得活動詳情時發生錯誤。"
        };
      }
    }
  };
}
