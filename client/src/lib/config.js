/**
 * Runtime config: reads from window.config (set by config.js loaded in index.html).
 * In local dev, when config.js is not served, falls back to config.example.json.
 * Production must always serve config.js at %PUBLIC_URL%/config.js.
 */
import fallbackConfig from "../config/config.example.json";

export function getConfig() {
  if (typeof window !== "undefined" && window.config != null) {
    return window.config;
  }
  return fallbackConfig;
}

/** Convenience: config object for direct use (same as getConfig()). */
export const config = typeof window !== "undefined" && window.config != null
  ? window.config
  : fallbackConfig;
