// 验证资源是否支持分片
// curl -r 0-10 https://download.cocos.com/CocosCreator/v3.8.3/CocosCreator-v3.8.3-mac-051115.zip  --output 1.zip

import { tmpdir } from 'node:os';
import { remove } from 'fs-extra';
import { join, basename, dirname } from 'node:path';
import { DownloadItem } from './download-item.js';
import { createHash } from 'node:crypto';
import type { IDownloadItem } from './type.js';

export class DownloadManger {
    constructor(downloadPath?: string) {
        this.downloadPath = downloadPath || tmpdir();
    }

    downloadItemMap: { [key: string]: DownloadItem } = {};

    downloadPath: string;

    maxTaskLength = 2;

    // 正在下载
    get downloadingTasks() {
        return Object.values(this.downloadItemMap).filter((v) => v.isLoading);
    }

    // 等待下载
    get downloadWaitTasks() {
        return Object.values(this.downloadItemMap).filter((v) => v.isWait);
    }

    // 是否超出下载上限
    get isOverLimit() {
        return this.downloadingTasks.length >= this.maxTaskLength;
    }

    // 创建下载任务
    public async createTask(url: string, file?: string): Promise<Omit<DownloadItem, 'downloadStart' | 'downloadPause'>> {
        // 'downloadStart' | 'downloadPause' 只允许在管理器内使用，不能对外暴露

        let item = this.downloadItemMap[url];
        if (!item) {
            item = new DownloadItem(url, file ?? this.getSavePath(url));
            this.downloadItemMap[url] = item;
        }
        item.isWait = this.isOverLimit;

        // 需要先 return 这样外面才能及时的监听事件
        process.nextTick(() => {
            this.downloadStart(item);
        });
        return item;
    }

    // 暂停下载任务
    public pauseTask(url: string) {
        const item = this.downloadItemMap[url];
        if (item) {
            item.downloadPause();
        }
    }

    // 删除下载任务
    public async deleteTask(url: string, removeFile = false) {
        const item = this.downloadItemMap[url];
        if (item) {
            item.downloadPause();
            // 主动删除，则不再触发 end 等事件，因为 end 事件会提示用下载失败等，而删除不需要提示。
            // 所以这边可以直接解绑所有事件
            item.removeAllListeners();
            delete this.downloadItemMap[item.url];
            if (removeFile) {
                setTimeout(() => {
                    remove(item.file);
                }, 1000);
            }
            this.checktNextTask();
        }
    }

    // 开始下载
    private async downloadStart(item: DownloadItem) {
        if (item.isLoading) return; // 避免重复下载

        // 进行并发限制
        item.isWait = this.isOverLimit;
        if (item.isWait) {
            console.log('排队等待');
        } else {
            item.downloadStart();
            item.once('download:end', (item) => {
                this.downloadEnd(item);
            });
        }
    }

    // 结束下载
    private async downloadEnd(item: IDownloadItem) {
        process.nextTick(() => {
            // 让其他监听的事件先执行完毕，再销毁这个下载实例
            const downloadItem = this.downloadItemMap[item.url];
            if (downloadItem) {
                downloadItem.removeAllListeners();
                delete this.downloadItemMap[item.url];
            }
        });
        this.checktNextTask();
    }

    private checktNextTask() {
        if (this.downloadWaitTasks.length > 0) {
            const nextItem = this.downloadWaitTasks[0];
            this.createTask(nextItem.url);
        }
    }

    async deleteALLTasks(removeFile = false) {
        const allTaskItems = Object.values(this.downloadItemMap);
        allTaskItems.forEach((item) => {
            this.deleteTask(item.url, removeFile);
        });
    }

    private getSavePath(url: string) {
        const uuid = createHash('md5').update(url).digest('hex'); // 通过 url 生成唯一的文件名
        return join(this.downloadPath, uuid + '_' + basename(url));
    }
}
