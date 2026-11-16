// Vercel serverless function: natural voice for the Instructor, using Azure Speech (neural text-to-speech).
// The key stays here, in environment variables, and never reaches the browser.
//
//   GET  /api/tts  -> { ready: true|false }
//   POST /api/tts  -> audio/mpeg     body: { text, lang: "en" | "bn" }
//
// Environment variables:
//   AZURE_SPEECH_KEY     (required) key of your Azure "Speech" resource
//   AZURE_SPEECH_REGION  (required) its region, e.g. "eastus" or "southeastasia"
//   AZURE_VOICE_EN       (optional) default "en-US-AvaMultilingualNeural"
//   AZURE_VOICE_BN       (optional) default "bn-BD-NabanitaNeural"

const MAX_TEXT_CHARS = 1200;

const VOICES = {
  en: { voice: process.env.AZURE_VOICE_EN || "en-US-AvaMultilingualNeural", lang: "en-US", rate: "0%" },
  bn: { voice: process.env.AZURE_VOICE_BN || "bn-BD-NabanitaNeural", lang: "bn-BD", rate: "-4%" },
};

const escapeXml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function isReady() {
  return Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ready: isReady() });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!isReady()) {
    return res.status(503).json({ error: "not_configured" });
  }

  const { text, lang } = req.body || {};
  if (typeof text !== "string" || !text.trim() || text.length > MAX_TEXT_CHARS) {
    return res.status(400).json({ error: "bad_text" });
  }
  const v = VOICES[lang === "bn" ? "bn" : "en"];
  const region = process.env.AZURE_SPEECH_REGION.trim();
  if (!/^[a-z0-9]+$/i.test(region)) {
    return res.status(500).json({ error: "bad_region" });
  }

  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${v.lang}">` +
    `<voice name="${escapeXml(v.voice)}"><prosody rate="${v.rate}">${escapeXml(text.trim())}</prosody></voice></speak>`;

  try {
    const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY.trim(),
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "botstructor",
      },
      body: ssml,
    });
    if (!r.ok) {
      const detail = (await r.text().catch(() => "")).slice(0, 300);
      console.error(`Azure TTS error ${r.status}: ${detail}`);
      const error = r.status === 401 || r.status === 403 ? "bad_key" : r.status === 429 ? "rate_limited" : "upstream_error";
      return res.status(r.status === 429 ? 429 : 502).json({ error });
    }
    const audio = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(audio);
  } catch (error) {
    console.error("Azure TTS call failed:", error);
    return res.status(502).json({ error: "upstream_error" });
  }
}
