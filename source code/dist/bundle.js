const Storage = {
  get: (key, defaultValue = null) => localStorage.getItem(key) ?? defaultValue,
  
  getJSON: (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: (key, value) => localStorage.setItem(key, value),
  
  setJSON: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  
  remove: (key) => localStorage.removeItem(key),
  
};

const UI = {
  container: null,
  styleInjected: false,

  init() {
    if (this.container) return this.container;

    this.createContainer();
    this.injectStyles();
    document.body.appendChild(this.container);

    return this.container;
  },

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'custom-ui-container';

    Object.assign(this.container.style, {
      position: 'absolute',
      top: '10px',
      right: '10px',
      padding: '10px',
      backgroundColor: '#141414',
      display: Storage.get('isContainerHidden') === 'true' ? 'none' : 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      maxHeight: '555px',
      border: '1px solid #555555',
      fontFamily: 'cursive',
      zIndex: 9999,
    });
  },

  injectStyles() {
    if (this.styleInjected) return;
    this.styleInjected = true;

    const style = document.createElement('style');
    style.textContent = `
      #custom-ui-container::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      #custom-ui-container::-webkit-scrollbar-thumb {
        background-color: #888;
        border-radius: 10px;
      }
      #custom-ui-container::-webkit-scrollbar-track {
        background-color: #333;
      }
    `;

    document.head.appendChild(style);
    this.container.style.scrollbarWidth = 'thin';
    this.container.style.scrollbarColor = '#888 #333';
  },
};

function createElement(tag, options = {}) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(options)) {
    if (key === 'style') Object.assign(el.style, value);
    else if (key in el) el[key] = value;
    else el.setAttribute(key, value);
  }

  return el;
}

const FocusMode = {
  checkbox: null,

  init(container) {
    this.createUI(container);
    this.loadState();

    window.addEventListener('focusKeybindPressed', () => {
      this.checkbox.checked = !this.checkbox.checked;
      this.apply();
    });
  },

  createUI(container) {
    const wrapper = createElement('div', {
      style: { display: 'flex', alignItems: 'center', marginTop: '7px' },
    });

    this.checkbox = createElement('input', { type: 'checkbox' });

    const label = createElement('span', {
      textContent: 'focus mode',
      style: { fontSize: '14px', marginLeft: '8px' },
    });

    wrapper.append(this.checkbox, label);
    container.appendChild(wrapper);

    this.checkbox.addEventListener('change', () => this.apply());
  },

  loadState() {
    this.checkbox.checked = Storage.get('useFocusMode') === 'true';
    this.apply();
  },

  apply() {
    const enabled = this.checkbox.checked;
    Storage.set('useFocusMode', enabled ? 'true' : 'false');

    const targets = document.querySelectorAll(
      'table.sc-fKknU.dbJyuA, .sc-erFXsz.cxSTIe, .sc-eoHXOn.lpdfTz'
    );

    targets.forEach(el => {
      el.style.setProperty('visibility', enabled ? 'hidden' : '', 'important');
    });

    document.querySelectorAll('.sc-kqnjJL').forEach(el => {
      el.style.marginLeft = enabled ? '-35px' : '';
    });
  },
};

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

function loadCrosshairState() {
  const enabled = localStorage.getItem(STORAGE_KEYS.enabled) === 'true';
  const url = localStorage.getItem(STORAGE_KEYS.url) || DEFAULT_STATE.url;

  const rawSize = Number(localStorage.getItem(STORAGE_KEYS.size));
  const size = Number.isFinite(rawSize) && rawSize > 0
    ? rawSize
    : DEFAULT_STATE.size;

  return { enabled, url, size };
}

function saveCrosshairState(state) {
  localStorage.setItem(STORAGE_KEYS.enabled, String(state.enabled));
  localStorage.setItem(STORAGE_KEYS.url, state.url);
  localStorage.setItem(STORAGE_KEYS.size, String(state.size));
}

function getOrCreateCrosshair() {
  const app = document.getElementById('app');
  if (!app) return null;

  let el = document.getElementById('custom-crosshair');
  if (el) return el;

  el = document.createElement('div');
  el.id = 'custom-crosshair';

  Object.assign(el.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    boxSizing: 'content-box',
  });

  app.insertAdjacentElement('afterbegin', el);

  return el;
}

