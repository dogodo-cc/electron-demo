export default {
    packagerConfig: {
        asar: true,
        prune: true, // 排除 devDependencies
        ignore: ['/\\.electron($|/)', '/\\.vscode($|/)', '/scripts', '.gitignore', '.npmrc', 'forge.config.js', 'README.md'],
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {},
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
    ],
};
