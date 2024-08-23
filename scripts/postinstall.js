import { join } from 'path';
import { copy } from 'fs-extra';

async function go() {
    if (process.platform === 'darwin') {
        const root = process.cwd();
        // 替换开发状态下的默认图标，方便识别
        const diyIcons = join(root, './scripts/pack/logo.icns');
        const originIcons = join(root, 'node_modules/electron/dist/Electron.app/Contents/Resources/electron.icns');
        copy(diyIcons, originIcons, { overwrite: true });
    }
}

go();
