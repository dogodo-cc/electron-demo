<script setup lang="ts">
import { onMounted, ref } from 'vue';
import HelloWorld from './components/HelloWorld.vue'

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
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue3" />
  是否打包：{{ isPackaged }}
  <button @click="openChildWin">打开居中的子窗口</button>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
