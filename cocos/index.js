// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu, BrowserView, BaseWindow, WebContentsView } = require('electron');
const path = require('path');
require('./menu.js');

let main = null;
const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    main = mainWindow;

    // 加载 index.html
    if (app.isPackaged) {
        mainWindow.loadFile(path.join(__dirname, './dist/index.html'));
    } else {
        mainWindow.loadURL('http://localhost:5555/');
    }

    // 打开开发工具
    mainWindow.webContents.openDevTools();
};

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // 在 macOS 系统内, 如果没有已开启的应用窗口
        // 点击托盘图标时通常会重新创建一个新窗口
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
// 对应用程序和它们的菜单栏来说应该时刻保持激活状态,
// 直到用户使用 Cmd + Q 明确退出
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// 在当前文件中你可以引入所有的主进程代码
// 也可以拆分成几个文件，然后用 require 导入。

ipcMain.on('show-context-menu', (event) => {
    const template = [
        {
            label: 'Menu Item 1',
            click: () => {
                event.sender.send('context-menu-command', 'menu-item-1');
            },
        },
        { type: 'separator' },
        { label: 'Menu Item 2', type: 'checkbox', checked: true },
        {
            label: 'test',
            submenu: [
                {
                    label: 'Learn More',
                    sublabel: 'ddddd',
                },
            ],
        },
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
});

app.on('before-quit', (e) => {
    e.preventDefault();

    const [parentX, parentY] = main.getPosition();
    const [parentWidth, parentHeight] = main.getSize();

    const childWidth = 600;
    const childHeight = 623;

    const childX = Math.ceil(parentX + parentWidth / 2 - childWidth / 2);
    const childY = Math.ceil(parentY + parentHeight / 2 - childHeight / 2);

    console.log(childX, childY);

    const mainWindow = new BrowserWindow({
        width: childWidth,
        height: childHeight,
        x: childX,
        y: childY,
    });
    mainWindow.loadURL('https://www.90s.co');
    mainWindow.setBounds({ x: childX, y: childY });
});
