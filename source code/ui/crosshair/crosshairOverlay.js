function getOrCreateCrosshair() {
  const app = document.getElementById('app');
  if (!app) return null;

  let el = document.getElementById('custom-crosshair');
  if (el) return el;

  el = document.createElement('div');
  el.id = 'custom-crosshair';

  Object.assign(el.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    boxSizing: 'content-box',
  });

  app.insertAdjacentElement('afterbegin', el);

  return el;
}

export function renderCrosshair(state) {
  if (!state?.enabled || !state?.url) {
    const existing = document.getElementById('custom-crosshair');
    if (existing) existing.style.display = 'none';
    return;
  }

  const el = getOrCreateCrosshair();
  if (!el) return; 
  Object.assign(el.style, {
    width: `${state.size}px`,
    height: `${state.size}px`,
    backgroundImage: `url("${state.url}")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    display: 'block',
  });
}

export function removeCrosshair() {
  document.getElementById('custom-crosshair')?.remove();
}
