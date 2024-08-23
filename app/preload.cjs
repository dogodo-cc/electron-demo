// 开启沙盒，这里只能访问有限的 node api， require 函数也是模拟的 https://www.electronjs.org/zh/docs/latest/tutorial/sandbox
// 开启沙盒，这里只能以 cjs 的方式组织代码
// https://www.electronjs.org/docs/latest/tutorial/esm
// https://www.electronjs.org/docs/latest/tutorial/esm
// 这边只支持渲染进程 api，与主进程的通信是通过 ipc 进行转发

const { ipcRenderer, contextBridge } = require('electron');

// https://electron.nodejs.cn/docs/latest/tutorial/context-isolation#security-considerations
// 安全原因，不要直接将 ipcRenderer.send 暴露出去
// https://electron.nodejs.cn/docs/latest/tutorial/ipc#expose-ipcrendereron-via-preload

contextBridge.exposeInMainWorld('ipc', {
    send(channel, ...args) {
        ipcRenderer.send(channel, ...args);
    },
    on(channel, cb, ...args) {
        ipcRenderer.on(channel, cb, ...args);
    },
    off(channel, cb, ...args) {
        ipcRenderer.off(channel, cb, ...args);
    },
    invoke(channel, ...args) {
        return ipcRenderer.invoke(channel, ...args);
    },
});
