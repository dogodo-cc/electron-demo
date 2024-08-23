import { readdir, stat } from 'node:fs/promises';
import { join, extname, normalize, basename } from 'node:path';
import { spawn } from 'node:child_process';

// 递归一个文件夹
export async function recursiveDir(
    folderPath,
    callback,
    options = {
        filter: (file) => {
            return false; // 默认不跳过任何文件
        },
    }
) {
    const files = await readdir(folderPath);
    for (const file of files) {
        const filePath = join(folderPath, file);
        const stats = await stat(filePath);

        if (options.filter?.(file)) {
            continue;
        }

        if (stats.isDirectory()) {
            await recursiveDir(filePath, callback, options);
        } else {
            await callback(filePath);
        }
    }
}

export function spawnAsync(...args) {
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

export function spawnPromise(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, args, options);

        // 收集子进程的标准输出和标准错误
        let stdout = '';
        let stderr = '';

        if (childProcess.stdout) {
            childProcess.stdout.on('data', (chunk) => {
                const s = chunk.toString();
                console.log(s);
                stdout += s;
            });
        }

        if (childProcess.stderr) {
            childProcess.stderr.on('data', (chunk) => {
                const s = chunk.toString();
                console.error(s);
                stderr += s;
            });
        }

        // 监听子进程退出事件，根据退出码判断成功或失败
        childProcess.on('exit', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr, code });
            } else {
                reject(new Error(`Command exited with non-zero status code ${code}\n${stderr}`));
            }
        });

        // 监听子进程错误事件，以防未捕获的异常
        childProcess.on('error', (err) => {
            reject(err);
        });
    });
}
