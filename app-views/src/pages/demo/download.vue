<template>
    <div class="download-demo">
        <div class="task" v-for="task in taskList" :key="task.url">
            <a-progress :percent="Math.ceil(task.percent * 100)"></a-progress>
            <a-tag color="purple">{{ bytesToSize(task.bytesPerSecond ?? 0) }}</a-tag>
            <a-button :type="task.isPause ? 'primary' : 'default'" @click="downloadTogglePause(task)">
                {{ task.percent === 1 ? '完成' : (task.isPause ? '继续' : '暂停') }}</a-button>
        </div>

        <div class="btns">
            <a-button :key="link" v-for="(link, i) in links" @click="download(link)">下载{{ i + 1 }}</a-button>
        </div>

        <div>
            <a-button @click="downloadAndReadHash">下载编辑器列表写入 hash</a-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from 'vue';

function bytesToSize(bytes: number): string {
    if (typeof bytes !== 'number') {
        bytes = 0;
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0';
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + units[i];
}
// const name = '380_'
const name = 'hello'
const links = [
    `http://ftp.cocos.org/TestBuilds/Dashboard/local-test/1/${name}1.zip`,
    `http://ftp.cocos.org/TestBuilds/Dashboard/local-test/1/${name}2.zip`,
    `http://ftp.cocos.org/TestBuilds/Dashboard/local-test/1/${name}3.zip`,
    `http://ftp.cocos.org/TestBuilds/Dashboard/local-test/1/${name}4.zip`,
    `http://ftp.cocos.org/TestBuilds/Dashboard/local-test/1/${name}5.zip`,
    `http://ftp.cocos.org/TestBuilds/Dashboard/local-test/1/${name}6.zip`
]


const taskList = ref<IDownloadItem[]>([]);


function download(link: string) {
    window.ipc?.send('download-create', link);
}

function downloadTogglePause(item: IDownloadItem) {
    if (item.isPause) {
        console.log('继续下载')
        window.ipc?.send('download-create', item.url);
    } else {
        console.log('暂停下载')
        window.ipc?.send('download-pause', item.url);
    }
}

function onDownloadUpdate(_: any, list: IDownloadItem[]) {
    taskList.value = list;
}

function onDownloadProgress(_: any, item: IDownloadItem) {
    const task = taskList.value.find(v => v.url === item.url);
    if (task) {
        task.percent = item.percent;
        task.bytesPerSecond = item.bytesPerSecond ?? 0;
    }
}

window.ipc?.on('download-update', onDownloadUpdate);
window.ipc?.on('download-progress', onDownloadProgress)

onUnmounted(() => {
    window.ipc?.off('download-update', onDownloadUpdate);
    window.ipc?.off('download-progress', onDownloadProgress)
})

function downloadAndReadHash() {
    window.ipc?.send('start-write-hash');
}
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