import { BrowserWindow } from 'electron';
import type { WebContents } from 'electron';

type broadcastParams = Parameters<WebContents['send']>;

export function broadcast(...args: broadcastParams) {
    const allWins = BrowserWindow.getAllWindows();
    allWins.forEach((win) => {
        win.webContents.send(...args);
    });
}
