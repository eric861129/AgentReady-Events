import { expect, it, vi } from "vitest";
import { createEventActions } from "../../src/client/services/event-actions";

it("human and Agent contexts call the same dependencies", async () => {
  const search = vi.fn().mockResolvedValue({ events: [] });
  const loadDetails = vi.fn().mockResolvedValue({ id: "evt-1" });
  const actions = createEventActions({ search, loadDetails });
  await actions.search({}, { mode: "human" });
  await actions.search({}, { mode: "agent" });
  await actions.loadDetails("evt-1", { mode: "agent" });
  expect(search).toHaveBeenCalledTimes(2);
  expect(loadDetails).toHaveBeenCalledWith("evt-1");
});
