// utils/retryfetch.js
import fetch from "node-fetch";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchWithRetry(
  url,
  options = {},
  cfg = {}
) {
  const {
    retries = 8,
    initialDelay = 1000,
    factor = 1.8,
    maxDelay = 8000,
    retryStatus = [408, 429, 500, 502, 503, 504],
    retryCodes = ["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "EAI_AGAIN"],
    timeoutMs = 15000,
  } = cfg;

  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(t);

      if (!retryStatus.includes(res.status)) return res;
      if (attempt >= retries) return res;
    } catch (err) {
      const code = err?.code || err?.errno;
      const aborted = err?.name === "AbortError";
      const shouldRetry = aborted || retryCodes.includes(code);
      if (!shouldRetry || attempt >= retries) throw err;
    }

    await sleep(delay + Math.floor(Math.random() * 200));
    delay = Math.min(maxDelay, Math.round(delay * factor));
    attempt++;
  }
}
