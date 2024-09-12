import { EventEmitter } from 'node:events';
import { dirname } from 'node:path';
import { existsSync, createWriteStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';

import { ensureDir, remove } from 'fs-extra';
import axios from 'axios';
import type { IDownloadItem } from './type.js';

type EventArgsMap = {
    'download:start': (item: IDownloadItem) => void;
    'download:progress': (item: IDownloadItem) => void;
    'download:cancel': (item: IDownloadItem) => void;
    'download:end': (item: IDownloadItem, success: boolean, error?: Error) => void;
};

type IAllowEvents = keyof EventArgsMap;

class DownloadItemEmitter {
    private _emit: EventEmitter;

    constructor() {
        this._emit = new EventEmitter();
    }

    emit<T extends IAllowEvents>(event: T, ...args: Parameters<EventArgsMap[T]>) {
        return this._emit.emit(event, ...args);
    }

    on<T extends IAllowEvents>(event: T, listener: EventArgsMap[T]) {
        return this._emit.on(event, listener);
    }

    once<T extends IAllowEvents>(event: T, listener: EventArgsMap[T]) {
        return this._emit.once(event, listener);
    }

    off<T extends IAllowEvents>(event: T, listener: EventArgsMap[T]) {
        return this._emit.off(event, listener);
    }

    removeAllListeners() {
        return this._emit.removeAllListeners();
    }
}

export class DownloadItem extends DownloadItemEmitter implements IDownloadItem {
    url: string;
    file: string;
    contentLength: number;
    percent: number;
    isPause?: boolean;
    isWait?: boolean;
    isLoading?: boolean;
    bytesPerSecond?: number;

    retry: { [k: number]: number } = { 0: 0 };
    retryMax = 3;

    private abort?: () => void; // 缓存取消函数，用于暂停和取消等
    private chunkSize = 1 * 1024 * 1024;

    constructor(url: string, file: string, chunkSize = 1 * 1024 * 1024) {
        super();
        this.url = url;
        this.contentLength = 0;
        this.percent = 0;
        this.file = file;
        this.chunkSize = chunkSize;
    }

    // 开始下载
    async downloadStart() {
        // 每次下载都请求一次 contentLength 方便和本地数据做对比
        const contentLength = await this.getContentLength(this.url);
        if (!contentLength) {
            console.log(`${this.url} content-length is invilod: ${contentLength}`);
            this.downloadEnd(false);
            return;
        }

        // 断点下载
        let size = 0;
        if (existsSync(this.file)) {
            size = (await stat(this.file)).size;

            // 本地文件大小 超出 远程文件大小
            const isLocalGTRemote = size > contentLength;
            // 本地记录的大小 不等于 远程大小
            const isRecodeNotEQRemote = this.contentLength && this.contentLength !== contentLength;

            // 以上两种情况都直接放弃本地缓存，直接重新下载
            if (isLocalGTRemote || isRecodeNotEQRemote) {
                await remove(this.file);
                size = 0;
            }
        }

        this.contentLength = contentLength;
        this.percent = size / contentLength;
        this.isPause = false;
        this.isWait = false;
        this.isLoading = true;
        this.bytesPerSecond = 0;

        ensureDir(dirname(this.file)); // 每次下载都确保一下路径是存在的，避免创建文件的错误
        this.emit('download:start', this.pickItem());
        this.download(size);
    }

    public downloadPause() {
        if (this.isLoading) {
            this.isPause = true;
            this.abort?.();
        }
    }

    // 执行下载
    private async download(downloadedSize = 0) {
        if (this.isPause) {
            this.emit('download:cancel', this.pickItem()); // 为了适配原有的取消钩子
            this.downloadEnd(downloadedSize === this.contentLength - 1);
            return;
        }

        // range 是从 0 开始，所以对比要 - 1
        if (downloadedSize < this.contentLength - 1) {
            const currentChunkEnd = Math.min(downloadedSize + this.chunkSize, this.contentLength - 1);

            const controller = new AbortController();

            this.abort = () => {
                // 必须包装一层 fn，不能直接赋值
                controller.abort();
            };

            const startTime = Date.now();

            axios({
                url: this.url,
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
                    return pipeline(res.data, createWriteStream(this.file, { flags: 'a' }));
                })
                .then(() => {
                    this.percent = currentChunkEnd / (this.contentLength - 1);
                    const endTime = Date.now();
                    this.bytesPerSecond = ((currentChunkEnd - downloadedSize) / (endTime - startTime)) * 1000;
                    this.emit('download:progress', this.pickItem());
                    this.download(currentChunkEnd + 1); // 因为 header:Range 那边是两边闭合，所以下一个起点需要 +1
                })
                .catch((e) => {
                    // 错误了重试 3 次
                    if (!this.retry[downloadedSize]) {
                        this.retry[downloadedSize] = 0;
                    }
                    if (this.retry[downloadedSize] < this.retryMax) {
                        this.retry[downloadedSize] += 1;

                        this.download(downloadedSize);
                    } else {
                        this.downloadEnd(false, e);
                    }
                })
                .finally(() => {
                    // 做些清理工作，避免内存泄露
                    delete this.abort;
                });
        } else {
            this.downloadEnd(true);
        }
    }

    private downloadEnd(success: boolean, error?: Error) {
        this.isWait = false;
        this.isLoading = false;
        this.isPause = true;
        this.bytesPerSecond = 0;
        this.emit('download:end', this.pickItem(), success, error);
    }

    // 用于传递数据的 item，需要剥离一些不可序列化的数据
    pickItem(): IDownloadItem {
        const { url, file, contentLength, percent, isPause, isWait, isLoading, bytesPerSecond } = this;
        return {
            url,
            file,
            contentLength,
            percent,
            isPause,
            isWait,
            isLoading,
            bytesPerSecond,
        };
    }
    private getContentLength(url: string): Promise<number> {
        return new Promise((resolve) => {
            axios
                .head(url)
                .then((res) => {
                    const contentLength = res.headers['content-length'];

                    if (contentLength && res.headers['accept-ranges'] === 'bytes') {
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
