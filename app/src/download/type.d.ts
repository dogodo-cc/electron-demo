export interface IDownloadItem {
    url: string; // 下载地址
    file: string; // 文件保存地址
    contentLength: number; // 文件大小
    percent: number; // 下载的进度
    receivedBytes: number; // 下载到的大小
    bytesPerSecond?: number; // 下载速度
    isPause?: boolean; // 暂停下载是用户交互控制的 比如手动暂停 或者 退出程序
    isWait?: boolean; // 等待是内部机制，不能同时下载超过一定数量
    isLoading?: boolean; // 是否正在下载（不能根据 !isPause && !isWait 推断，任务刚创建的时候，2 个都是 falsely）
}
