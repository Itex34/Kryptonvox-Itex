import { Storage } from '../storage.js';
import { createElement } from '../utils/dom.js';

export const FocusMode = {
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
