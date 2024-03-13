# ui-list

## 案例
<div>
    <ui-list
        :list.prop="list"
        style="--item-space: 20px;"
        @change="dragSortHandle">
        <ui-list-item
            v-for="(item, index) in list"
            :show-suffix.prop="item.id !== 2"
            draggable="true"
            :key="item.id"
            :index="index">
            <span v-if="item.id === 3" slot="prefix">prefix</span>    
            <span v-if="item.id === 3" slot="suffix">suffix</span>    
            {{item.name}}
        </ui-list-item>
    </ui-list>
</div> 

```html
<ui-list
    :list.prop="list"
    @change="dragSortHandle">
    <ui-list-item
        v-for="(item, index) in list"
        :show-suffix.prop="item.id !== 2"
        draggable="true"
        :key="item.id"
        :index="index">
        <span v-if="item.id === 3" slot="prefix">prefix</span>    
        <span v-if="item.id === 3" slot="suffix">suffix</span>    
        {{item.name}}
    </ui-list-item>
</ui-list>
```
注意： ui-list-item 的 index 属性必须提供，否则无法正确排序。

```js
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'DemoUiSortList',
    setup(props, ctx) {
        const list = ref([{
            id: 1,
            name: 'item1'
        },{
            id: 2,
            name: 'item2'
        },{
            id: 3,
            name: 'item3'
        },{
            id: 4,
            name: 'item4'
        }]);
        function dragSortHandle(event) {
            list.value = event.detail.list;
        }
        return {
            list,
            dragSortHandle,
        };
    },
});
```

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'DemoUiSortList',
    setup(props, ctx) {
        const list = ref([{
            id: 1,
            name: 'item1'
        },{
            id: 2,
            name: 'item2'
        },{
            id: 3,
            name: 'item3'
        },{
            id: 4,
            name: 'item4'
        }]);
        function dragSortHandle(event) {
            list.value = event.detail.list;
        }
        return {
            list,
            dragSortHandle
        };
    },
});
</script>

## 属性
如果配合 vue 使用，记得设置属性的时候加上 .prop
| 属性名称  | 描述           | 类型      | 版本 |
| --------- | -------------- | ------------- | ---- |
| list  | 将需要排序的数组传递给 ui-list 的属性 | any[] |      |


## 事件

| 事件名称  | 描述           | 参数类型      | 版本 |
| --------- | -------------- | ------------- | ---- |
| `change`  | 当列表进行一次拖动排序后触发 | event.detail.list |      |

## 样式
| 变量名称  | 描述           | 
| --------- | -------------- | 
| --item-space  |  项目间隔 | 
| --list-padding  |  容器的内边距 |
| --line-color  |  指示线条的颜色 | 

