<script setup lang="ts">
import { onMounted, ref } from 'vue';

const isPackaged = ref<boolean>(false);


function openChildWin() {
  window.ipc.send('open-child-win')
}

onMounted(async () => {
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.ipc.send('show-context-menu');
  });

  window.ipc.on('context-menu-command', (e, command) => {
    console.log(e, command);
  });

  isPackaged.value = await window.ipc.invoke('app-is-packaged')
})
</script>

<template>
  是否打包：{{ isPackaged }}
  <a-button type="primary" @click="openChildWin">打开居中的子窗口</a-button>
</template>

<style scoped></style>
