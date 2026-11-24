export type StepKind = "thinking" | "action" | "observation" | "error" | "result";
export type Profile = { name: string; email: string; phone: string; address: string };
export type FeedStep = {
  id: string;
  step: number;
  kind: StepKind;
  message: string;
  screenshot?: string;
  timestamp: number;
};
export type ServerMessage =
  | { type: "step"; kind: "thinking" | "action" | "observation"; message: string; step: number; screenshot?: string }
  | { type: "result"; message: string; data: Record<string, unknown> }
  | { type: "error"; message: string }
  | { type: "done" };
export const EMPTY_PROFILE: Profile = { name: "", email: "", phone: "", address: "" };
export const MAX_RECONNECT_ATTEMPTS = 5;
export const EXAMPLES = [
  {
    id: "price",
    title: "Price comparison",
    task: "Find the cheapest iPhone 15 Pro across Amazon, Flipkart, and Croma",
    icon: "shopping",
    description: "One product. Three stores. The best price.",
  },
  {
    id: "form",
    title: "Form autofill",
    task: "Fill out this registration form with my details",
    icon: "form",
    description: "Let your agent handle the paperwork.",
  },
  {
    id: "order",
    title: "Order status",
    task: "Check my latest order on Myntra",
    icon: "package",
    description: "Get an update without the tab hopping.",
  },
] as const;
export function parseServerMessage(raw: unknown): ServerMessage | null {
  try {
    if (typeof raw !== "string") return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const v = value as Record<string, unknown>;
    if (v["type"] === "done") return { type: "done" };
    if (typeof v["message"] !== "string") return null;
    if (v["type"] === "error") return { type: "error", message: v["message"] };
    if (v["type"] === "result")
      return {
        type: "result",
        message: v["message"],
        data:
          v["data"] && typeof v["data"] === "object" && !Array.isArray(v["data"])
            ? (v["data"] as Record<string, unknown>)
            : {},
      };
    if (
      v["type"] === "step" &&
      (v["kind"] === "thinking" || v["kind"] === "action" || v["kind"] === "observation") &&
      typeof v["step"] === "number" &&
      Number.isInteger(v["step"]) &&
      v["step"] > 0
    )
      return {
        type: "step",
        kind: v["kind"],
        message: v["message"],
        step: v["step"],
        ...(typeof v["screenshot"] === "string" ? { screenshot: v["screenshot"] } : {}),
      };
    return null;
  } catch {
    return null;
  }
}
export function makeMockFlow(task: string, profile: Profile): ServerMessage[] {
  const kind = /iphone|price|cheapest|amazon|flipkart/i.test(task)
    ? "price"
    : /form|registration|fill/i.test(task)
      ? "form"
      : /order|myntra|delivery/i.test(task)
        ? "order"
        : "general";
  const steps: [
    ServerMessage extends never ? never : "thinking" | "action" | "observation",
    string,
  ][] =
    kind === "price"
      ? [
          [
            "thinking",
            "I’ll compare the iPhone 15 Pro (128 GB) across Amazon, Flipkart, and Croma, including availability and listed prices.",
          ],
          ["action", "Opening Amazon and searching for iPhone 15 Pro 128 GB."],
          ["observation", "Amazon lists the iPhone 15 Pro at ₹79,900. The product is in stock."],
          ["action", "Checking the same model on Flipkart and Croma."],
          [
            "observation",
            "Flipkart: ₹74,900 · Croma: ₹77,990. All three listings are for the 128 GB model.",
          ],
          ["thinking", "Flipkart has the lowest listed price, saving ₹5,000 compared with Amazon."],
        ]
      : kind === "form"
        ? [
            [
              "thinking",
              "I’ll inspect the registration form and map your profile details to its fields.",
            ],
            ["action", "Opening the registration page and locating the form."],
            ["observation", "Found fields for full name, email, phone number, and address."],
            [
              "action",
              `Filling the available fields${profile.name ? ` for ${profile.name}` : " using sample details in this mock demo"}.`,
            ],
            ["observation", "All required fields are populated and validation has passed."],
            [
              "thinking",
              "The form is ready for your review. I won’t submit without your approval.",
            ],
          ]
        : kind === "order"
          ? [
              [
                "thinking",
                "I’ll open Myntra, find your most recent order, and check its delivery timeline.",
              ],
              ["action", "Navigating to Myntra’s order history."],
              ["observation", "Found the latest order: Everyday cotton shirt · Order #MYN-284931."],
              ["action", "Opening the shipment tracking details."],
              [
                "observation",
                "The shipment has reached your local delivery hub and is out for delivery.",
              ],
              ["thinking", "I have the latest delivery update and estimated arrival time."],
            ]
          : [
              ["thinking", `Breaking down your request: ${task}`],
              ["action", "Opening the browser workspace and preparing the task."],
              ["observation", "The mock browser is ready. No external websites were accessed."],
              [
                "thinking",
                "Finishing this simulated run. A connected backend can execute your custom request.",
              ],
            ];
  const result =
    kind === "price"
      ? {
          message: "The best price is ₹74,900 on Flipkart.",
          data: {
            category: "price",
            highlight: "₹74,900",
            source: "Flipkart",
            detail: "iPhone 15 Pro · 128 GB",
            savings: "₹5,000 less than Amazon",
          },
        }
      : kind === "form"
        ? {
            message:
              "Your registration form is filled and ready for review. It has not been submitted.",
            data: {
              category: "form",
              highlight: "Ready for review",
              source: "Registration form",
              detail: "4 fields filled · Not submitted",
            },
          }
        : kind === "order"
          ? {
              message:
                "Your latest Myntra order is out for delivery. Estimated arrival: today, by 8 PM.",
              data: {
                category: "order",
                highlight: "Out for delivery",
                source: "Myntra",
                detail: "Order #MYN-284931 · Today, by 8 PM",
              },
            }
          : {
              message:
                "Mock task completed. Connect your browser-agent backend to execute this request on real websites.",
              data: {
                category: "general",
                highlight: "Demo complete",
                source: "Mock agent",
                detail: "No external websites were accessed",
              },
            };
  return [
    ...steps.map(([kind, message], index): ServerMessage => ({
      type: "step",
      kind,
      message,
      step: index + 1,
    })),
    { type: "result", ...result },
    { type: "done" },
  ];
}
