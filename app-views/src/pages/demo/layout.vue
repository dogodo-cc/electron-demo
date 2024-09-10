<template>
  <div class="layout-nav">
    <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline" :items="_routes" @select="handleSelect">

    </a-menu>
  </div>
  <div class="layout-content">
    <RouterView />
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { routes } from '../../route'
import { useRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router';
import type { ItemType } from 'ant-design-vue'

const selectedKeys = ref<string[]>([]);
const router = useRouter();
function handleSelect({ key }: { key: string }) {
  router.push(key)
}

function routesToItems(routes: RouteRecordRaw[]): ItemType[] {
  return routes.filter(v => !v.meta?.hideInNav).map(route => ({
    key: route.path,
    label: route.meta?.title ?? route.name ?? route.path,
    children: route.children ? routesToItems(route.children) : undefined,
  }));
}

const _routes = routesToItems(routes);




</script>
<style scoped>
.layout-nav {
  position: fixed;
  width: 200px;
  top: 0;
  left: 0;
  bottom: 0;

  & .ant-menu {
    height: 100%;
  }
}

.layout-content {
  margin-left: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
