<template>
    <div class="dock-frame">
        <Layout v-for="(layout, index) in layouts" :key="index" :direction="layout.direction" :layout="layout"
            :path="`[${index}]`" />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from 'vue';
import Layout from "./components/layout.vue";
import type { ILayoutItem } from './components/type.js'


const layouts: Ref<ILayoutItem[]> = ref([{
    direction: 'row',
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
                    },
                    {
                        direction: 'column',
                        panels: [
                            {
                                name: 'console',
                                url: 'http://localhost:5555/#/panel/console'
                            }
                        ]
                    }
                ],
            }],
        },
    ]
}])
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