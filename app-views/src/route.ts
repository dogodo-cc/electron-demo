import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import Home from './pages/home.vue';
import DownloadView from './pages/download.vue';
import OpenWindowView from './pages/open-window.vue';

export const routes: RouteRecordRaw[] = [
    { path: '/', name: 'home', component: Home },
    { path: '/download', name: 'download', component: DownloadView },
    {
        path: '/open-window',
        name: 'open-winddow',
        component: OpenWindowView,
    },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
