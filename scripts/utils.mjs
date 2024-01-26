import { readdir, stat } from "fs:promises";
import { join, extname, normalize, basename } from "path";
import { spawn } from 'child_process';

// 递归一个文件夹
async function recursiveDir(
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


export function spawnAsync (...args) {
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
