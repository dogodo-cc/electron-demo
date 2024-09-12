<template>
    <div class="dock-layout" :data-direction="direction">
        <template v-if="layout.layouts?.length">
            <template v-for="(item, index) in layout.layouts" :key="item">
                <Layout :layout="item" :direction="item.direction" />
                <div class="dock-layout-line" v-if="index < layout.layouts.length - 1"></div>
            </template>
        </template>
        <div v-else class="dock-layout-groups">
            <a-tabs v-model:activeKey="activeKey" :tabBarGutter="10">
                <a-tab-pane v-for="item in layout.panels" :key="item.name" :tab="item.name">
                    <iframe :src="item.url" frameborder="0"></iframe>
                </a-tab-pane>
            </a-tabs>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ILayoutItem } from './type.js'
const { layout } = defineProps<{
    layout: ILayoutItem,
    direction: ILayoutItem['direction']
}>()

const activeKey = ref(layout.panels?.length ? layout.panels[0].name : '');



</script>

<style>
.dock-layout {
    display: flex;
    max-width: 100%;
    max-height: 100%;
    flex: 1;

    &[data-direction="row"] {
        flex-direction: row;

        &>.dock-layout-line {
            width: 1px;
        }
    }

    &[data-direction="column"] {
        flex-direction: column;

        &>.dock-layout-line {
            height: 1px;
        }
    }

    .dock-layout-groups {
        width: 100%;
        height: 100%
    }

    .dock-layout-line {
        flex-shrink: 0;
        background-color: blueviolet;
    }

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