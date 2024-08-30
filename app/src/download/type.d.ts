export interface IDownloadItem {
    url: string;
    file: string;
    contentLength: number;
    percent: number;
    isPause?: boolean; // 暂停下载是用户交互控制的 比如手动暂停 或者 退出程序
    isWait?: boolean; // 等待是内部机制，不能同时下载超过一定数量
    isLoading?: boolean; // 是否正在下载（不能根据 !isPause && !isWait 推断，任务刚创建的时候，2 个都是 falsely）
}
