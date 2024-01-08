import { join, basename, extname } from 'path';
import { ensureDir, emptydir, copy, remove } from 'fs-extra'
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { createPackage } from '@electron/asar';
import appdmg from 'appdmg';
import ProgressBar from 'progress';
import {recursiveDir, spawnAsync} from './utils.mjs';
import xxtea from 'xxtea-node';

const isTest = true; // 是否使用测试的 electron 版本
const root = process.cwd();

const publishPath = join(root, './out');
const dmgPath = join(publishPath, 'hello.dmg');

const electronPath = join(publishPath, 'hello.app');
const appPath = join(electronPath, 'Contents/Resources/app');
const cocosPath = join(electronPath, 'Contents/Resources/cocos');

const sourceElectronPath = isTest ? join(root, '.electron/13.1.4-ccc/Electron.app') : join(root, 'node_modules/electron/dist/Electron.app');
const sourceAppPath = join(root, 'app');
const sourceCocosPath = join(root, 'cocos');

async function dirInit() {
    await ensureDir(publishPath);
    await ensureDir(electronPath);
    await emptydir(electronPath);
}

async function initSource() {
     // 复制文件
     await copy(sourceElectronPath, electronPath);
     await copy(sourceAppPath, appPath);
     await copy(sourceCocosPath, cocosPath);
}

async function removeSouce() {
    await remove(appPath);
    await remove(cocosPath);
}

async function encryptFile(file) {
    const encryptKey = process.env['Creator3D_encryptKey_0623']  || '1234567890';
    function canSkipEncrypt(file) {
        const result =  basename(file) === 'require.js' 
        || extname(file) !== '.js'
        || basename(file) === 'index.js' 
        || /(static|i18n|node_modules)/.test(file)
        || /(min.js$)/.test(file)
        || !existsSync(file)
        return result
    }

    function encryptExec(file) {
        if(canSkipEncrypt(file)) {
            return
        }

        try {
            const content = xxtea.encrypt(readFileSync(file, 'utf8'), encryptKey);
            writeFileSync(file.replace(/\.js$/, `.ccc`), content);
            remove(file);
        } catch (error) {
            console.log(file);
            console.log('encryptFile', error);
        }
    }

    recursiveDir(
        appPath, 
        encryptExec,
        {
            ignoreDir: ['.git'],
            ignore: []
        }
    );

    recursiveDir(
        cocosPath, 
        encryptExec,
        {
            ignoreDir: ['.git'],
            ignore: []
        }
    );

}

async function createAsar() {
    try {
        await createPackage(appPath, join(appPath, '../app.asar'));
        await createPackage(cocosPath, join(cocosPath, '../cocos.asar'));
    } catch (error) {
        console.error('asar:', error);
    }
}

async function updateIcns() {
     // 修改图标
     const logoPath = join(root, './scripts/pack/logo.icns');
     const icoPath = join(electronPath, './Contents/Resources/electron.icns');
     await copy(logoPath,icoPath, { overwrite: true });
}

async function createDMG() {
    await remove(dmgPath);

    const instance = appdmg({
        source: join(root, './scripts/pack/release.json'), 
        target: dmgPath,
    });
    const bar = new ProgressBar('[:bar] :percent :tokenTip', {
        total: instance.totalSteps, 
        width: 40,
        token1: '打包中...',
    });
    instance.on('progress', (info) => {
        const val = info.current / info.total;
      
        if(val < 1) {
            bar.tick(info.current / info.total, {
                tokenTip: 'DMG 打包中...',
            });
        } else {
            bar.tick(1, {
                tokenTip: 'DMG 打包完成!',
            })
        }
    });
    instance.on('finish', () => {
        // console.log('dmg 打包完成!');
    });
    instance.on('error', error => console.error(error));
}

async function start() {
    await dirInit();
    await initSource();
    await encryptFile();
    await createAsar();
    await removeSouce();
    await updateIcns();
    await createDMG();
}

start();

















// backup
async function backup() {
    // 定制的 asar 只能用 cli 的方式调用
    const ccAsarCmd = join(root, './node_modules/creator-asar/bin/asar');
    await spawnAsync(ccAsarCmd, ['pack', appPath, join(appPath, '../app.asar')]);
    await spawnAsync(ccAsarCmd, ['pack', cocosPath, join(cocosPath, '../cocos.asar')]);
}