function renderCrosshair(state) {
  if (!state?.enabled || !state?.url) {
    const existing = document.getElementById('custom-crosshair');
    if (existing) existing.style.display = 'none';
    return;
  }

  const el = getOrCreateCrosshair();
  if (!el) return; 
  Object.assign(el.style, {
    width: `${state.size}px`,
    height: `${state.size}px`,
    backgroundImage: `url("${state.url}")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    display: 'block',
  });
}

const CrosshairUI = {
  state: null,

  init(parentContainer) {
    this.createUI(parentContainer);
    this.state = loadCrosshairState();
    this.syncUI();
    this.bindEvents();
    renderCrosshair(this.state);
  },

  createUI(parent) {
    this.container = createElement('div', {
      style: { display: 'flex', flexDirection: 'column', marginTop: '10px' },
    });

    this.enableCheckbox = createElement('input', { type: 'checkbox' });


    const enableLabel = createElement('label', {
      textContent: 'enable custom crosshair',
      style: { marginLeft: '10px', fontSize: '14px' }
    }); 


    const enableRow = createElement('div');
    enableRow.append(this.enableCheckbox, enableLabel);

    this.urlInput = createElement('input', {
      type: 'text',
      placeholder: 'Enter URL',
      style: {
        background: '#3c3c3c',
        color: 'white',
        border: 'none',
        padding: '4px',
        marginTop: '10px',
      },
    });

    this.sizeSlider = createElement('input', {
      type: 'range',
      min: 1,
      max: 200,
        style: {  marginTop: '10px' },
    });

    this.sizeDisplay = createElement('span');

    this.container.append(enableRow, this.urlInput, this.sizeSlider, this.sizeDisplay);
    parent.appendChild(this.container);
  },

  syncUI() {
    this.enableCheckbox.checked = this.state.enabled;
    this.urlInput.value = this.state.url;
    this.sizeSlider.value = this.state.size;
    this.sizeDisplay.textContent = `${this.state.size}px`;
  },

  bindEvents() {
    const update = () => {
      const size = Math.max(1, Math.min(200, Number(this.sizeSlider.value)));

      this.state = {
        enabled: this.enableCheckbox.checked,
        url: this.urlInput.value.trim(),
        size,
      };

      this.sizeSlider.value = size;
      this.sizeDisplay.textContent = `${size}px`;

      saveCrosshairState(this.state);
      renderCrosshair(this.state);
    };

    this.enableCheckbox.addEventListener('change', update);
    this.urlInput.addEventListener('input', update);
    this.sizeSlider.addEventListener('input', update);
  },
};

const Crosshair = {
  init(container) {
    CrosshairUI.init(container);
  },
};

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


function initSkinSwapper() {
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


function setSkinSwapEnabled(enabled) {
  localStorage.setItem(LOCAL_STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');

  if (!enabled) {
    textureCache.clear();
  } else {
    preloadAllSkins();
  }
}

function isSkinSwapEnabled() {
  return localStorage.getItem(LOCAL_STORAGE_KEY_ENABLED) === 'true';
}

function getSkinMap() {
  return { ...skinReplacements };
}

function setSkinMap(newMap) {
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

function resetSkinMap() {
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

// features/autoTranslate.js

let injected = false;
const STORAGE_KEY = 'scriptEnabled';

function initAutoTranslate() {
  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    startAutoTranslate();
  }
}

function startAutoTranslate() {
  injectTranslatorIfNeeded();
  runInPage(() => window.__AutoTranslator?.start());
}

function stopAutoTranslate() {
  runInPage(() => window.__AutoTranslator?.stop());
}

function injectTranslatorIfNeeded() {
  if (injected) return;
  injected = true;

  const script = document.createElement('script');
  script.textContent = getInjectedCode();
  document.documentElement.appendChild(script);
  script.remove();
}

function runInPage(fn) {
  const script = document.createElement('script');
  script.textContent = `(${fn})();`;
  document.documentElement.appendChild(script);
  script.remove();
}

function getInjectedCode() {
  return `
(() => {
  if (window.__AutoTranslator) return;

  const TARGET_SELECTOR = '.sc-wkwDy > span:last-child';
  const cache = new Map();
  let observer = null;

  const languageNames = {
    ja: 'japanese', ko: 'korean',
    'zh-CN': 'chinese (simplified)',
    'zh-TW': 'chinese (traditional)',
    fr: 'french', de: 'german', es: 'spanish',
    ru: 'russian', ar: 'arabic', it: 'italian',
    pt: 'portuguese', nl: 'dutch', tr: 'turkish',
    pl: 'polish', id: 'indonesian', th: 'thai',
    vi: 'vietnamese', hi: 'hindi',
    sv: 'swedish', tl: 'tagalog'
  };

  function start() {
    if (observer) return;

    observer = new MutationObserver(handleMutations);
    observer.observe(document.body, { childList: true, subtree: true });

    document.querySelectorAll(TARGET_SELECTOR).forEach(translateElement);
  }

  function stop() {
    observer?.disconnect();
    observer = null;
    removeAllTranslations();
  }

  function handleMutations(mutations) {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;

        const target =
          node.matches?.(TARGET_SELECTOR)
            ? node
            : node.querySelector?.(TARGET_SELECTOR);

        if (target && !target.dataset.translated) {
          translateElement(target);
        }
      }
    }
  }

  function removeAllTranslations() {
    document.querySelectorAll('[data-translated="true"]').forEach(el => {
      el.textContent = el.dataset.originalText || el.textContent;
      el.removeAttribute('data-translated');
    });
  }

  async function translateElement(el) {
    const text = el.textContent.trim();
    if (!text) return;

    const color = getComputedStyle(el).color;
    if (color !== 'rgb(255, 255, 255)') return;

    if (cache.has(text)) {
      applyTranslation(el, text, cache.get(text));
      return;
    }

    const result = await detectAndTranslate(text);
    if (!result) return;

    cache.set(text, result);
    applyTranslation(el, text, result);
  }

  function applyTranslation(el, original, { translatedText, language }) {
    if (el.dataset.translated === 'true') return;

    el.dataset.originalText = original;
    el.dataset.translated = 'true';

    const langName = languageNames[language] || language || 'unknown';

    el.innerHTML = \`
      \${translatedText}
      <span style="color:#B0B0B0;"> (\${langName})</span>
      <span class="view-original"
        style="color:#87CEFA; cursor:pointer; text-decoration:underline; font-size:0.9em;">
        view original
      </span>
    \`;

    el.querySelector('.view-original').onclick = () => {
      el.textContent = original;
      el.dataset.translated = 'false';
    };
  }

  async function detectAndTranslate(text) {
    try {
      const url =
        'https://translate.googleapis.com/translate_a/single' +
        '?client=gtx&sl=auto&tl=en&dt=t&q=' +
        encodeURIComponent(text);

      const res = await fetch(url);
      const data = await res.json();

      return {
        translatedText: data[0].map(x => x[0]).join(''),
        language: data[2] || 'unknown'
      };
    } catch {
      return null;
    }
  }

  window.__AutoTranslator = { start, stop };
})();
`;
}

const CONFIG = Object.freeze({
  SKIN_URLS: {
    DEFAULT: 'https://voxiom.io/package/cb1d14c1ff0efb6a282b.png',
    RUBY: 'https://voxiom.io/package/aef55bdd0c3c3c3734f8.png',
    SAPPHIRE: 'https://voxiom.io/package/ecca1227c2e0406be225.png'
  },
  COLORS: {
    default: { head: '#24b44d', body: '#ee1c23' },
    ruby: { head: '#ffffff', body: '#ee1c23' },
    sapphire: { head: '#ffffff', body: '#1919ff' }
  },
  DEFAULT_KEYBINDS: {
    FOCUS: { key: 'k', modifier: 'alt' },
    CONTAINER: { key: 'z', modifier: 'alt' }
  }
});

function createResetButton(parentContainer) {
  const btn = document.createElement('button');
  btn.textContent = 'restore all defaults';

  btn.style.cssText = `
    padding: 3px;
    cursor: pointer;
    background: none;
    border: 1px solid white;
    color: white;
    font-size: 12px;
    transition: background 0.1s ease;
  `;

  btn.title = 'resets everything into default';

  btn.addEventListener('mouseover', () => {
    btn.style.background = '#b10000';
  });

  btn.addEventListener('mouseout', () => {
    btn.style.background = 'none';
  });

  btn.addEventListener('click', () => {
    const confirmation = confirm(
      'This action cannot be undone. Are you sure you want to reset everything?'
    );
    if (confirmation) {
      resetAllSettings();
    }
  });

  parentContainer.appendChild(btn);
}

function resetAllSettings() {
  Storage.remove('crosshairEnabled');
  Storage.remove('crosshairUrl');
  Storage.remove('crosshairSize');

  Storage.set('mentionsEnabled', 'false');
  Storage.remove('mentionValues');

  Storage.set('scriptEnabled', 'false');

  Storage.set('useDefaultSkin', 'false');

  Storage.set('useFocusMode', 'false');

  Storage.set('cssCheckbox', 'false');
  Storage.remove('customCSS');

  Storage.set('focusKeybind', JSON.stringify(CONFIG.DEFAULT_KEYBINDS.FOCUS));
  Storage.set('containerKeybind', JSON.stringify(CONFIG.DEFAULT_KEYBINDS.CONTAINER));

  Storage.set('uiHintDisabled', 'false');

  Storage.set('translateMsg', 'false');

  Storage.set('isContainerHidden', 'false');

  Storage.set('keybindFormVisible', 'false');

  const customStyleTag = document.querySelector('style[data-custom="true"]');
  if (customStyleTag) customStyleTag.remove();

  location.reload();
}

const MAX_CACHE_SIZE = 200;

const Translator = {
  uiContainer: null,
  inputBox: null,
  langSelect: null,
  translateCheckbox: null,
  cache: new Map(),

  init(parentContainer) {
    this.createTranslatorToggle(parentContainer);

    
    this.createAutoTranslateToggle(parentContainer);

    this.createFloatingUI();
    this.applyInitialState();

    initAutoTranslate();

    window.addEventListener('resize', () => this.updateUIPosition());
  },

  createTranslatorToggle(parent) {
    const wrapper = createElement('div', {
      style: { display: 'flex', alignItems: 'center', marginTop: '10px' }
    });

    this.translateCheckbox = createElement('input', { type: 'checkbox' });

    const label = createElement('label', {
      textContent: 'chat translator',
      style: { marginLeft: '10px', fontSize: '14px' }
    });

    wrapper.append(this.translateCheckbox, label);
    parent.appendChild(wrapper);

    this.translateCheckbox.addEventListener('change', () => {
      const enabled = this.translateCheckbox.checked;
      Storage.set('translateMsg', String(enabled));
      enabled ? this.enable() : this.disable();
    });
  },

  createFloatingUI() {
    this.uiContainer = createElement('div', {
      style: {
        position: 'absolute',
        background: 'rgba(0,0,0,0.3)',
        padding: '8px',
        zIndex: '800',
        display: 'none',
        borderTop: '1px solid grey',
        fontSize: '14px'
      }
    });

    this.inputBox = createElement('input', {
      type: 'text',
      placeholder: 'Alt + Shift to type',
      style: {
        
        padding: '5px',
        fontSize: '12px',
        color: 'white',
        border: '1px solid grey',
        background: 'rgba(0,0,0,0.2)'
      }
    });

    this.langSelect = this.createLangSelect();
    this.uiContainer.append(this.inputBox, this.langSelect);
    document.body.appendChild(this.uiContainer);

    document.addEventListener('keydown', ev => {
      if (ev.altKey && ev.shiftKey) {
        ev.preventDefault();
        this.inputBox.focus();
      }
    });

    let debounce;
    this.inputBox.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        const text = this.inputBox.value.trim();
        if (!text) {
          this.updateOutputValue('');
          return;
        }
        const translated = await this.translateText(
          text,
          this.langSelect.value
        );
        this.updateOutputValue(translated);
      }, 300);
    });

    this.inputBox.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') this.inputBox.value = '';
      ev.stopPropagation();
    });
  },

  createLangSelect() {
    const languages = {
      ja: 'Japanese',
      ko: 'Korean',
      fr: 'French',
      de: 'German',
      es: 'Spanish',
      ru: 'Russian',
      'zh-CN': 'Chinese (Simplified)'
    };

    const select = createElement('select', {
      style: {
        background: 'rgba(0,0,0,0.2)',
        color: 'white',
        fontSize: '12px'
      }
    });
  
    for (const code in languages) {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = languages[code];
      select.appendChild(opt);
    }

    return select;
  },

  applyInitialState() {
    const enabled = Storage.get('translateMsg') === 'true';
    this.translateCheckbox.checked = enabled;
    if (enabled) this.enable();

    // auto-translate sync
    if (localStorage.getItem('scriptEnabled') === 'true') {
        startAutoTranslate();
    }
  },


  enable() {
    this.uiContainer.style.display = 'flex';
    this.uiContainer.style.flexDirection = 'column';
    this.updateUIPosition();
  },

  disable() {
    this.uiContainer.style.display = 'none';
  },

  getChatInput() {
    return document.querySelector('.sc-dpAhYB.ipDvnq');
  },

  updateUIPosition() {
    const target = this.getChatInput();
    if (!target || this.uiContainer.style.display === 'none') return;

    const rect = target.getBoundingClientRect();
    this.uiContainer.style.top = rect.bottom + 'px';
    this.uiContainer.style.left = rect.left + 'px';
    this.uiContainer.style.width =
      Math.max(200, rect.width - 16) + 'px';
  },

  async translateText(text, targetLang) {
    const key = text + '|' + targetLang;
    if (this.cache.has(key)) return this.cache.get(key);

    try {
      const res = await fetch(
        'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' +
          targetLang +
          '&dt=t&q=' +
          encodeURIComponent(text)
      );
      const data = await res.json();
      const translated = data[0].map(x => x[0]).join('');

      this.cache.set(key, translated);
      if (this.cache.size > MAX_CACHE_SIZE) {
        this.cache.delete(this.cache.keys().next().value);
      }

      return translated;
    } catch {
      return text;
    }
  },

  updateOutputValue(text) {
    const output = this.getChatInput();
    if (!output) return;

    const desc = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    );
    const setter = desc && desc.set;

    if (setter) setter.call(output, text);
    else output.value = text;

    output.dispatchEvent(new Event('input', { bubbles: true }));
  },



  createAutoTranslateToggle(parent) {
  const wrapper = createElement('div', {
      style: { display: 'flex', alignItems: 'center', marginTop: '10px' }
  });

  const checkbox = createElement('input', { type: 'checkbox' });
  checkbox.checked = localStorage.getItem('scriptEnabled') === 'true';

  const label = createElement('label', {
    textContent: 'auto-translate incoming messages',
    style: { marginLeft: '10px', fontSize: '14px' }
  });

  checkbox.addEventListener('change', () => {
    const enabled = checkbox.checked;
    localStorage.setItem('scriptEnabled', enabled);
    enabled ? startAutoTranslate() : stopAutoTranslate();
  });

  wrapper.append(checkbox, label);
  parent.appendChild(wrapper);
},

};

