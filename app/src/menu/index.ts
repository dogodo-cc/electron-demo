import { app, Menu, ipcMain, BrowserWindow, shell } from 'electron';

const isMac = process.platform === 'darwin';

const template = [
    { role: 'appMenu' },
    ...(isMac
        ? [
              {
                  label: app.name,
                  submenu: [
                      { role: 'about' },
                      { type: 'separator' },
                      { role: 'services' },
                      { type: 'separator' },
                      { role: 'hide' },
                      { role: 'hideOthers' },
                      { role: 'unhide' },
                      { type: 'separator' },
                      { role: 'quit' },
                  ],
              },
          ]
        : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'label',
                sublabel: 'sublabel',
                click: async () => {
                    await shell.openExternal('https://electronjs.org');
                },
            },
        ],
    },
];

// const menu = Menu.buildFromTemplate(template);
// Menu.setApplicationMenu(menu);

ipcMain.on('show-context-menu', (event) => {
    const template = [
        {
            label: 'Menu Item 1',
            click: () => {
                console.log('menu-item-1');
                event.sender.send('context-menu-command', 'menu-item-1');
            },
        },
        // { label: 'Menu Item 2', type: 'checkbox', checked: true },
        // {
        //     label: 'test',
        //     submenu: [
        //         {
        //             label: 'Learn More',
        //             sublabel: 'ddddd',
        //         },
        //     ],
        // },
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) ?? undefined });
});
