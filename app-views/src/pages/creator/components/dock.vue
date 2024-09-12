<template>
    <div class="dock-frame">
        <Layout :direction="layout.direction" :layout="layout" />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from 'vue';
import Layout from "./layout.vue";
import type { ILayoutItem } from './type.js'


const layout: Ref<ILayoutItem> = ref({
    layouts: [
        {
            direction: 'row',
            panels: [
                {
                    name: 'hierarchy',
                    url: 'http://localhost:5555/#/panel/hierarchy'
                },
                {
                    name: 'assets',
                    url: 'http://localhost:5555/#/panel/assets'
                }
            ]
        },
        {
            direction: 'column',
            layouts: [{
                direction: 'row',
                panels: [
                    {
                        name: 'animator',
                        url: 'http://localhost:5555/#/panel/animator'
                    }
                ]
            }, {
                direction: 'row',
                layouts: [
                    {
                        direction: 'column',
                        panels: [
                            {
                                name: 'inspector',
                                url: 'http://localhost:5555/#/panel/inspector'
                            },
                            {
                                name: 'scene',
                                url: 'http://localhost:5555/#/panel/scene'
                            }
                        ]
                    }, {
                        direction: 'column',
                        panels: [
                            {
                                name: 'project',
                                url: 'http://localhost:5555/#/panel/project'
                            }
                        ]
                    }
                ],

            }],
        },
    ],
    direction: 'row'
})
</script>

<style>
.dock-frame {
    display: flex;
    width: 100%;
    height: 100vh;
    background-color: aliceblue;
    overflow: hidden;
}
</style>