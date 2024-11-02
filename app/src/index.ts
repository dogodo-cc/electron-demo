import { app, BrowserWindow, ipcMain } from "electron";
import { join, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import "./download/index.js";
import "./download/hash-list.js";

import "./menu/index.js";
import "./window-center.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

const isPackaged = app.isPackaged || __dirname.includes("asar");
if (!isPackaged) {
  await import("./devtool.cjs");
}

let main: BrowserWindow | null = null;
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: join(__dirname, "../preload.cjs"), // 只能是 cjs
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log("渲染进程在打开这个地址:", url);
    return {
      action: "allow",
      overrideBrowserWindowOptions: {
        webPreferences: {
          preload: join(__dirname, "../preload.cjs"),
        },
      },
    };
  });

  main = mainWindow;

  // 加载 index.html
  if (isPackaged) {
    const viewLink = join(__dirname, "../node_modules/.views/index.html");
    mainWindow.loadFile(viewLink);

    mainWindow.webContents.on("will-navigate", (event, url) => {
      // 如果不是 index.html，则阻止导航并重定向
      if (!url.startsWith(viewLink)) {
        event.preventDefault();
        mainWindow.loadFile(viewLink);
      }
    });

    mainWindow.setTitle("打包模式");
  } else {
    mainWindow.loadURL("http://localhost:5555/");

    // 打开开发工具
    mainWindow.webContents.openDevTools();
    mainWindow.setTitle("开发模式");
  }
};

setTimeout(() => {
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "../preload.cjs"), // 只能是 cjs
      sandbox: true,
      webSecurity: true,
    },
  });
  win.loadURL("http://localhost:5555/#/sub-win/abc/efg");
}, 1000 * 3);

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // 在 macOS 系统内, 如果没有已开启的应用窗口
    // 点击托盘图标时通常会重新创建一个新窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
// 对应用程序和它们的菜单栏来说应该时刻保持激活状态,
// 直到用户使用 Cmd + Q 明确退出
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("app-is-packaged", () => {
  return isPackaged;
});
