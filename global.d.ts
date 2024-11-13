// app 和 app-views 都会用到的类型在这边统一维护

declare type IDownloadItem = {
  url: string;
  file: string;
  contentLength: number;
  percent: number;
  bytesPerSecond?: number; // 下载速度
  isLoading: boolean;
  isPause?: boolean; // 暂停下载是用户交互控制的 比如手动暂停 或者 退出程序
  isWait?: boolean; // 等待是内部机制，不能同时下载超过一定数量
};

declare namespace MyLayout {
  type ILayoutPanel = {
    name: string;
    url: string;
  };

  type ILayoutItem = {
    direction?: "row" | "column";
    layouts?: ILayoutItem[];
    panels?: ILayoutPanel[];
  } & (
    | {
        direction?: "row" | "column";
        layouts: ILayoutItem[];
      }
    | {
        panels: ILayoutPanel[];
      }
  );
}
