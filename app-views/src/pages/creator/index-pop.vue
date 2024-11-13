<template>
    <div class="pop-window">
        <layoutWrap :layout-id="layoutId" />
    </div>
</template>

<script setup lang="ts">
/**
 * 这个页面是用于弹出面板时渲染的，它和主页都拥有完整的 layoutWrap 布局能力
 * 区别在于主页有 header 和 footer
 */
import { ref } from "vue";
import type { Ref } from 'vue';

import layoutWrap from "./components/layout-wrap.vue";
import { useRoute, LocationQueryValue } from 'vue-router'

const route = useRoute()

const layoutId = (route.query.layoutId as LocationQueryValue) ?? '';



</script>

<style>
.pop-window {
    height: 100%;
    display: flex;
    flex-direction: column;

    .dock-frame {
        flex: 1;
    }
}
</style>