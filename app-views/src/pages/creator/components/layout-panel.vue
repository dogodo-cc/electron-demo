<template>
    <div class="page-panel">
        <div class="panels">
            <div class="panels-header" @drop="drop" @dragover="(event) => event.preventDefault()">
                <div draggable="true" :class="{ item: true, active: item.name === activeKey }" v-for="(item) in panels"
                    :key="item.name" @click="changePanel(item.name)" @dragstart="dragstart(item, $event)"
                    @dragend="dragend(item, $event)">
                    {{ item.name }}</div>
            </div>
            <div class="panels-body">
                <template v-for="(item, index) in panels" :key="item.name" :tab="item.name">
                    <template v-if="loadMap[item.name]">
                        <iframe v-show="item.name === activeKey" :src="`${item.url}?path=${path}.panels[${index}]`"
                            frameborder="0"></iframe>
                    </template>
                </template>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { addPanel } from '../../../keys.js'
const { panels, path } = defineProps<{
    panels: MyLayout.ILayoutPanel[],
    path: string
}>()

// 实现懒加载
const loadMap = ref<{ [k: string]: boolean }>({})


const activeKey = ref(panels?.length ? panels[0].name : '');

loadMap.value[activeKey.value] = true;

function changePanel(name: string) {
    activeKey.value = name;
    loadMap.value[name] = true;
}

// 当前面板激活的 panel 的数据路径
const currentActivePath = computed(() => {
    const index = panels.findIndex(v => v.name === activeKey.value);
    if (index === -1) {
        return '';
    }
    return `${path}.panels[${index}]`

})

// 拖拽目标项
function dragstart(item: MyLayout.ILayoutPanel, event: DragEvent) {
    console.log('dragstart', item, event)
    if (event.dataTransfer) {
        event.dataTransfer.setData('application/json', JSON.stringify(item));
    }

}

function dragend(item: MyLayout.ILayoutPanel, event: DragEvent) {
    console.log('dragend', item, event)
}


// TODO: 这个 inject 的类型推导很牛逼，creator 应该可以借鉴
const handleAddPanel = inject(addPanel, () => { }); // 这边加了默认函数是因为这个组件会在脱离 layout 组件的情况下用，所以 inject 得到的可能为空

// 拖拽目的区域
function drop(event: DragEvent) {
    console.log(event)
    if (event.dataTransfer) {
        const item = JSON.parse(event.dataTransfer.getData('application/json'));
        console.log(item)
        handleAddPanel?.(path, currentActivePath.value, item)
    }

}


</script>

<style>
.page-panel {
    height: 100%;

    .panels {
        height: 100%;
        display: flex;
        flex-direction: column;

        .panels-header {
            display: flex;
            height: 30px;
            color: rgb(27, 27, 31);
            user-select: none;

            .item {
                margin-left: 10px;
                cursor: pointer;

                &.active {
                    background-color: teal;
                }
            }
        }

        .panels-body {
            flex: 1;
        }
    }


    iframe {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
    }
}
</style>