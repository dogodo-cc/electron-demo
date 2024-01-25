

<template>
  <div>
    <HelloWorld msg="Vite + Vue" />

    <div class="warp">
      <ui-sort-list
        @change="change"
        :list.prop="list"
        >
        <ui-sort-list-item
          v-for="(item, index) in list"
          :key="item.id"
          :index="index" 
          >
          {{ item.name }} <button @click="clickHandle(item)">delte</button>
        </ui-sort-list-item>
      </ui-sort-list>
    </div>

    <v2-ui-list
      @change="change"
      @item-click="clickHandleV2"
      :list.prop="list"
      :item-space="10"
      item-element-tag="v2-ui-list-item"
      >
    </v2-ui-list>
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
  },
  {
    name: 'item5',
    id: 5
  },
  {
    name: 'item6',
    id: 6
  },
  {
    name: 'item7',
    id: 7
  },
  {
    name: 'item8',
    id: 8
  },
  {
    name: 'item9',
    id: 9
  },
  {
    name: 'item10',
    id: 10
  }
])


function change(event: CustomEvent) {
  list.value = event.detail.list;
}

function clickHandle(item: any) {
  console.log(item);
}

function clickHandleV2(event: CustomEvent) {
  console.log(event.detail.data);
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

.warp {
  width: 300px;
  height: 240px;
  padding: 10px;
  background-color: aquamarine;
}

ui-sort-list {
  border: 1px solid #ccc;
  --item-space: 10px;
  --line-color: blue;
}
</style>
