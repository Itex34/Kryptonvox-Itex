const DEFAULT_SKIN_REPLACEMENTS = Object.freeze({
  'https://voxiom.io/package/cb1d14c1ff0efb6a282b.png': 'https://i.imgur.com/sRUORwO.png',
  'https://voxiom.io/package/aef55bdd0c3c3c3734f8.png': 'https://i.imgur.com/0WkMmAR.png',
  'https://voxiom.io/package/ecca1227c2e0406be225.png': 'https://i.imgur.com/XBSg7G4.png',
});

const LOCAL_STORAGE_KEY_MAP = 'customSkinMap';
const LOCAL_STORAGE_KEY_ENABLED = 'useCustomSkins';


const textureCache = new Map();

let skinReplacements = loadUserSkinMap() ?? { ...DEFAULT_SKIN_REPLACEMENTS };
let patched = false;


export function initSkinSwapper() {
  if (patched) return;
  patched = true;

  if (localStorage.getItem(LOCAL_STORAGE_KEY_ENABLED) === null) {
    localStorage.setItem(LOCAL_STORAGE_KEY_ENABLED, 'true');
  }

  patchContext(WebGLRenderingContext);
  patchContext(window.WebGL2RenderingContext);

  detectGameJoin();
}


function patchContext(Context) {
  if (!Context) return;

  const proto = Context.prototype;

  const originalTexImage2D = proto.texImage2D;
  proto.texImage2D = function (...args) {
    const replaced = maybeReplaceSource(args);
    return originalTexImage2D.apply(this, replaced);
  };

  const originalTexSubImage2D = proto.texSubImage2D;
  proto.texSubImage2D = function (...args) {
    const replaced = maybeReplaceSource(args);
    return originalTexSubImage2D.apply(this, replaced);
  };
}

function maybeReplaceSource(args) {
  if (!isSkinSwapEnabled()) return args;

  const source = findImageSource(args);
  if (!(source instanceof HTMLImageElement)) return args;

  const customURL = skinReplacements[source.src];
  if (!customURL) return args;

  const replacement = textureCache.get(customURL);
  if (!replacement) {
    loadCustomSkin(customURL);
    return args;
  }

  return args.map(arg => (arg === source ? replacement : arg));
}


export function setSkinSwapEnabled(enabled) {
  localStorage.setItem(LOCAL_STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');

  if (!enabled) {
    textureCache.clear();
  } else {
    preloadAllSkins();
  }
}

export function isSkinSwapEnabled() {
  return localStorage.getItem(LOCAL_STORAGE_KEY_ENABLED) === 'true';
}

export function getSkinMap() {
  return { ...skinReplacements };
}

export function setSkinMap(newMap) {
  if (!newMap || typeof newMap !== 'object') {
    throw new Error('Skin map must be an object');
  }

  skinReplacements = { ...newMap };
  localStorage.setItem(LOCAL_STORAGE_KEY_MAP, JSON.stringify(skinReplacements));

  textureCache.clear();

  if (isSkinSwapEnabled()) {
    preloadAllSkins();
  }
}

export function resetSkinMap() {
  skinReplacements = { ...DEFAULT_SKIN_REPLACEMENTS };
  localStorage.removeItem(LOCAL_STORAGE_KEY_MAP);
  textureCache.clear();

  if (isSkinSwapEnabled()) {
    preloadAllSkins();
  }
}


function loadUserSkinMap() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_MAP);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function findImageSource(args) {
  return args.find(arg => arg instanceof HTMLImageElement || arg instanceof ImageBitmap);
}

function preloadAllSkins() {
  for (const url of Object.values(skinReplacements)) {
    if (url) loadCustomSkin(url);
  }
}

async function loadCustomSkin(url) {
  if (textureCache.has(url)) return;

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    await img.decode();

    const bitmap = await createImageBitmap(img);
    textureCache.set(url, bitmap);
  } catch (e) {
    console.warn('[SkinSwapper] Failed to load skin:', url, e);
  }
}


function detectGameJoin() {
  if (!isSkinSwapEnabled()) return;

  const hasWebGLCanvas = () => {
    const canvases = document.getElementsByTagName('canvas');
    for (const c of canvases) {
      try {
        if (c.getContext('webgl') || c.getContext('webgl2')) return true;
      } catch {}
    }
    return false;
  };

  const enableAndPreload = () => {
    setSkinSwapEnabled(true);
  };

  if (hasWebGLCanvas()) {
    enableAndPreload();
    return;
  }

  const observer = new MutationObserver(() => {
    if (hasWebGLCanvas()) {
      enableAndPreload();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
