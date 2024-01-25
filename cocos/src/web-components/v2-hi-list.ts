import { customElement } from 'lit/decorators.js';
import { sortArray } from './utils.ts';
import { SortListItem } from './v2-hi-list-item.ts'

type IPositon = {
    start: number;
    end: number;
    index: number;
    lineTop: number;
    direction: 'top' | 'bottom';
};
const name = 'v2-ui-list';

@customElement(name)
export class SortList extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('item-dragstart', (event: any) => this.itemDragstart(event), false);
        this.addEventListener('item-dragend', () => this.itemDragend(), false);

        // Tips: drop 事件必须搭配 dragover 事件使用，否则 drop 事件不会触发
        this.addEventListener('dragover', (event) => this.dragover(event), false);
        this.addEventListener('drop', (event) => this.drop(event), false);


        const shadow = this.attachShadow({ mode: 'open' });

        // style
        const style = document.createElement('style');
        style.textContent = ` 
        :host {
          
        }
        .root {
          position: relative;
        }
        .list-wrap {
          padding: var(--list-padding);
        }
        .line {
            display:none;
            position: absolute;
            left: var(--list-padding);
            right: var(--list-padding);
            height: 1px;
            background-color: var(--line-color);
        }
        .line.show {
            display: block;
            transition: top 0.25s ease-in;
        }
    
        v2-ui-list-item {
          margin-bottom: var(--item-space);
        }
        v2-ui-list-item:last-child {
          margin-bottom: 0;
        }
        `;

        // list-wrap
        const $listWrap = document.createElement('div');
        $listWrap.className = 'list-wrap';
        this.$listWrap = $listWrap;

        // line
        const $line = document.createElement('div');
        $line.className = 'line';
        this.$line = $line;

        // root
        const $root = document.createElement('div');
        $root.className = 'root';
        this.$root = $root;
        $root.appendChild($listWrap);
        $root.appendChild($line);

        shadow.appendChild(style);
        shadow.appendChild($root);
    }
    
    itemElementTag = 'v2-ui-list-item';
    itemSpace = 10;
    listPadding = 10;
    lineColor = 'blue';

    _list: any[] = [];
    set list(value) {
        this._list = value;
        this.updateList();
    }
    get list() {
      return this._list;
    }
    

    private dragItemIndex!: number;
    private positons: IPositon[] = [];
    
    $root!: HTMLElement;
    $listWrap!: HTMLElement;
    $line!: HTMLElement;

    connectedCallback() {
      this.updateStyle();
    }

    get styles() {
      return {
          '--item-space': this.itemSpace + 'px',
          '--list-padding': this.listPadding + 'px',
          '--line-color': this.lineColor,
      };
    }

    private updateStyle() {
        this.$root.style.cssText = Object.keys(this.styles).map((key) => `${key}: ${this.styles[key]}`).join(';');
    }

    updateList() {
        this.$listWrap.innerHTML = '';
        this.list.forEach((item, index) => {
          const $item = document.createElement(this.itemElementTag) as SortListItem;
            $item.value = item;
            $item.setAttribute('index', String(index));
            this.$listWrap.appendChild($item);
        })
    }

    private calcPositons() {
        /* eslint-disable-next-line */
        const slotElement: HTMLElement[] | undefined = Array.from(this.shadowRoot!.querySelectorAll(this.itemElementTag))
            .map((node) => node as HTMLElement);

        if (!slotElement || !slotElement.length) {
            this.positons = [];
            return;
        }
        const listRect = this.getBoundingClientRect();
        // 我们默认插入的方式，都以插入某个元素的后面去实现
        // 那么就需要算出每个元素对应的可以视为插入其后面的坐标范围
        const positons: IPositon[] = slotElement.map((item, index) => {
            const rect = item.getBoundingClientRect();
            const { top, height, bottom } = rect;

            const start = top + height / 2; // 起始点都是元素的中心位置
            let end = -1;
            let lineTop = -1; // 线条的位置

            if (index === slotElement.length - 1) {
                end = listRect.bottom;
                lineTop = bottom + (listRect.bottom - bottom) / 2; // 最后一项和列表底部中间
            } else {
                const nextRect = slotElement[index + 1].getBoundingClientRect();
                end = nextRect.top + height / 2;
                lineTop = bottom + (nextRect.top - bottom) / 2; // 两个项目中间
            }

            return {
                start: start,
                end: end,
                index: index,
                lineTop: lineTop - listRect.top, // 是基于列表的坐标去做计算
                direction: 'bottom',
            };
        });

        // 追加一个插入到第一个元素的前面的“特殊情况”
        const firstRect = slotElement[0].getBoundingClientRect();
        positons.unshift({
            start: listRect.top,
            end: firstRect.top + firstRect.height / 2,
            index: 0,
            lineTop: listRect.top + (firstRect.top - listRect.top) / 2 - listRect.top,
            direction: 'top',
        });

        this.positons = positons;
    }

    private itemDragstart(event: CustomEvent) {
        this.dragItemIndex = event.detail.index;
        this.calcPositons(); // 每次 dragstart 的时候，计算出所有 item 的位置，不用在 dragover 的时候计算
    }

    private itemDragend() {
        this.dragItemIndex = -1;
        this.$line.classList.remove('show');
        this.$line.style.top = '-2px';
    }

    private drop(event: DragEvent) {
        event.preventDefault();
        const clientY = event.clientY;
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

        // 拖拽结束之后，隐藏线条
        this.itemDragend(); // 由于更新是 直接复写了 innerHTML，所以 dragend 事件接收不到
    }

    private dragover(event: DragEvent) {
        event.preventDefault();
        const clientY = event.clientY;
        const targetItem = this.positons.find((item) => item.start <= clientY && item.end >= clientY);
        if (targetItem) {
            this.$line.classList.add('show')
            this.$line.style.top = targetItem.lineTop + 'px';
        } else {
          this.$line.classList.remove('show')
        }
    }

    static observedAttributes = ['item-space', 'list-padding', 'line-color'];

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        
        switch (name) {
          case 'item-space':
            this.itemSpace = newValue;
            this.updateStyle();
            break;
          case 'list-padding':
            this.listPadding = newValue;
            this.updateStyle();
            break;
          case 'line-color':
            this.lineColor = newValue;
            this.updateStyle();
            break    
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        [name]: SortList;
    }
}
