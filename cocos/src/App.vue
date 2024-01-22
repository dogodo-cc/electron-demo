

<template>
  <div>
    <HelloWorld msg="Vite + Vue" />

    <ui-list
      @change="dragSort"
      :list.prop="list"
      :itemSpace="10">
      <ui-list-item
        v-for="(item, index) in list"
        :key="item.id"
        :index="index" 
        >
        {{ item.name }} <button draggable="true" @click="clickHandle(item)">delte</button>
      </ui-list-item>
    </ui-list>
  </div>
</template>

<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { ref } from 'vue'
const list = ref([
  {
    name: 'item1',
    id: 1
  },
  {
    name: 'item2',
    id: 2
  },
  {
    name: 'item3',
    id: 3
  },
  {
    name: 'item4',
    id: 4
  }
])

function dragSort(event: CustomEvent) {
  list.value = event.detail.list;
}

function clickHandle(item: any) {
  console.log(item);
}

</script>

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

hi-list {
  background-color: aquamarine;
}
</style>
