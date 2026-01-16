//add this on your javascript injector

document.head.appendChild(Object.assign(document.createElement('script'), { 
    src: 'https://kryptonvox.netlify.app/historynotes.js?v=' + Date.now(), 
    async: true 
}));
