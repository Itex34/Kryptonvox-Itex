import { Storage } from '../storage.js';

export const UI = {
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
