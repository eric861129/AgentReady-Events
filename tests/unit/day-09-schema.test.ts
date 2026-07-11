import { expect, it } from "vitest";
import { snapshotFormSchema } from "../../labs/shared/schema-snapshot";

it("snapshots names, control types, requirements, descriptions and enum values", () => {
  const fakeForm = {
    elements: [
      { tagName: "INPUT", type: "text", name: "query", required: false, getAttribute: () => "公開活動關鍵字" },
      {
        tagName: "SELECT",
        name: "location",
        required: true,
        getAttribute: () => "公開活動地點",
        options: [{ value: "taipei" }, { value: "online" }]
      },
      { tagName: "BUTTON", type: "submit", name: "", required: false, getAttribute: () => null }
    ]
  } as unknown as HTMLFormElement;
  expect(snapshotFormSchema(fakeForm)).toEqual([
    { name: "query", control: "input:text", required: false, description: "公開活動關鍵字" },
    { name: "location", control: "select", required: true, description: "公開活動地點", values: ["taipei", "online"] }
  ]);
});
