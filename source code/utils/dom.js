export function createElement(tag, options = {}) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(options)) {
    if (key === 'style') Object.assign(el.style, value);
    else if (key in el) el[key] = value;
    else el.setAttribute(key, value);
  }

  return el;
}
