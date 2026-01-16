import { createElement } from '../utils/dom.js';
import { Storage } from '../storage.js';


import {
  initAutoTranslate,
  startAutoTranslate,
  stopAutoTranslate
} from '../features/autoTranslate.js';


const MAX_CACHE_SIZE = 200;

export const Translator = {
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

export default Translator;
