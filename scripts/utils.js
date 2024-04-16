'use strict';

const ps = require('path');
const fse = require('fs-extra');
const { spawn } = require('child_process');
const yauzl = require('yauzl');
const axios = require('axios');
const { existsSync, createWriteStream } = require('fs');

const darwinCommand = {
    git: 'git',
    npm: 'npm',
    tsc: ps.join(__dirname, '../node_modules/typescript/bin/tsc'),
    lessc: 'lessc',
    // asar: 'asar',
    asar: ps.join(__dirname, '../node_modules/creator-asar/bin/asar'),
    gulp: 'gulp',
    nodeGyp: 'node-gyp',
    chmod: 'chmod',
};

const win32Command = {
    git: 'git',
    npm: 'npm.cmd',
    tsc: ps.join(__dirname, '../node_modules/.bin/tsc.cmd'),
    lessc: 'lessc.cmd',
    asar: 'asar.cmd',
    gulp: 'gulp.cmd',
    nodeGyp: 'node-gyp.cmd',
    chmod: 'chmod.cmd',
};

exports.cmd = process.platform === 'win32' ? win32Command : darwinCommand;

/**
 * 解压包
 */
const unzipOfDarwin = function (src, dist, callback) {
    var file = ps.dirname(dist);
    fse.ensureDirSync(file);

    // @ts-ignore
    var child = spawn('unzip', [src, '-d', dist]);

    var errText = '';
    // @ts-ignore
    child.stderr.on('data', (data) => {
        errText += data;
    });
    var text = '';
    // @ts-ignore
    child.stdout.on('data', (data) => {
        text += data;
    });
    // @ts-ignore
    child.on('close', (code) => {
        if (text) {
            console.log(text);
        }
        if (errText) {
            console.warn(errText);
        }
        // code == 0 测试通过，其余的为文件有问题
        var error = null;
        if (code !== 0) {
            error = new Error('The decompression has failed');
        }
        callback(error);
    });
};

const unzipOfWin32 = function (src, dist, callback) {
    var file = ps.dirname(dist);
    fse.ensureDirSync(file);

    var child = spawn(ps.join(__dirname, '../tools/unzip.exe'), [src, '-d', dist]);

    var errText = '';
    // @ts-ignore
    child.stderr.on('data', (data) => {
        errText += data;
    });
    var text = '';
    // @ts-ignore
    child.stdout.on('data', (data) => {
        text += data;
    });
    child.on('close', (code) => {
        if (text) {
            console.log(text);
        }
        if (errText) {
            console.warn(errText);
        }
        // code == 0 测试通过，其余的为文件有问题
        var error = null;
        if (code !== 0) {
            error = new Error('The decompression has failed');
        }
        callback(error);
    });
};

/**
 * 使用yauzl实现的解压缩，可在package执行脚本阶段使用
 * @param {*} src 压缩包所在路径 如  static/internal-plugin/store.zip
 * @param {*} dist 解压后的文件路径 如  static/internal-plugin/store
 * @returns
 */
exports.yauzl = function (src, dist) {
    function safeEnsureDir(path) {
        try {
            fse.ensureDirSync(path);
        } catch (error) {
            console.log(error);
        }
    }
    return new Promise((resolve, reject) => {
        yauzl.open(src, { lazyEntries: true }, function (err, zipfile) {
            if (err) {
                throw err;
            }
            zipfile.on('entry', function (entry) {
                const entryName = entry.fileName;
                const targetPath = entryName;
                if (/\/$/.test(entry.fileName)) {
                    safeEnsureDir(ps.join(dist, targetPath));
                    zipfile.readEntry();
                } else {
                    safeEnsureDir(ps.join(dist, ps.dirname(targetPath)));
                    zipfile.openReadStream(entry, function (err, readStream) {
                        if (err) {
                            throw err;
                        }
                        readStream.on('end', function () {
                            zipfile.readEntry();
                        });
                        const fullFile = ps.join(dist, targetPath);
                        const writeStream = fse.createWriteStream(fullFile, {
                            mode: 0o777,
                        });
                        readStream.pipe(writeStream);
                    });
                }
            });
            zipfile.on('error', (error) => {
                reject(error);
            });
            zipfile.once('end', () => {
                zipfile.close();
                resolve(void 0);
            });
            zipfile.readEntry();
        });
    });
};

if (process.platform === 'win32') {
    exports.unzip = unzipOfWin32;
} else {
    exports.unzip = unzipOfDarwin;
}

exports.config = {
    ftp: {
        host: '192.168.52.109',
        port: '21',
        user: process.env.ftpUser,
        password: process.env.ftpPass,
    },
};

exports.spawnPromise = (...args) => {
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
};

exports.download = async function (url, dist) {
    if (!url) {
        console.error('The download url is empty');
        return;
    }
    if (!dist) {
        console.error('The download path is empty');
    }
    if (existsSync(dist)) {
        console.error('The file already exists, skip download');
        return;
    }
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
    });

    // 使用管道流将文件写入到指定路径
    response.data.pipe(createWriteStream(dist));

    return new Promise((resolve, reject) => {
        response.data.on('end', async () => {
            resolve();
        });

        response.data.on('error', (err) => {
            reject(err);
        });
    });
};