const Mentions = {
  checkbox: null,
  input: null,
  mentionValues: [],
  observer: null,

  init(container) {
    this.createUI(container);
    this.loadState();
    this.attachObserver();
  },

  // ---------------- UI ----------------

  createUI(container) {
    const wrapper = createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginTop: '10px',
      },
    });

    const row = createElement('div', {
      style: { display: 'flex', alignItems: 'center'},
    });

    this.checkbox = createElement('input', { type: 'checkbox' });

    const label = createElement('span', {
      textContent: 'mentions detector',
      style: { marginLeft: '10px', fontSize: '14px' },
    });

    row.append(this.checkbox, label);

    this.input = createElement('input', {
      type: 'text',
      placeholder: 'comma separated (e.g. itex, generic)',
      style: {
        background: '#3c3c3c',
        color: 'white',
        border: 'none',
        padding: '4px',
      },
    });

    wrapper.append(row, this.input);
    container.appendChild(wrapper);

    const update = () => {
      Storage.set('mentionsEnabled', this.checkbox.checked ? 'true' : 'false');
      Storage.set('mentionValues', this.input.value);
      this.parseValues();
    };

    this.checkbox.addEventListener('change', update);
    this.input.addEventListener('input', update);
  },

  loadState() {
    this.checkbox.checked = Storage.get('mentionsEnabled') === 'true';
    this.input.value = Storage.get('mentionValues') || '';
    this.parseValues();
  },

  parseValues() {
    this.mentionValues = this.input.value
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
  },

  // ---------------- Observer ----------------

  attachObserver() {
    if (this.observer) return;

    const audio = new Audio(
      'https://kryptonvox.netlify.app/notification.mp3'
    );

    this.observer = new MutationObserver(mutations => {
      if (!this.checkbox.checked || this.mentionValues.length === 0) return;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;

          const item = node.matches('.sc-wkwDy.gTfPhn')
            ? node
            : node.querySelector?.('.sc-wkwDy.gTfPhn');

          if (!item) continue;

          this.processItem(item, audio);
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },

  processItem(item, audio) {
    if (item.dataset.mentionProcessed) return;
    item.dataset.mentionProcessed = 'true';

    const contentEl = item.querySelector('span:last-child');
    if (!contentEl) return;

    const text = contentEl.textContent.toLowerCase();

    const matched = this.mentionValues.some(v =>
      text.includes(v.toLowerCase())
    );

    if (!matched) return;

    item.style.background = 'rgba(255, 204, 77, 0.2)';
    item.style.margin = '5px 0';

    audio.currentTime = 0;
    audio.play().catch(() => {});
  },
};

const Keybinds = {
  focusKeybind: { ...CONFIG.DEFAULT_KEYBINDS.FOCUS },
  containerKeybind: { ...CONFIG.DEFAULT_KEYBINDS.CONTAINER },
  focusKeyHandler: null,
  containerKeyHandler: null,

  init(parentContainer) {
    this.loadKeybinds();
    this.createKeybindForm(parentContainer);
    this.attachEventListeners();
  },

  createKeybindForm(parent) {
    const dropdownWrapper = createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '7px',
      },
    });

    const dropdown = createElement('span', {
      style: {
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
      },
    });
    dropdown.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="17" height="17" style="margin-bottom:-5px" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7"/></svg><span>advanced</span>`;

    const dropdownHr = createElement('hr', {
      style: {
        marginTop: '4px',
        border: '1px solid gray',
        marginLeft: '5px',
        width: '191px',
      },
    });

    dropdownWrapper.appendChild(dropdown);
    dropdownWrapper.appendChild(dropdownHr);
    parent.appendChild(dropdownWrapper);

    const form = createElement('div', {
      id: 'keybindForm',
      style: {
        display: 'none',
        flexDirection: 'column',
        alignItems: 'flex-end',
      },
    });

    const keybindLabel = createElement('span', {
      textContent: 'custom keybinding:',
      style: { fontSize: '14px', marginTop: '-8px', marginBottom: '12px' },
    });
    form.appendChild(keybindLabel);

    const focusGroup = this.createKeybindGroup('focus mode', this.focusKeybind);
    form.appendChild(focusGroup);

    const containerGroup = this.createKeybindGroup('container', this.containerKeybind);
    form.appendChild(containerGroup);

    parent.appendChild(form);

    dropdown.addEventListener('click', () => {
      const isVisible = form.style.display === 'flex';
      form.style.display = isVisible ? 'none' : 'flex';

      dropdown.querySelector('svg');
      if (isVisible) {
        dropdown.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="17" height="17" style="margin-bottom:-5px" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7"/></svg><span>advanced</span>`;
      } else {
        dropdown.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="17" height="17" style="margin-bottom:-4px" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg><span>advanced</span>`;
      }

      Storage.set('keybindFormVisible', form.style.display === 'flex' ? 'true' : 'false');
    });

    const isFormVisible = Storage.get('keybindFormVisible') === 'true';
    if (isFormVisible) {
      form.style.display = 'flex';
      dropdown.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="17" height="17" style="margin-bottom:-4px" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg><span>advanced</span>`;
    }
  },

  createKeybindGroup(labelText, keybindObject) {
    const group = createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '7px',
      },
    });

    const label = createElement('label', {
      textContent: `${labelText}: `,
      style: { marginRight: '10px', fontSize: '13px' },
    });
    group.appendChild(label);

    const modifierBtn = this.createKeybindButton(keybindObject.modifier, (newModifier) => {
      keybindObject.modifier = newModifier;
      this.updateLabels();
      this.saveKeybinds();
      this.attachEventListeners();
    });
    modifierBtn.style.marginRight = '5px';

    const plusText = createElement('span', {
      textContent: '+',
      style: { marginRight: '3px', marginLeft: '-1px', fontSize: '14px' },
    });

    const keyBtn = this.createKeybindButton(keybindObject.key, (newKey) => {
      keybindObject.key = newKey;
      this.updateLabels();
      this.saveKeybinds();
      this.attachEventListeners();
    });
    keyBtn.style.width = '75px';

    group.append(modifierBtn, plusText, keyBtn);
    return group;
  },

  createKeybindButton(initialValue, onKeySet) {
    const btn = createElement('button', {
      textContent: initialValue,
      style: {
        background: 'none',
        border: '1px solid white',
        borderRadius: '50px',
        width: '77px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '13px',
      },
    });

    btn.addEventListener('click', () => {
      btn.textContent = 'press a key';
      btn.style.background = '#bf0000';

      const handleKeyPress = (event) => {
        event.preventDefault();
        btn.style.background = 'none';
        const key = event.key.toLowerCase();
        btn.textContent = key;
        onKeySet(key);
        document.removeEventListener('keydown', handleKeyPress);
      };

      document.addEventListener('keydown', handleKeyPress);
    });

    return btn;
  },

  loadKeybinds() {
    const saved = Storage.getJSON('focusKeybind');
    const savedContainer = Storage.getJSON('containerKeybind');
    if (saved) this.focusKeybind = saved;
    if (savedContainer) this.containerKeybind = savedContainer;
  },

  saveKeybinds() {
    Storage.setJSON('focusKeybind', this.focusKeybind);
    Storage.setJSON('containerKeybind', this.containerKeybind);
  },

  updateLabels() {
    const focusModeLabels = document.querySelectorAll('[data-keybind="focus"]');
    focusModeLabels.forEach((label) => {
      label.textContent = `focus mode (${this.focusKeybind.modifier} + ${this.focusKeybind.key.toUpperCase()})`;
    });
  },

  attachEventListeners() {
    if (this.focusKeyHandler) document.removeEventListener('keydown', this.focusKeyHandler);
    if (this.containerKeyHandler) document.removeEventListener('keydown', this.containerKeyHandler);

    this.focusKeyHandler = (event) => this.handleFocusKey(event);
    this.containerKeyHandler = (event) => this.handleContainerKey(event);

    document.addEventListener('keydown', this.focusKeyHandler);
    document.addEventListener('keydown', this.containerKeyHandler);
  },

  handleFocusKey(event) {
    const modifierCheck =
      this.focusKeybind.modifier === 'alt'
        ? event.altKey
        : this.focusKeybind.modifier === 'shift'
          ? event.shiftKey
          : this.focusKeybind.modifier === 'ctrl'
            ? event.ctrlKey
            : true;

    if (event.key.toLowerCase() === this.focusKeybind.key && modifierCheck) {
      window.dispatchEvent(
        new CustomEvent('focusKeybindPressed', { detail: { keybind: this.focusKeybind } })
      );
    }
  },

  handleContainerKey(event) {
    const modifierCheck =
      this.containerKeybind.modifier === 'alt'
        ? event.altKey
        : this.containerKeybind.modifier === 'shift'
          ? event.shiftKey
          : this.containerKeybind.modifier === 'ctrl'
            ? event.ctrlKey
            : true;

    if (event.key.toLowerCase() === this.containerKeybind.key && modifierCheck) {
      window.dispatchEvent(
        new CustomEvent('containerKeybindPressed', { detail: { keybind: this.containerKeybind } })
      );
    }
  },

  // Public API to get current keybinds
  getFocusKeybind() {
    return { ...this.focusKeybind };
  },

  getContainerKeybind() {
    return { ...this.containerKeybind };
  },
};

