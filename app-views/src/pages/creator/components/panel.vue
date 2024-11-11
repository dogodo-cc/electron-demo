<template>
    <div class="page-panel">
        <a-tabs v-model:activeKey="activeKey" :tabBarGutter="10">
            <a-tab-pane v-for="(item, index) in panels" :key="item.name" :tab="item.name">
                <iframe :src="`${item.url}?path=${path}.panels[${index}]`" frameborder="0"></iframe>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>
<script setup lang="ts">
import type { ILayoutPanel } from './type.js'
import { ref } from 'vue'
const { panels, path } = defineProps<{
    panels: ILayoutPanel[],
    path: string
}>()

const activeKey = ref(panels?.length ? panels[0].name : '');
</script>

<style>
.page-panel {
    height: 100%;

    & .ant-tabs,
    & .ant-tabs-content-holder,
    & .ant-tabs-content {
        height: 100%;
    }

    iframe {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
    }
}
</style>