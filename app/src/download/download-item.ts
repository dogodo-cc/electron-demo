import { EventEmitter } from 'node:events';
import type { IDownloadItem } from './type.js';

type EventArgsMap = {
    'download:start': (item: IDownloadItem) => void;
    'download:progress': (item: IDownloadItem) => void;
    'download:end': (item: IDownloadItem, success: boolean, error?: Error) => void;
};

type IAllowEvents = keyof EventArgsMap;

class DownloadItemEmitter {
    private _emit: EventEmitter;

    constructor() {
        this._emit = new EventEmitter();
    }

    emit(event: IAllowEvents, ...args: Parameters<EventArgsMap[IAllowEvents]>) {
        return this._emit.emit(event, ...args);
    }

    on(event: IAllowEvents, fn: EventArgsMap[IAllowEvents]) {
        return this._emit.on(event, fn);
    }

    once(event: IAllowEvents, fn: EventArgsMap[IAllowEvents]) {
        return this._emit.once(event, fn);
    }

    off(event: IAllowEvents, fn: EventArgsMap[IAllowEvents]) {
        return this._emit.off(event, fn);
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

    constructor(item: IDownloadItem) {
        super();
        this.url = item.url;
        this.file = item.file;
        this.contentLength = item.contentLength;
        this.percent = item.percent;
        this.isPause = item.isPause;
        this.isWait = item.isWait;
        this.isLoading = item.isLoading;
    }

    cancel?: (() => void) | undefined;

    // 用于传递数据的 item，需要剥离一些不可序列化的数据
    pickItem(): Omit<IDownloadItem, 'cancel'> {
        const { url, file, contentLength, percent, isPause, isWait } = this;
        return {
            url,
            file,
            contentLength,
            percent,
            isPause,
            isWait,
        };
    }
}
