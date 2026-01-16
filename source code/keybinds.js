import { createElement } from '../utils/dom.js';
import { Storage } from '../storage.js';
import { CONFIG } from '../config.js';

export const Keybinds = {
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

      const svg = dropdown.querySelector('svg');
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

export default Keybinds;
