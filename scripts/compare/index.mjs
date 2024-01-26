import { readdir, stat, writeFile } from 'fs/promises';
import { join, basename, dirname } from "path";
import pkg from 'lodash';
const { get, isObjectLike } = pkg;
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function recursiveDir(
    folderPath,
    data = {}
) {
    const files = await readdir(folderPath);
    const key = basename(folderPath);
    data[key] = {
        num: files.length
    };

    for (const file of files) {
        const filePath = join(folderPath, file);
        const stats = await stat(filePath);

        if (stats.isDirectory()) {
            await recursiveDir(filePath, data[key]);
        } 
    }
    return data;
}

const v382 = '/Users/alan/Downloads/CocosCreator.app/Contents/Resources';
const v383 = '/Users/alan/cocos/cocos-editor/.publish/CocosCreator.app/Contents/Resources';

const data382 = await recursiveDir(v382);
const data383 = await recursiveDir(v383);


let AeqB = '';
let AgtB = '';
let AltB = '';

function compare(data, keys = []) {
    Object.keys(data).forEach(key => {
        if(key === 'num') {
            const a = data.num;
            const b = get(data382, keys, {num: 0}); // 找不到就返回 0
            if(a === b.num) {
                AeqB += `${keys.join('.')}: ===> (${a} = ${b.num})\n`;
            } else if (a > b.num) {
                AgtB += `${keys.join('.')}: ===> (${a} > ${b.num})\n`;
            } else {
                AltB += `${keys.join('.')}: ===> (${a} < ${b.num})\n'`;
            }
        } else if (isObjectLike(data[key])) {
            compare(data[key], [...keys, key]);
        }
    })
}

compare(data383);

writeFile(join(__dirname, 'diff-相等.txt'), AeqB);
writeFile(join(__dirname, 'diff-大于.txt') , AgtB);
writeFile(join(__dirname, 'diff-小于.txt'), AltB);


// writeFile(join(__dirname, 'data-382.json'), JSON.stringify(data382, null, 4));
// writeFile(join(__dirname, 'data-383.json'), JSON.stringify(data383, null, 4));