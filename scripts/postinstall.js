import { join } from 'path';
import { copy } from 'fs-extra';
import { spawn } from 'child_process';

async function go() {
    const root = process.cwd();
    // 去 app 里面安装依赖
    await spawnPromise('npm', ['install', '--legacy-peer-deps'], {
        cwd: join(root, './app'),
    });
    console.log('(1/3) ====> app 依赖安装成功');

    // 去 cocos 里面安装依赖
    await spawnPromise('npm', ['install', '--legacy-peer-deps'], {
        cwd: join(root, './cocos'),
    });
    console.log('(2/3) ====> cocos 依赖安装成功');
    // npm@7 开始会[自动安装](https://github.blog/2021-02-02-npm-7-is-now-generally-available/)  Peer dependencies。
    // cocos 里面某些依赖将 electron 声明了 peerDependencies, 会导致重复下载 electron，增加 cocos.asar 的体积。
    // 所以 install --legacy-peer-deps

    if (process.platform === 'darwin') {
        // 替换开发状态下的默认图标，方便识别
        const diyIcons = join(root, './scripts/pack/logo.icns');
        const originIcons = join(root, 'node_modules/electron/dist/Electron.app/Contents/Resources/electron.icns');
        copy(diyIcons, originIcons, { overwrite: true });
    }
}

go();

function spawnPromise(...args) {
    return new Promise((res, reject) => {
        const child = spawn(...args);

        let result = '';
        child.stdout.on('data', (data) => {
            result += data;
        });

        child.on('close', () => {
            res(result);
        });

        child.on('error', (err) => {
            reject(err);
        });
    });
}
