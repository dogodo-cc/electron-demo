// preload.js
const { ipcRenderer, shell, contextBridge } = require('electron');

// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ipcRenderer.send('show-context-menu');
});

ipcRenderer.on('context-menu-command', (e, command) => {
    console.log(e, command);
});

contextBridge.exposeInMainWorld('electronAPI', {
    shell,
});
