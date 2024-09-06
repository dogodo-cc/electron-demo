import { createHash } from 'node:crypto';
import { createReadStream, existsSync, createWriteStream } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function getFileMD5(file: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = createHash('md5');

        const stream = createReadStream(file);
        stream.on('error', reject);
        stream.on('data', (chunk) => {
            hash.update(chunk);
        });

        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });
    });
}

export function sleep(time: number = 0): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export function getDirname(url: string): string {
    return dirname(fileURLToPath(url));
}
