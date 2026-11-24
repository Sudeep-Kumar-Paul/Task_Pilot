import { describe, it, expect } from "vitest";
import {
  EMPTY_PROFILE,
  EXAMPLES,
  MAX_RECONNECT_ATTEMPTS,
  makeMockFlow,
  parseServerMessage,
} from "./protocol";
describe("TaskPilot protocol", () => {
  it("uses the exact price comparison prompt", () => {
    expect(EXAMPLES[0]?.task).toBe(
      "Find the cheapest iPhone 15 Pro across Amazon, Flipkart, and Croma",
    );
  });
  it("uses the exact form prompt", () => {
    expect(EXAMPLES[1]?.task).toBe("Fill out this registration form with my details");
  });
  it("uses the exact order prompt", () => {
    expect(EXAMPLES[2]?.task).toBe("Check my latest order on Myntra");
  });
  it("limits reconnection to five attempts", () => {
    expect(MAX_RECONNECT_ATTEMPTS).toBe(5);
  });
  it.each([
    "broken json",
    "null",
    "[]",
    "{}",
    '{"type":"step","kind":"unknown","message":"x","step":1}',
    '{"type":"step","kind":"action","message":"x","step":0}',
    '{"type":"step","kind":"action","message":"x","step":"3"}',
    '{"type":"error","message":null}',
  ])("ignores malformed message %s without throwing", (raw) => {
    expect(parseServerMessage(raw)).toBeNull();
  });
  it("validates step data", () => {
    expect(
      parseServerMessage('{"type":"step","kind":"action","message":"Opening browser","step":3}'),
    ).toEqual({ type: "step", kind: "action", message: "Opening browser", step: 3 });
  });
  it("normalizes malformed result data without losing the answer", () => {
    expect(parseServerMessage('{"type":"result","message":"answer","data":[]}')).toEqual({
      type: "result",
      message: "answer",
      data: {},
    });
  });
  it("accepts done without additional fields", () => {
    expect(parseServerMessage('{"type":"done"}')).toEqual({ type: "done" });
  });
  it("price demo returns Flipkart as cheapest after streamed steps", () => {
    const flow = makeMockFlow(EXAMPLES[0]?.task ?? "", EMPTY_PROFILE);
    expect(flow.filter((v) => v.type === "step")).toHaveLength(6);
    expect(flow.find((v) => v.type === "result")).toMatchObject({
      data: { highlight: "₹74,900", source: "Flipkart" },
    });
    expect(flow.at(-1)).toEqual({ type: "done" });
  });
  it("form demo fills but does not submit", () => {
    const flow = makeMockFlow(EXAMPLES[1]?.task ?? "", { ...EMPTY_PROFILE, name: "Alex" });
    expect(flow.some((v) => v.type === "step" && v.message.includes("for Alex"))).toBe(true);
    expect(flow.find((v) => v.type === "result")).toMatchObject({
      data: { highlight: "Ready for review", detail: "4 fields filled · Not submitted" },
    });
  });
  it("order demo reports a delivery status", () => {
    expect(
      makeMockFlow(EXAMPLES[2]?.task ?? "", EMPTY_PROFILE).find((v) => v.type === "result"),
    ).toMatchObject({ data: { highlight: "Out for delivery", source: "Myntra" } });
  });
  it("custom requests never claim real browser execution", () => {
    expect(
      makeMockFlow("Research penguins", EMPTY_PROFILE).find((v) => v.type === "result"),
    ).toMatchObject({ data: { detail: "No external websites were accessed" } });
  });
});
