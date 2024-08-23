import { join, basename, extname } from 'node:path';
import { ensureDir, emptydir, copy, remove } from 'fs-extra';
import { existsSync, readFileSync, writeFileSync, createWriteStream } from 'node:fs';
import { createPackage } from '@electron/asar';
import ProgressBar from 'progress';
import axios from 'axios';
import extract from 'extract-zip';
import { spawnPromise } from './utils.mjs';

const isDiy = false; // 是否使用定制的 electron 版本
const root = process.cwd();

const urlLocal = join(root, './.electron/13.1.4-ccc/');
const urlLocalZip = join(root, './.electron/13.1.4-ccc.zip');
const urlDownload = 'http://ftp.cocos.org/TestBuilds/Fireball/Electron/13.1.4/electron-v13.1.4-360-newkey-darwin.zip';

const publishPath = join(root, './out');
const dmgPath = join(publishPath, 'hello.dmg');

const electronPath = join(publishPath, 'hello.app');
const appPath = join(electronPath, 'Contents/Resources/app');

const sourceElectronPath = isDiy ? join(root, '.electron/13.1.4-ccc/Electron.app') : join(root, 'node_modules/electron/dist/Electron.app');
const sourceAppPath = join(root, 'app');

async function dirInit() {
    await ensureDir(publishPath);
    await ensureDir(electronPath);
    await emptydir(electronPath);
    await ensureDir(urlLocal);
}

async function electronDownload() {
    const response = await axios({
        method: 'GET',
        url: urlDownload,
        responseType: 'stream',
    });

    // 使用管道流将文件写入到指定路径
    response.data.pipe(createWriteStream(urlLocalZip));

    return new Promise((resolve, reject) => {
        response.data.on('end', async () => {
            resolve();
        });

        response.data.on('error', (err) => {
            reject(err);
        });
    });
}

async function electronUnzip() {
    return new Promise(async (resolve, reject) => {
        try {
            await extract(urlLocalZip, {
                dir: urlLocal,
            });
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function prepareElectron() {
    if (!existsSync(join(urlLocal, 'Electron.app')) && isDiy) {
        if (!existsSync(urlLocalZip)) {
            await electronDownload();
        }
        await electronUnzip();
    }
}

async function initSource() {
    // 复制文件
    await copy(sourceElectronPath, electronPath);
    await copy(sourceAppPath, appPath);
}

async function createAsar() {
    try {
        await createPackage(appPath, join(appPath, '../app.asar'));
    } catch (error) {
        console.error('asar:', error);
    }
}

async function removeSouce() {
    await remove(appPath);
}

async function updateIcns() {
    // 修改图标
    const logoPath = join(root, './scripts/dmg/logo.icns');
    const icoPath = join(electronPath, './Contents/Resources/electron.icns');
    await copy(logoPath, icoPath, { overwrite: true });
}

async function createDMG() {
    await remove(dmgPath);

    // const instance = appdmg({
    //     source: join(root, './scripts/dmg/release.json'),
    //     target: dmgPath,
    // });
    // const bar = new ProgressBar('[:bar] :percent :tokenTip', {
    //     total: instance.totalSteps,
    //     width: 40,
    //     token1: '打包中...',
    // });
    // instance.on('progress', (info) => {
    //     const val = info.current / info.total;

    //     if (val < 1) {
    //         bar.tick(info.current / info.total, {
    //             tokenTip: 'DMG 打包中...',
    //         });
    //     } else {
    //         bar.tick(1, {
    //             tokenTip: 'DMG 打包完成!',
    //         });
    //     }
    // });
    // instance.on('finish', () => {
    //     // console.log('dmg 打包完成!');
    // });
    // instance.on('error', console.error);
    await spawnPromise('npx', ['appdmg', join(root, './scripts/dmg/release.json'), dmgPath], { cwd: root });
}

async function start() {
    await dirInit();
    await prepareElectron();

    await initSource();
    await createAsar();
    await removeSouce();
    await updateIcns();
    // await createDMG();
    console.log('make success');
}

start();
