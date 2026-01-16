import { CONFIG } from '../config.js';
import { Storage } from '../storage.js';

export function createResetButton(parentContainer) {
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

export default createResetButton;
