<template>
    <div class="download-demo">
        <div class="task" v-for="task in taskList" :key="task.url">
            <a-progress :percent="Math.ceil(task.percent * 100)"></a-progress>
            <a-tag color="purple">{{ bytesToSize(task.bytesPerSecond) }}</a-tag>
            <a-button :type="task.isPause ? 'primary' : 'default'" @click="downloadTogglePause(task)">
                {{ task.percent === 1 ? '完成' : (task.isPause ? '继续' : '暂停') }}</a-button>
        </div>

        <div class="btns">
            <a-button :key="link" v-for="(link, i) in links" @click="download(link)">下载{{ i + 1 }}</a-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

function bytesToSize(bytes: number): string {
    if (typeof bytes !== 'number') {
        bytes = 0;
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0';
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + units[i];
}


const url = 'https://www.90s.co/videos/hello.zip';
const url2 = 'http://ftp.cocos.org/TestBuilds/Editor-3d/v3.8.4/CocosCreator-v3.8.4-win-082913.zip'
const url3 = 'http://ftp.cocos.org/TestBuilds/Editor-3d/v3.8.4/CocosCreator-v3.8.4-mac-082613.zip';

const links = [url, url2, url3];

const taskList = ref<IDownloadItem[]>([]);


function download(link: string) {
    window.ipc.send('download-create', link);
}

function downloadTogglePause(item: IDownloadItem) {
    if (item.isPause) {
        console.log('继续下载')
        window.ipc.send('download-create', item.url);
    } else {
        console.log('暂停下载')
        window.ipc.send('download-pause', item.url);
    }
}


window.ipc.on('download-update', (_, list: IDownloadItem[]) => {
    taskList.value = list;
})

window.ipc.on('download-progress', (_, item: IDownloadItem) => {
    const task = taskList.value.find(v => v.url === item.url);
    if (task) {
        task.percent = item.percent;
        task.bytesPerSecond = item.bytesPerSecond ?? 0;
    }
})
</script>

<style>
.download-demo {
    margin-top: 30px;
    width: 50%;
    text-align: center;

    & .task {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        border: 1px dashed #eee;
        padding: 14px;
        border-radius: 6px;
    }

    & .btns {
        button+button {
            margin-left: 10px;
        }
    }
}
</style>