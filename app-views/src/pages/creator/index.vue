<template>
    <div class="main-window">
        <div class="header">header</div>
        <layoutWrap :layout-id="layoutId" />
        <div class="footer">footer</div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from 'vue';

import layoutWrap from "./components/layout-wrap.vue";
import { useRoute, LocationQueryValue } from 'vue-router'

const route = useRoute()

const layoutId = (route.query.layoutId as LocationQueryValue) ?? '';



</script>

<style>
.main-window {
    height: 100%;
    display: flex;
    flex-direction: column;

    .header,
    .footer {
        text-align: center;
    }

    .dock-frame {
        flex: 1;
    }
}
</style>