// Runs the free Kokoro-82M voice model (Apache-2.0) in a background thread, so the page stays smooth.
// The model (~90 MB) is downloaded once from Hugging Face and then cached by the browser.
import { KokoroTTS } from "./kokoro.web.js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
let ttsPromise = null;

function load() {
  if (!ttsPromise) {
    ttsPromise = KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: "q8",
      device: "wasm",
      progress_callback: (p) => {
        if (p && p.status === "progress" && /\.onnx$/.test(p.file || "")) {
          postMessage({ type: "progress", pct: Math.round(p.progress || 0) });
        }
      },
    }).catch((err) => {
      ttsPromise = null;
      throw err;
    });
  }
  return ttsPromise;
}

onmessage = async (e) => {
  const m = e.data || {};
  if (m.type === "load") {
    try {
      await load();
      postMessage({ type: "ready" });
    } catch (err) {
      postMessage({ type: "error", error: String((err && err.message) || err) });
    }
  } else if (m.type === "speak") {
    try {
      const tts = await load();
      const audio = await tts.generate(m.text, { voice: m.voice || "af_heart", speed: m.speed || 1 });
      const wav = audio.toWav();
      postMessage({ type: "audio", id: m.id, wav }, [wav]);
    } catch (err) {
      postMessage({ type: "audio", id: m.id, error: String((err && err.message) || err) });
    }
  }
};
