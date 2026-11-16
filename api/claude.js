// Vercel serverless function: the Instructor bot's connection to the Claude API.
// The API key lives only here, in the ANTHROPIC_API_KEY environment variable,
// and is never sent to the browser.
//
//   GET  /api/claude  -> { ready: true|false }   (is a key configured?)
//   POST /api/claude  -> { text }                 body: { prompt, images?, quick? }
//        images: [{ media_type: "image/jpeg", data: "<base64>" }]
//        quick:  true for short chat answers (lower effort, faster)

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5-5";
const MAX_PROMPT_CHARS = 40_000;
const MAX_IMAGES = 6;
const MAX_IMAGE_BASE64_CHARS = 1_500_000; // ~1.1 MB per image after decoding
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

function readImages(images) {
  if (images == null) return [];
  if (!Array.isArray(images) || images.length > MAX_IMAGES) return null;
  const blocks = [];
  for (const img of images) {
    if (
      !img ||
      !IMAGE_TYPES.has(img.media_type) ||
      typeof img.data !== "string" ||
      img.data.length === 0 ||
      img.data.length > MAX_IMAGE_BASE64_CHARS
    ) {
      return null;
    }
    blocks.push({
      type: "image",
      source: { type: "base64", media_type: img.media_type, data: img.data },
    });
  }
  return blocks;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json({ ready: Boolean(process.env.ANTHROPIC_API_KEY) });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "not_configured" });
  }

  const { prompt, images, quick } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_PROMPT_CHARS) {
    return res.status(400).json({ error: "bad_prompt" });
  }
  const imageBlocks = readImages(images);
  if (imageBlocks === null) {
    return res.status(400).json({ error: "bad_images" });
  }

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: quick ? "low" : "medium" },
      // If a safety check declines the request, the API retries it on a suitable fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [
        { role: "user", content: [...imageBlocks, { type: "text", text: prompt }] },
      ],
    });

    if (response.stop_reason === "refusal") {
      return res.status(200).json({ text: "", refused: true });
    }
    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    return res.status(200).json({ text, stop_reason: response.stop_reason });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Claude API: invalid API key");
      return res.status(502).json({ error: "bad_api_key" });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "rate_limited" });
    }
    if (error instanceof Anthropic.BadRequestError) {
      console.error("Claude API bad request:", error.message);
      return res.status(400).json({ error: "bad_request" });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}:`, error.message);
      return res.status(502).json({ error: "upstream_error" });
    }
    console.error("Claude API call failed:", error);
    return res.status(500).json({ error: "server_error" });
  }
}
