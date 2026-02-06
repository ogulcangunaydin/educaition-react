/**
 * Device Fingerprint Utility
 *
 * Generates a stable browser/device fingerprint by hashing hardware and
 * software signals that don't change across sessions or incognito mode.
 *
 * Signals used:
 *  - Screen dimensions & colour depth
 *  - Hardware concurrency (CPU cores) & device memory
 *  - Timezone & language
 *  - Platform / user-agent data
 *  - WebGL vendor & renderer (GPU)
 *  - Canvas rendering fingerprint
 *
 * The result is a SHA-256 hex digest (64 chars) cached in localStorage
 * so it only needs to be computed once per browser profile.
 */

const CACHE_KEY = "educaition_device_fp";

// ---------------------------------------------------------------------------
// Signal collectors
// ---------------------------------------------------------------------------

const getScreenSignals = () =>
  [screen.width, screen.height, screen.colorDepth, window.devicePixelRatio].join("|");

const getHardwareSignals = () =>
  [
    navigator.hardwareConcurrency || "unknown",
    navigator.deviceMemory || "unknown",
    navigator.maxTouchPoints ?? "unknown",
  ].join("|");

const getLocaleSignals = () =>
  [
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.languages?.join(",") || "",
    navigator.platform || "",
  ].join("|");

/**
 * WebGL renderer / vendor — highly discriminating because it exposes
 * the actual GPU model string.
 */
const getWebGLSignals = () => {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "no-webgl";

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return "no-debug-info";

    const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
    return `${vendor}|${renderer}`;
  } catch {
    return "webgl-error";
  }
};

/**
 * Canvas fingerprint — different GPUs / font stacks produce subtly
 * different rasterisations of the same draw commands.
 */
const getCanvasFingerprint = () => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";

    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("educaition-fp", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("educaition-fp", 4, 17);

    return canvas.toDataURL();
  } catch {
    return "canvas-error";
  }
};

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

const sha256 = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate (or return cached) device fingerprint.
 *
 * @returns {Promise<string>} 64-char hex SHA-256 digest
 */
export const getDeviceFingerprint = async () => {
  // Return cached value if available
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached && cached.length === 64) return cached;

  const signals = [
    getScreenSignals(),
    getHardwareSignals(),
    getLocaleSignals(),
    getWebGLSignals(),
    getCanvasFingerprint(),
  ].join("|||");

  const hash = await sha256(signals);

  // Cache so we don't recompute on every call
  try {
    localStorage.setItem(CACHE_KEY, hash);
  } catch {
    // localStorage unavailable — non-critical
  }

  return hash;
};

/**
 * Synchronous getter — returns the cached fingerprint or a fallback UUID.
 * Prefer getDeviceFingerprint() (async) when possible.
 */
export const getDeviceFingerprintSync = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached && cached.length === 64) return cached;

  // Fingerprint hasn't been computed yet — return a temporary UUID
  // and trigger async computation for next time.
  getDeviceFingerprint().catch(() => {});
  return cached || crypto.randomUUID?.() || Math.random().toString(36).slice(2);
};

export default getDeviceFingerprint;
