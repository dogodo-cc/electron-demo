<template>
  <div class="layout-nav">
    <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
      <a-menu-item v-for="item in routes" :key="item.name">
        <RouterLink :to="item.path">
          <span class="nav-text">{{ item.name }}</span>
        </RouterLink>
      </a-menu-item>
    </a-menu>
  </div>
  <div class="layout-content">
    <RouterView />
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { routes } from './route'

const selectedKeys = ref<string[]>([]);
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
