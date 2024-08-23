import { BrowserWindow, ipcMain } from 'electron';

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
    });
    childWindow.loadURL('https://www.90s.co');
    childWindow.setBounds({ x: childX, y: childY });
}

ipcMain.on('open-child-win', (e) => {
    const main = BrowserWindow.fromWebContents(e.sender);
    if (main) {
        openChildWin(main);
    }
});
