# electron

## asar

https://github.com/electron/asar

## electron-builder

https://github.com/electron-userland/electron-builder

## electron-universal

https://github.com/electron/universal

## electron-forge

https://www.electronforge.io/

## 开发依赖

所有开发依赖都安装在 root/package.json@devDependencies 中,这样在打包的时候就不会把开发依赖打包进去。

使用 pnpm ，但是不用 workspaces 功能，为了更好的控制依赖安装的位置。
