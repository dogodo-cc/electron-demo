// 验证资源是否支持分片
// curl -r 0-1048575 https://download.cocos.com/CocosCreator/v3.8.3/CocosCreator-v3.8.3-mac-051115.zip  --output 1.zip

import { join, basename, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { existsSync, createWriteStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { createHash } from 'node:crypto';
import { ensureDir, remove } from 'fs-extra';
import axios from 'axios';
import { DownloadItem } from './download-item.js';

export class DownloadManger {
    constructor(downloadPath?: string) {
        this.downloadPath = downloadPath || tmpdir();
    }

    chunkSize = 1 * 1024 * 1024; // 1kb = 1024 bytes

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
    async createTask(url: string): Promise<DownloadItem> {
        ensureDir(this.downloadPath); // 每次下载都确保一下路径是存在的，避免创建文件的错误

        // 每次下载都请求一次 contentLength 方便和本地数据做对比
        const contentLength = await this.getContentLength(url);
        if (!contentLength) {
            throw new Error(`${url} content-length is invilod: ${contentLength}`);
        }

        const file = this.getSavePath(url);

        if (existsSync(file)) {
            let item: DownloadItem = this.downloadItemMap[url];
            let size = (await stat(file)).size;

            // 本地文件大小 超出 远程文件大小
            const isLocalGTRemote = size > contentLength;
            // 本地记录的大小 不等于 远程大小
            const isRecodeNotEQRemote = item && item.contentLength !== contentLength;

            // 以上两种情况都直接放弃本地缓存，直接重新下载
            if (isLocalGTRemote || isRecodeNotEQRemote) {
                await remove(file);
                size = 0;
            }

            if (!item) {
                // 根据本地文件重建 item 数据
                item = new DownloadItem({
                    url,
                    file,
                    contentLength: contentLength,
                    percent: size / contentLength,
                });

                this.downloadItemMap[url] = item;
            }

            // reset
            item.contentLength = contentLength;
            item.isPause = false;

            process.nextTick(() => {
                // 要先返回 item 否则外面无法监听事件 所以在 nextTick 执行
                if (size === item.contentLength) {
                    this.downloadEnd(item, true);
                } else {
                    this.downloadStart(item, size); // 基于已有的缓存继续下载
                }
            });
            return item;
        } else {
            let item = this.downloadItemMap[url];
            if (!item) {
                item = new DownloadItem({
                    url,
                    file,
                    percent: 0,
                    contentLength: contentLength,
                });

                this.downloadItemMap[url] = item;
            }
            // reset
            item.contentLength = contentLength;
            item.isPause = false;

            process.nextTick(() => {
                this.downloadStart(item, 0);
            });
            return item;
        }
    }

    // 删除下载任务
    async deleteTask(url: string) {
        const item = this.downloadItemMap[url];
        if (item) {
            this.cancel(url);
            delete this.downloadItemMap[url];
            await remove(item.file);
        }
    }

    // 暂停下载任务
    pauseTask(url: string) {
        this.cancel(url);
    }

    private cancel(url: string) {
        const item = this.downloadItemMap[url];
        if (item?.isLoading) {
            item.isPause = true;
            item.cancel?.();
        }
    }

    // 开始下载
    private async downloadStart(item: DownloadItem, downloadedSize = 0) {
        if (item.isLoading) return; // 避免重复下载

        item.isWait = this.isOverLimit;
        if (item.isWait) {
            console.log('排队等待');
        } else {
            item.isPause = false;
            item.isWait = false;
            item.isLoading = true;
            this.download(item, downloadedSize);
            item.emit('download:start', item.pickItem());
        }
    }

    // 正在下载
    private async download(item: DownloadItem, downloadedSize = 0) {
        if (item.isPause) {
            return this.downloadEnd(item, downloadedSize === item.contentLength - 1);
        }

        // range 是从 0 开始，所以对比要 - 1
        if (downloadedSize < item.contentLength - 1) {
            const currentChunkEnd = Math.min(downloadedSize + this.chunkSize, item.contentLength - 1);

            const controller = new AbortController();

            item.cancel = () => {
                // 必须包装一层 fn，不能直接赋值
                controller.abort();
            };

            await axios({
                url: item.url,
                method: 'GET',
                responseType: 'stream',
                headers: {
                    Range: `bytes=${downloadedSize}-${currentChunkEnd}`,
                },
                timeout: 5 * 1000,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                signal: controller.signal,
            })
                .then((res) => {
                    // https://nodejs.org/api/fs.html#fscreatewritestreampath-options
                    // https://nodejs.org/api/fs.html#file-system-flags
                    return pipeline(res.data, createWriteStream(item.file, { flags: 'a' }));
                })
                .then(() => {
                    item.percent = currentChunkEnd / (item.contentLength - 1);
                    item.emit('download:progress', item.pickItem());
                    this.download(item, currentChunkEnd + 1); // 因为 header:Range 那边是两边闭合，所以下一个起点需要 +1
                })
                .catch((e) => {
                    this.downloadEnd(item, false, e);
                })
                .finally(() => {
                    // 做些清理工作，避免内存泄露
                    delete item.cancel;
                });
        } else {
            this.downloadEnd(item, true);
        }
    }

    // 结束下载
    private async downloadEnd(item: DownloadItem, success: boolean, error?: Error) {
        item.isWait = false;
        item.isLoading = false;
        item.isPause = true;
        item.emit('download:end', item.pickItem(), success, error);

        // 如果有排队等待的则进行新的下载
        if (this.downloadWaitTasks.length > 0) {
            const nextItem = this.downloadWaitTasks[0];
            this.createTask(nextItem.url);
        }
    }

    private getSavePath(url: string) {
        const uuid = createHash('md5').update(url).digest('hex'); // 通过 url 生成唯一的文件名
        return join(this.downloadPath, uuid + '_' + basename(url));
    }

    private getContentLength(url: string): Promise<number> {
        return new Promise((resolve) => {
            axios
                .head(url)
                .then((res) => {
                    const contentLength = res.headers['content-length'];
                    if (contentLength) {
                        resolve(Number(contentLength));
                    }
                    resolve(0);
                })
                .catch(() => {
                    resolve(0);
                });
        });
    }
}