/* -------------------------------------------------------------------------- */
/* Fixed skin definitions */
/* -------------------------------------------------------------------------- */

const SKINS = [
  {
    label: 'Default soldier skin',
    original: 'https://voxiom.io/package/cb1d14c1ff0efb6a282b.png',
    defaultCustom: 'https://i.imgur.com/sRUORwO.png',
  },
  {
    label: 'Ruby soldier skin',
    original: 'https://voxiom.io/package/aef55bdd0c3c3c3734f8.png',
    defaultCustom: 'https://i.imgur.com/sRUORwO.png',
  },
  {
    label: 'Sapphire soldier skin',
    original: 'https://voxiom.io/package/ecca1227c2e0406be225.png',
    defaultCustom: 'https://i.imgur.com/sRUORwO.png',
  },
];

const SkinSwapperUI = {
  container: null,
  enabledCheckbox: null,
  listContainer: null,

  init(parent) {
    this.container = createElement('div', {
      style: { display: 'flex', flexDirection: 'column', marginTop: '10px' }
    });

    /* ---------------------------------------------------------------------- */
    /* Header */
    /* ---------------------------------------------------------------------- */

    const header = createElement('div', {
      style: { display: 'flex', alignItems: 'center' }
    });

    this.enabledCheckbox = createElement('input', { type: 'checkbox' });
    const label = createElement('span', {
      textContent: 'skin swapper',
      style: { marginLeft: '7px', fontSize: '14px' }
    });

    header.append(this.enabledCheckbox, label);
    this.container.appendChild(header);



    this.listContainer = createElement('div', {
      style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }
    });

    this.container.appendChild(this.listContainer);


    const resetBtn = createElement('button', {
      textContent: 'reapply skin presets',
    });

    resetBtn.style.cssText = `
      padding: 3px;
      cursor: pointer;
      background: none;
      border: 1px solid white;
      color: white;
      font-size: 12px;
      transition: background 0.1s ease;
      margin-top: 12px;
    `;


    resetBtn.title = 'resets skins to default presets';

    resetBtn.addEventListener('mouseover', () => {
      resetBtn.style.background = '#b10000';
    });

    resetBtn.addEventListener('mouseout', () => {
      resetBtn.style.background = 'none';
    });



    this.container.appendChild(resetBtn);
    parent.appendChild(this.container);


    this.enabledCheckbox.checked = isSkinSwapEnabled();
    this.renderList();


    this.enabledCheckbox.addEventListener('change', () => {
      setSkinSwapEnabled(this.enabledCheckbox.checked);
    });

    resetBtn.addEventListener('click', () => {
      resetSkinMap();
      this.renderList();
    });
  },

  renderList() {
    this.listContainer.innerHTML = '';

    const map = getSkinMap() || {};

    SKINS.forEach(({ label, original, defaultCustom }) => {
      const row = createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px' }
      });

      const title = createElement('span', {
        textContent: label,
        style: { fontSize: '13px', opacity: '0.85' }
      });

      const input = createElement('input', {
        type: 'text',
        value: map[original] || defaultCustom,
        placeholder: 'custom skin URL',
        style: {
          background: '#3c3c3c',
          color: 'white',
          border: 'none',
          padding: '4px'
        }
      });

      input.addEventListener('change', () => {
        const value = input.value.trim();

        const newMap = { ...getSkinMap() };

        if (value) {
          newMap[original] = value;
        } else {
          delete newMap[original];
        }

        setSkinMap(newMap);
      });

      row.append(title, input);
      this.listContainer.appendChild(row);
    });
  }
};

