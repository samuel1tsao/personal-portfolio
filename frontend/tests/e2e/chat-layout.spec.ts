import { expect, test } from "@playwright/test";

const LONG_ANSWER =
  "A detailed explanation of the published projects and engineering decisions.\n".repeat(150) +
  "End of detailed answer.";
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 667, height: 390 },
];

for (const viewport of VIEWPORTS) {
  for (const floating of [false, true]) {
    test(`long answers scroll with a pinned composer: ${floating ? "floating" : "page"} ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.route("**/api/chat", async (route) => {
        const chunks = [
          { type: "start", messageId: `answer-${Date.now()}` },
          { type: "start-step" },
          { type: "text-start", id: "text" },
          { type: "text-delta", id: "text", delta: LONG_ANSWER },
          { type: "text-end", id: "text" },
          { type: "finish-step" },
          { type: "finish", finishReason: "stop" },
        ];
        await route.fulfill({
          contentType: "text/event-stream",
          headers: { "x-vercel-ai-ui-message-stream": "v1" },
          body:
            chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") +
            "data: [DONE]\n\n",
        });
      });
      await page.goto(floating ? "/" : "/chat");
      if (floating) await page.getByRole("button", { name: "Open chat", exact: true }).click();
      const input = page.getByLabel("Your question");
      test.skip(
        await input.isDisabled(),
        "Requires enabled UI; all provider responses are intercepted.",
      );
      const conversation = page.getByRole("list", { name: "Conversation" });
      await input.fill("Tell me about your projects.");
      await page.getByRole("button", { name: "Send", exact: false }).scrollIntoViewIfNeeded();
      const before = await input.boundingBox();
      await page.getByRole("button", { name: "Send", exact: false }).click();
      await expect(conversation).toContainText("End of detailed answer.");
      await expect(input).toBeEnabled();
      await expect(input).toBeInViewport();
      const after = await input.boundingBox();
      expect(Math.abs(after!.y - before!.y)).toBeLessThanOrEqual(1);
      expect(
        await conversation.evaluate((element) => element.scrollHeight > element.clientHeight),
      ).toBe(true);
      const bounds = await conversation.boundingBox();
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(after!.y);
      await conversation.focus();
      await page.keyboard.press("Control+End");
      await expect
        .poll(() =>
          conversation.evaluate(
            (element) => element.scrollHeight - element.scrollTop - element.clientHeight,
          ),
        )
        .toBeLessThanOrEqual(2);
      await input.fill("I can still ask a follow-up.");
      await expect(page.getByRole("button", { name: "Send", exact: false })).toBeEnabled();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  }
}
