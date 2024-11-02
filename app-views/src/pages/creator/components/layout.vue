<template>
    <div class="dock-layout" :data-direction="direction">
        <template v-if="layout.layouts?.length">
            <template v-for="(item, index) in layout.layouts" :key="item">
                <Layout :layout="item" :direction="item.direction" />
                <div class="dock-layout-line" v-if="index < layout.layouts.length - 1"></div>
            </template>
        </template>
        <div v-else-if="layout.panels" class="dock-layout-groups">
            <PagePanel :panels="layout.panels" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ILayoutItem } from './type.js'
import PagePanel from './panel.vue'
const { layout } = defineProps<{ layout: ILayoutItem, direction: ILayoutItem['direction'] }>()

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
}
</style>