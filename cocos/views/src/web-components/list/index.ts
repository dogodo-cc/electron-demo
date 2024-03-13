import { LitElement, css, html } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { sortArray } from './utils';

type IPositon = {
    start: number;
    end: number;
    index: number;
    lineTop: number;
    direction: 'top' | 'bottom';
};
const name = 'ui-list';
@customElement(name)
export class List extends LitElement {
    constructor() {
        super();
        this.addEventListener('item-dragstart', (event: any) => this.itemDragstart(event), false);
        this.addEventListener('item-dragend', () => this.itemDragend(), false);
        this.addEventListener('item-delete', (event: any) => this.itemDelete(event), false);

        // 之前采用监听 list-item 的方式，但是鼠标在两个 list-item 之间移动时（特别是间隔很大的布局），位置无法判断
        // 所以直接采用监听 list 的事件
        // this.addEventListener('item-dragover', (event: any) => this.itemDragover(event), false);
        // this.addEventListener('item-drop', (event: any) => this.itemDrop(event), false);

        // Tips: drop 事件必须搭配 dragover 事件使用，否则 drop 事件不会触发
        this.addEventListener('dragover', (event) => this.dragover(event), false);
        this.addEventListener('drop', (event) => this.drop(event), false);
        this.addEventListener('dragleave', (event) => this.dragleave(event), false);
    }
    @property({
        attribute: false,
    })
    list: any[] = [];

    @state()
    dragItemIndex!: number;

    @state()
    positons: IPositon[] = [];

    @query('.line')
    $line!: HTMLElement;

    render() {
        return html`
            <slot></slot>
            <div class="line"></div>
        `;
    }

    private calcPositons() {
        /* eslint-disable-next-line */
        const slotElement: HTMLElement[] | undefined = this.shadowRoot!.querySelector('slot')
            ?.assignedNodes()
            .filter((node) => node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'UI-LIST-ITEM')
            .map((node) => node as HTMLElement);

        if (!slotElement || !slotElement.length) {
            this.positons = [];
            return;
        }

        // 我们默认插入的方式，都以插入某个元素的后面去实现
        // 需要算出每个元素对应的可以视为插入其后面的坐标范围(即：元素中心 ~ 下一个元素的中心)
        // 所有位置都相对于列表的位置

        const positons: IPositon[] = [];
        const listRect = this.getBoundingClientRect();
        const scrollTop = this.scrollTop;

        // 计算每个元素的位置
        const rects = slotElement.map((item) => {
            const rect = item.getBoundingClientRect();
            // 位置都是相对于列表的
            return {
                top: rect.top - listRect.top + scrollTop,
                bottom: rect.bottom - listRect.top + scrollTop,
                height: rect.height,
                width: rect.width,
            };
        });

        rects.forEach((rect, index) => {
            const { top, height, bottom } = rect;
            const nextRect = rects[index + 1];

            const start = top + height / 2; // 起始点都是当前元素的中心位置

            // 由于我们默认都是插入元素的后面，所以只针对第一项处理一下，插入到前面的情况
            if (index === 0) {
                positons.unshift({
                    start: 0,
                    end: top + rect.height / 2,
                    index,
                    lineTop: top / 2,
                    direction: 'top',
                });
            }

            let end = 0;
            let lineTop = 0;
            if (index === rects.length - 1) {
                end = bottom; // 需要加上最后一项和列表底部中间的间距（可能是item的margin-bottom，可能是list的padding），这里暂时不考虑
                lineTop = bottom + 2; // 需要加上最后一项和列表底部中间的间距，同上，暂时不考虑 目前只向下偏移 2px
            } else {
                end = nextRect.top + nextRect.height / 2; // 结束点都是下一个元素的中心位置
                lineTop = bottom + (nextRect.top - bottom) / 2; // 线条的位置是在2个元素的中间
            }

            positons.push({
                start: start,
                end: end,
                index,
                lineTop,
                direction: 'bottom',
            });
        });

        this.positons = positons;
    }

