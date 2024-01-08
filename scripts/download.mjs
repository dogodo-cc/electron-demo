import axios from "axios";
import {join} from "path";
import {createWriteStream, existsSync} from "fs";
import { remove, ensureDir } from "fs-extra";
import extract from "extract-zip";

const root = process.cwd();

const urlLocal = join(root, './.electron/13.1.4-ccc/')
const urlDownload = 'http://ftp.cocos.org/TestBuilds/Fireball/Electron/13.1.4/electron-v13.1.4-360-newkey-darwin.zip';
const urlLocalZip = join(root, './.electron/13.1.4-ccc.zip')

async function download() {
    await ensureDir(urlLocal);
    await remove(urlLocalZip);

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

async function unzip() {
    return new Promise(async (resolve, reject) => {
        try {
            await extract(urlLocalZip, {
                dir: urlLocal,
            } )
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function start() {
    if(existsSync(join(urlLocal, 'Electron.app'))) {
        console.log('已经存在');
    } else {
        await download();
        console.log('下载完成');
        await unzip();
        console.log('解压完成');
    }
}
   

start();