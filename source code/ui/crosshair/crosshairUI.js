import { createElement } from '../../utils/dom.js';
import { loadCrosshairState, saveCrosshairState } from '../../state/crosshairState.js';
import { renderCrosshair } from './crosshairOverlay.js';

export const CrosshairUI = {
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
