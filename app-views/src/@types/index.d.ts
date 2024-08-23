import type { IpcRenderer } from 'electron';

declare global {
    interface Window {
        ipc: IpcRenderer;
    }
}
