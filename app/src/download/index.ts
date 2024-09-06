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
    mergeItemToList(_item);
    broadcast('download-update', list);

    downloadItem.on('download:start', (item: IDownloadItem) => {
        mergeItemToList(item);
        broadcast('download-update', list);
        console.log('开始下载：', item.url, list);
    });

    downloadItem.on('download:progress', (item: IDownloadItem) => {
        // console.log('正在下载：', item.percent);
        mergeItemToList(item);
        broadcast('download-progress', item);
    });

    downloadItem.on('download:end', (item: IDownloadItem, success: boolean, error?: Error) => {
        mergeItemToList(item);
        broadcast('download-update', list);
        console.log('结束下载：', item.url, success, error, list);
    });
});

ipcMain.on('download-pause', (_, url) => {
    downloadManger.pauseTask(url);
});

function mergeItemToList(item: IDownloadItem) {
    const cacheItem = list.find((v) => v.url === item.url);
    if (cacheItem) {
        Object.assign(cacheItem, item);
    } else {
        list.push(item);
    }
}
