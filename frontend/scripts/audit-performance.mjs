import { mkdir, writeFile } from "node:fs/promises";
import lighthouse from "lighthouse";
import { chromium } from "@playwright/test";

const TARGET = process.env.AUDIT_URL || "http://127.0.0.1:3217";
const OUTPUT = "artifacts/lighthouse.json";
const MIN_SCORE = 0.95;
const DEBUG_PORT = 9222;

async function auditPage() {
  const chrome = await chromium.launch({
    args: [`--remote-debugging-port=${DEBUG_PORT}`, "--remote-debugging-address=127.0.0.1"],
  });
  try {
    const result = await lighthouse(TARGET, {
      port: DEBUG_PORT,
      output: "json",
      onlyCategories: ["performance", "accessibility", "seo"],
      logLevel: "error",
    });
    await mkdir("artifacts", { recursive: true });
    await writeFile(OUTPUT, result.report);
    const scores = Object.fromEntries(
      Object.entries(result.lhr.categories).map(([key, value]) => [key, value.score]),
    );
    console.info(JSON.stringify({ event: "lighthouse_result", scores }));
    if (scores.performance < MIN_SCORE) throw new Error("Mobile performance below budget.");
  } finally {
    await chrome.close();
  }
}

console.info(JSON.stringify({ event: "audit_mobile_page" }));
auditPage().catch((error) => {
  console.error(
    JSON.stringify({ event: "audit_failed", type: error.name, message: error.message }),
  );
  process.exitCode = 1;
});