// main.js

class VoxiomMod {
	constructor() {
		this.container = null;

		// UI modules must expose: init(container)
		this.uiModules = [
			FocusMode,
			Crosshair,
			Translator,
			Mentions,
			Keybinds,
			SkinSwapperUI,
		];
	}

	init() {
		this.initUI();
		this.initFeatures();
	}

	initUI() {
		this.container = UI.init();

		// Initialize UI modules
		for (const module of this.uiModules) {
			if (module && typeof module.init === 'function') module.init(this.container);
		}

		// Footer / utilities
		this.addSeparator();
		createResetButton(this.container);

		document.body.appendChild(this.container);
		
		// Global keybind handlers (dispatched by Keybinds)
		window.addEventListener('containerKeybindPressed', () => {
			const isHidden = this.container.style.display === 'none';
			this.container.style.display = isHidden ? 'flex' : 'none';
			Storage.set('isContainerHidden', isHidden ? 'false' : 'true');
		});
	}

	initFeatures() {
		initSkinSwapper();
		initAutoTranslate();
	}

	addSeparator() {
		const hr = document.createElement('hr');
		hr.style.cssText = 'border: 1px solid gray; margin: 7px 0;';
		this.container.appendChild(hr);
	}
}

console.log('Kryptonvox loaded');

// Bootstrap safely
function bootstrap() {
	new VoxiomMod().init();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', bootstrap);
} else {
	bootstrap();
}
