import { BrowserWindow, ipcMain } from 'electron';
import { resolve, join } from 'node:path';
import { getDirname } from './utils.js';
const __dirname = getDirname(import.meta.url);

function openChildWin(main: BrowserWindow) {
    const [parentX, parentY] = main.getPosition();
    const [parentWidth, parentHeight] = main.getSize();

    const childWidth = 600;
    const childHeight = 623;

    const childX = Math.ceil(parentX + parentWidth / 2 - childWidth / 2);
    const childY = Math.ceil(parentY + parentHeight / 2 - childHeight / 2);

    const childWindow = new BrowserWindow({
        width: childWidth,
        height: childHeight,
        x: childX,
        y: childY,
        webPreferences: {
            preload: join(__dirname, '../preload.cjs'), // 只能是 cjs
            sandbox: true,
            webSecurity: true,
        },
    });
    // childWindow.loadURL('https://www.90s.co');
    childWindow.loadFile(resolve(__dirname, '../node_modules/.views/index.html'));
    childWindow.setBounds({ x: childX, y: childY });
}

ipcMain.on('open-child-win', (e) => {
    const main = BrowserWindow.fromWebContents(e.sender);
    if (main) {
        openChildWin(main);
    }
});

ipcMain.handle('get-window-url', () => {
    return resolve(__dirname, '../node_modules/.views/index.html');
});
