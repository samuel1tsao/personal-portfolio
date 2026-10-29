import { expect, test } from "@playwright/test";
import { chatRequestSchema } from "../../src/lib/chat-contract";

test("chat follow-ups send valid text history after SDK streamed replies", async ({ page }) => {
  const requests: unknown[] = [];
  await page.route("**/api/chat", async (route) => {
    const body = route.request().postDataJSON();
    requests.push(body);
    if (!chatRequestSchema.safeParse(body).success) {
      await route.fulfill({ status: 400, json: { error: "Invalid history" } });
      return;
    }
    const chunks = [
      { type: "start", messageId: `answer-${requests.length}` },
      { type: "start-step" },
      { type: "text-start", id: "text" },
      { type: "text-delta", id: "text", delta: "Published portfolio details. ".repeat(60) },
      { type: "text-end", id: "text" },
      { type: "finish-step" },
      { type: "finish", finishReason: "stop" },
    ];
    await route.fulfill({
      contentType: "text/event-stream",
      headers: { "x-vercel-ai-ui-message-stream": "v1" },
      body:
        chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") + "data: [DONE]\n\n",
    });
  });
  await page.goto("/chat");
  test.skip(
    await page.getByLabel("Your question").isDisabled(),
    "Requires chat-enabled local server; provider responses are intercepted.",
  );
  for (const question of ["What are you building?", "Tell me more.", "And your experience?"]) {
    await page.getByLabel("Your question").fill(question);
    await page.getByRole("button", { name: "Send", exact: false }).click();
    await expect(page.getByLabel("Your question")).toBeEnabled();
    await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  }
  expect(requests).toHaveLength(3);
  for (const body of requests) expect(chatRequestSchema.safeParse(body).success).toBe(true);
});
