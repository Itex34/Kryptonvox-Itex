import { createElement } from '../utils/dom.js';
import { Storage } from '../storage.js';

export const Mentions = {
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
