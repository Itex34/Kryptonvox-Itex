const DEFAULT_STATE = Object.freeze({
  enabled: false,
  url: '',
  size: 100,
});

const STORAGE_KEYS = {
  enabled: 'crosshairEnabled',
  url: 'crosshairUrl',
  size: 'crosshairSize',
};

export function loadCrosshairState() {
  const enabled = localStorage.getItem(STORAGE_KEYS.enabled) === 'true';
  const url = localStorage.getItem(STORAGE_KEYS.url) || DEFAULT_STATE.url;

  const rawSize = Number(localStorage.getItem(STORAGE_KEYS.size));
  const size = Number.isFinite(rawSize) && rawSize > 0
    ? rawSize
    : DEFAULT_STATE.size;

  return { enabled, url, size };
}

export function saveCrosshairState(state) {
  localStorage.setItem(STORAGE_KEYS.enabled, String(state.enabled));
  localStorage.setItem(STORAGE_KEYS.url, state.url);
  localStorage.setItem(STORAGE_KEYS.size, String(state.size));
}
