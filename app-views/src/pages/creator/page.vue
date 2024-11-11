<template>
    <div class="page-panel-common">
        <div>
            <span>{{ name }}</span>
            <div style="font-size: 14px;">{{ route.query.path }}</div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
const { name } = defineProps<{
    name: string
}>()

const route = useRoute()
</script>

<style>
.page-panel-common {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(27, 27, 31);
    color: rgba(255, 255, 245, 0.86);
    font-size: 20vw;
    text-transform: capitalize;
}
</style>