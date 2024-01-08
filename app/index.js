require('./require.js');

// 这只是一个加载应用的基座
const { existsSync } = require('fs');
const { join } = require('path');

// 自定义打包会将 cocos/ 也打包成 cocos.asar
// electro-forge 打包时，只会将 app/ 打包成 app.asar
const cocosPath = existsSync(join(__dirname, '../cocos.asar/index.js')) 
? '../cocos.asar/index.js'
: '../cocos/index.js';

require(cocosPath);

 // 监听未捕获的错误信息
 process.on('uncaughtException', function(err) {
    console.error(err);
    throw err;
});

// 监听进程错误
process.on('error', function(err) {
    console.error(err);
    throw err;
});