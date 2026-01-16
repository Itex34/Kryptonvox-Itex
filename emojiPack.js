//add this with/separately from the main.js code 

document.head.appendChild(Object.assign(document.createElement('script'), { 
    src: 'https://kryptonvox.netlify.app/emojiPack.js?v=' + Date.now(),
    async: true 
}));