    private itemDragstart(event: CustomEvent) {
        // 经过简单测试：
        // 在 chrome@120 中拖动的 item 样式会带上一截滚动条，很丑
        // 在 electron@13.1.4 内置的 chrome@91 中却不会
        // 这个 dragging 属性配合 css 样式，让开始拖动的这一瞬间隐藏掉滚动条
        this.setAttribute('dragging', 'true');
        window.requestAnimationFrame(() => {
            this.removeAttribute('dragging');
        });

        this.dragItemIndex = event.detail.index;
        this.calcPositons(); // 每次 dragstart 的时候，计算出所有 item 的位置，不用在 dragover 的时候计算
    }
    private itemDragend() {
        this.dragItemIndex = -1;
        this.$line.style.top = '-2px';
        this.$line.style.display = 'none';
    }

    private itemDelete(event: CustomEvent) {
        const deleteIndex = event.detail.index;
        if (deleteIndex < 0 || deleteIndex >= this.list.length) {
            console.error('can not delete item, index is out of range');
            return;
        }
        this.list.splice(deleteIndex, 1);
        this.dispatchEvent(
            new CustomEvent('change', {
                bubbles: true,
                detail: {
                    list: this.list,
                },
            })
        );
    }

    private drop(event: DragEvent) {
        if (!this.validate()) {
            return;
        }

        event.preventDefault();
        const listRect = this.getBoundingClientRect();
        const clientY = event.clientY - listRect.top + this.scrollTop;
        const targetItem = this.positons.find((item) => item.start <= clientY && item.end >= clientY);
        if (targetItem) {
            const newList = sortArray(this.list, this.dragItemIndex, targetItem.index, targetItem.direction === 'top');
            this.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    detail: {
                        list: newList,
                    },
                })
            );
        } else {
            console.error('drop 没有找到目标位置');
        }
    }

    private dragover(event: DragEvent) {
        if (!this.validate()) {
            return;
        }

        event.preventDefault();
        const listRect = this.getBoundingClientRect();
        const clientY = event.clientY - listRect.top + this.scrollTop;

        const targetItem = this.positons.find((item) => item.start <= clientY && item.end >= clientY);
        if (targetItem) {
            this.$line.style.display = 'block';
            this.$line.style.top = targetItem.lineTop + 'px';
        } else {
            this.$line.style.display = 'none';
        }
    }

    private dragleave(event: DragEvent) {
        // fixme: 此处应该屏蔽来自子元素的 dragleave 事件以减少不必要的代码执行 （性能优化，功能无影响）
        // 但是尝试过在子元素的 dragleave 事件中阻止冒泡，无效
        // https://dnmtechs.com/understanding-html5-dragleave-event-why-is-it-fired-when-hovering-a-child-element/
        // 所以用了取巧的方式，当触发 dragleave 事件时，判断鼠标是否在 list 元素内，如果在则不隐藏 line（在竖直方向可以屏蔽子元素的 dragleave ）
        const listRect = this.getBoundingClientRect();
        const clientY = event.clientY;
        if (clientY > listRect.top && clientY < listRect.bottom) {
            return;
        } else {
            this.$line.style.display = 'none';
        }
    }

    private validate(): boolean {
        // TODO: 应该用 event.dataTransfer.getData('xxxxx') 获取数据，但是无效
        return this.dragItemIndex !== -1;
    }

    static styles = css`
        :host {
            display: block;
            height: 100%;
            overflow-y: auto;
            position: relative;
            padding: var(--list-padding, 10px);
        }
        :host([dragging])::-webkit-scrollbar {
            width: 0;
        }
        :host([dragging])::-webkit-scrollbar-thumb {
            width: 0;
        }
        .line {
            display: none;
            position: absolute;
            left: 0;
            right: 0;
            height: 1px;
            background-color: var(--line-color, var(--color-info-fill-normal, blue));
            transition: top 0.25s ease-in;
        }

        ::slotted(ui-list-item) {
            margin-bottom: var(--item-space, 10px);
        }
        ::slotted(ui-list-item:last-child) {
            margin-bottom: 0;
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        [name]: List;
    }
}
