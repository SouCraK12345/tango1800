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
