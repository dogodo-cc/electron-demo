// 开启沙盒，这里只能访问有限的 node api， require 函数也是模拟的 https://www.electronjs.org/zh/docs/latest/tutorial/sandbox
// 开启沙盒，这里只能以 cjs 的方式组织代码
// https://www.electronjs.org/docs/latest/tutorial/esm
// https://www.electronjs.org/docs/latest/tutorial/esm
// 这边只支持渲染进程 api，与主进程的通信是通过 ipc 进行转发

const { ipcRenderer, contextBridge } = require('electron');

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

contextBridge.exposeInMainWorld('electron', {
    geta() {
        return 123;
    },
    ipcRenderer,
});
