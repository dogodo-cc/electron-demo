import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
    {
        path: '/demo/',
        component: () => import('./pages/demo/layout.vue'),
        meta: {
            title: 'electron demo',
        },
        children: [
            {
                path: 'download',
                name: 'download',
                component: () => import('./pages/demo/download.vue'),
                meta: {
                    icon: '',
                },
            },
            {
                path: 'open-window',
                name: 'open-window',
                component: () => import('./pages/demo/open-window.vue'),
            },
        ],
    },
    {
        path: '/',
        name: 'home',
        redirect: '/demo/download',
        meta: {
            hideInNav: true,
        },
    },

    {
        path: '/layout',
        name: 'layout',
        component: () => import('./pages/layout/index.vue'),
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
