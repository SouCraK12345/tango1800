const VOLUME_STORAGE_KEY = "volume_level_v1";
const DEFAULT_VOLUME = 1;

export function getVolumeLevel() {
  const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
  if (stored === null) return DEFAULT_VOLUME;
  const parsed = Number(stored);
  if (Number.isNaN(parsed)) return DEFAULT_VOLUME;
  return Math.min(1, Math.max(0, parsed));
}

export function setVolumeLevel(volume) {
  const normalized = Math.min(1, Math.max(0, Number(volume)));
  localStorage.setItem(VOLUME_STORAGE_KEY, String(normalized));
}

const HAPTICS_STORAGE_KEY = "haptics_enabled_v1";
const DEFAULT_HAPTICS_ENABLED = true;

export function getHapticsEnabled() {
  const stored = localStorage.getItem(HAPTICS_STORAGE_KEY);
  if (stored === null) return DEFAULT_HAPTICS_ENABLED;
  return stored === "true";
}

export function setHapticsEnabled(enabled) {
  localStorage.setItem(HAPTICS_STORAGE_KEY, String(Boolean(enabled)));
}


const SPEECH_STORAGE_KEY = "speech_enabled_v1";
const DEFAULT_SPEECH_ENABLED = true;

export function getSpeechEnabled() {
  const stored = localStorage.getItem(SPEECH_STORAGE_KEY);
  if (stored === null) return DEFAULT_SPEECH_ENABLED;
  return stored === "true";
}

export function setSpeechEnabled(enabled) {
  localStorage.setItem(SPEECH_STORAGE_KEY, String(Boolean(enabled)));
}
