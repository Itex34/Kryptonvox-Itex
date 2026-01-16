// features/autoTranslate.js

let injected = false;
const STORAGE_KEY = 'scriptEnabled';

export function initAutoTranslate() {
  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    startAutoTranslate();
  }
}

export function startAutoTranslate() {
  injectTranslatorIfNeeded();
  runInPage(() => window.__AutoTranslator?.start());
}

export function stopAutoTranslate() {
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
