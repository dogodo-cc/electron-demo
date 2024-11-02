<script setup lang="ts">
import { onMounted, ref } from 'vue';

const isPackaged = ref<boolean>(false);


function openChildWin() {
  window.ipc?.send('open-child-win')
}

async function winOpen() {
  const url = await window.ipc?.invoke('get-window-url');
  console.log(url);
  window.open(url, '子窗口')
}

function winOpenOnline() {
  window.open('https://www.90s.co', '子窗口1') // 名字必须不同，否则会共用一个窗口
}

onMounted(async () => {
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.ipc?.send('show-context-menu');
  });

  window.ipc?.on('context-menu-command', (e, command) => {
    console.log(e, command);
  });

  isPackaged.value = await window.ipc?.invoke('app-is-packaged')
})
</script>

<template>
  是否打包：{{ isPackaged }}
  <a-button type="primary" @click="openChildWin">打开居中的子窗口</a-button>
  <div>
    <a-button type="primary" @click="winOpen">window.open 本地地址</a-button>
  </div>
  <div>
    <a-button type="primary" @click="winOpenOnline">window.open 在线地址</a-button>
  </div>
</template>

<style scoped></style>
