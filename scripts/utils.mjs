import { readdir, stat } from "fs";
import { join, extname, normalize, basename } from "path";
import { spawn } from 'child_process';

// 递归一个文件夹
export function recursiveDir(
    folderPath,
    callback, 
    options = {
        ignore: [],
        ignoreDir: [],
    }
) {
  readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${folderPath}: ${err}`);
      return;
    }

    files.forEach((file) => {
      const filePath = join(folderPath, file);

      stat(filePath, (statErr, stats) => {
        if (statErr) {
          console.error(`Error getting file stats for ${filePath}: ${statErr}`);
          return;
        }

        if (stats.isDirectory()) {
            const dirName = basename(normalize(filePath));
            if(!options.ignoreDir.includes(dirName)) {
                recursiveDir(filePath, callback, options);
            }
        } else {
          const ext = extname(filePath);
          if (!options.ignore.includes(ext)) {
            callback(filePath);
          }
        }
      });
    });
  });
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
