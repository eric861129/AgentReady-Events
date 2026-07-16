import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

describe("Day 1 reader entry", () => {
  it("documents direct branch, ZIP, install, start, and verification paths", () => {
    expect(readme).toContain("https://github.com/eric861129/AgentReady-Events/tree/day-01");
    expect(readme).toContain("https://github.com/eric861129/AgentReady-Events/archive/refs/heads/day-01.zip");
    expect(readme).toContain("git clone --branch day-01 --single-branch");
    expect(readme).toContain("npm ci");
    expect(readme).toContain("npx playwright install chromium");
    expect(readme).toContain("npm run dev");
    expect(readme).toContain("http://127.0.0.1:5173/");
    expect(readme).toContain("npm test");
    expect(readme).toContain("npm run test:e2e");
    expect(readme).toContain("npm run build");
  });
});

describe("Day 2 reader entry", () => {
  it("continues from day-01 and documents the focused Playwright replay", () => {
    expect(readme).toContain("https://github.com/eric861129/AgentReady-Events/tree/day-02");
    expect(readme).toContain("https://github.com/eric861129/AgentReady-Events/archive/refs/heads/day-02.zip");
    expect(readme).toContain("git switch day-02");
    expect(readme).toContain("tests/browser/day-02-actuation.spec.ts");
    expect(readme).toContain("--headed");
    expect(readme).toContain("Timeout 500ms exceeded");
    expect(readme).toContain("E2 synthetic");
  });
});
