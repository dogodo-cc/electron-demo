<template>
    <div class="sub-window">
        <PagePanle :panels="panels" />
    </div>
</template>
<script setup lang="ts">
import PagePanle from './components/panel.vue'
import { computed } from 'vue'
const { name, url } = defineProps<{
    name: string,
    url: string
}>()

const panels = computed(() => {
    return [{
        name,
        url: `http://localhost:5555/#/panel/${url}`
    }]
})
</script>

<style>
.sub-window {
    width: 100vw;
    height: 100vh;
}
</style>