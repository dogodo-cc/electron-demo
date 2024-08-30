import { DownloadManger } from './download.js';
import { ipcMain, app } from 'electron';
import { broadcast } from '../ipc.js';
import { join } from 'node:path';
import type { IDownloadItem } from './type.js';

const downloadManger = new DownloadManger(join(app.getPath('downloads'), 'CocosDashboard'));

const list: IDownloadItem[] = [];

ipcMain.on('download-create', async (_, url) => {
    const downloadItem = await downloadManger.createTask(url);

    const _item = downloadItem.pickItem();
    if (list.every((v) => v.url !== _item.url)) {
        list.push(_item);

        downloadItem.on('download:start', (item: IDownloadItem) => {
            console.log('开始下载：', item.url);
            Object.assign(_item, item);
            broadcast('download-update', list);
        });

        downloadItem.on('download:progress', (item: IDownloadItem) => {
            // console.log('正在下载：', item.percent);
            Object.assign(_item, item);
            broadcast('download-progress', item);
        });

        downloadItem.on('download:end', (item: IDownloadItem, success: boolean, error?: Error) => {
            console.log('结束下载：', item.url, success, error);
            Object.assign(_item, item);
            broadcast('download-update', list);
        });
    }

    broadcast('download-update', list);
});

ipcMain.on('download-pause', (_, url) => {
    downloadManger.pauseTask(url);
});
