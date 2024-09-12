import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        redirect: '/demo/download',
        meta: {
            hideInNav: true,
        },
    },
    {
        path: '/demo/',
        component: () => import('./pages/demo/index.vue'),
        meta: {
            title: '操练场',
        },
        children: [
            {
                path: 'download',
                name: 'download',
                component: () => import('./pages/demo/download.vue'),
            },
            {
                path: 'open-window',
                name: 'open-window',
                component: () => import('./pages/demo/open-window.vue'),
            },
        ],
    },
    {
        path: '/creator',
        name: 'creator 4.0',
        component: () => import('./pages/creator/index.vue'),
    },
    {
        path: '/panel/:name',
        props: true,
        component: () => import('./pages/creator/panel.vue'),
        meta: {
            hideInNav: true,
        },
    },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
