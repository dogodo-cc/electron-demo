<template>
    <div class="page-panel">
        <span>{{ name }}</span>
    </div>
</template>
<script setup lang="ts">
const { name } = defineProps<{
    name: string
}>()
</script>

<style>
.page-panel {
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