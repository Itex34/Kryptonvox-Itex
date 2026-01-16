import { createElement } from '../utils/dom.js';
import {
  getSkinMap,
  setSkinMap,
  isSkinSwapEnabled,
  setSkinSwapEnabled,
  resetSkinMap
} from '../features/skinSwapper.js';

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

export const SkinSwapperUI = {
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

export default SkinSwapperUI;
