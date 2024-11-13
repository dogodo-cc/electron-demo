<template>
    <div class="dock-frame">
        <Layout v-for="(layout, index) in layouts" :key="index" :direction="layout.direction" :layout="layout"
            :path="`[${index}]`" />
    </div>
</template>

<script setup lang="ts">
import { ref, provide } from "vue";
import type { Ref } from 'vue';
import Layout from "../components/layout.vue";
import { addPanel } from '../../../keys.ts'
import { getProperty } from 'dot-prop'

const { layoutId } = defineProps<{
    layoutId: string
}>()

console.log('layoutId: ', layoutId)



const layouts: Ref<MyLayout.ILayoutItem[]> = ref([{
    direction: 'row',
    layouts: [
        {
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
                        panels: [
                            {
                                name: 'project',
                                url: 'http://localhost:5555/#/panel/project'
                            }
                        ]
                    },
                    {
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

provide(addPanel, (parentPath: string, path: string, item: MyLayout.ILayoutPanel) => {
    console.log(addPanel, parentPath, path, item)

    const p = getProperty(layouts.value, parentPath) as MyLayout.ILayoutItem;
    p && p.panels?.push(item)
})

</script>

<style>
.dock-frame {
    display: flex;
    background-color: aliceblue;
    overflow: hidden;
}
</style>