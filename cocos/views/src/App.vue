<template>
    <div>
        <HelloWorld msg="Vite + Vue" />

        <button @click="showItemInFolder">showItemInFolder</button>

        <div class="warp">
            <ui-list @change="change" :list.prop="list">
                <ui-list-item v-for="(item, index) in list" :key="item.id" :index="index" show-prefix show-suffix
                    draggable="true">
                    {{ item.name }} <button @click="clickHandle(item)">delte</button>
                </ui-list-item>
            </ui-list>
        </div>
    </div>
</template>

<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue';
import { ref } from 'vue';
import mermaid from 'mermaid';
const list = ref([
    {
        name: 'item1',
        id: 1,
    },
    {
        name: 'item2',
        id: 2,
    },
    {
        name: 'item3',
        id: 3,
    },
    {
        name: 'item4',
        id: 4,
    },
    {
        name: 'item5',
        id: 5,
    },
    {
        name: 'item6',
        id: 6,
    },
    {
        name: 'item7',
        id: 7,
    },
    {
        name: 'item8',
        id: 8,
    },
    {
        name: 'item9',
        id: 9,
    },
    {
        name: 'item10',
        id: 10,
    },
]);

function change(event: CustomEvent) {
    list.value = event.detail.list;
}

function clickHandle(item: any) {
    console.log(item);
}

function showItemInFolder() {
    window.electronAPI?.shell.showItemInFolder('/Users/alan/Documents/my-electron-app')
}

async function go() {
    const s = await mermaid.render(
        'a',
        `flowchart LR
        A[数据源]
        B(编辑元素)
        C[消费者]

        A --> |输入默认值|B --> |输出最终值|C`
    );
    console.log(s);
}
go();
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
