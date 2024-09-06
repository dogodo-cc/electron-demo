import { DownloadManger } from './download.js';
import { ipcMain, app } from 'electron';
import { join } from 'node:path';
import type { IDownloadItem } from './type.js';
import { getFileMD5 } from '../utils.js';
import fse from 'fs-extra';
const { writeJSON } = fse;
import { existsSync } from 'node:fs';

const downloadManger = new DownloadManger(join(app.getPath('downloads'), 'CocosDashboard'));

async function start() {
    fetch('https://creator-api.cocos.com/api/cocoshub/productVersionList?identifier=creator&session_id=2a3bbb72b8e5df4ddb2d7b1d350420eae2e4100a')
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
        })
        .then(async (data: any) => {
            console.log(data.data);
            const list = data.data as {
                darwin: string;
                darwin_md5: string;
                win32: string;
                win32_md5: string;
                version: string;
            }[];
            for (const o of list) {
                o.darwin_md5 = await download(o.darwin);
                console.log('darwin_md5', o.darwin_md5);
                await writeJSON(join(app.getPath('downloads'), 'CocosDashboard/list.json'), list);
                o.win32_md5 = await download(o.win32);
                console.log('win32_md5', o.win32_md5);
                await writeJSON(join(app.getPath('downloads'), 'CocosDashboard/list.json'), list);
            }
        });
}

async function download(url: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const downloadItem = await downloadManger.createTask(url);
        downloadItem.on('download:end', async (item: IDownloadItem, success: boolean) => {
            if (success) {
                console.log('existsSync:', existsSync(item.file));
                const md5 = await getFileMD5(item.file);
                resolve(md5);
            }
            reject();
        });
    });
}

ipcMain.on('start-write-hash', start);
