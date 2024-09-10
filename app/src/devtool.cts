const { app } = require('electron');
const { default: installDevtool } = require('electron-devtools-installer');

// https://github.com/MarshallOfSound/electron-devtools-installer/pull/239
app.whenReady().then(() => {
    return installDevtool('nhdogjmejiglipccpnnnanhbledajbpd', {
        loadExtensionOptions: {
            allowFileAccess: true,
        },
    });
});
