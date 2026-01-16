// main.js
import { UI } from './ui/core.js';
import { FocusMode } from './ui/focusMode.js';
import { Crosshair } from './ui/crosshair/index.js';

import { initSkinSwapper } from './features/skinSwapper.js';
import { initAutoTranslate } from './features/autoTranslate.js';
import { createResetButton } from './components/resetButton.js';
import {Translator} from './ui/translator.js';
import { Mentions } from './ui/mentions.js';
import {Keybinds} from './ui/keybinds.js';
import {SkinSwapperUI} from './ui/skinSwapperUI.js';
import { Storage } from './storage.js';

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

