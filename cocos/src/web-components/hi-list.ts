import { LitElement, css, html } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

type IPositon = {
  start: number,
  end: number,
  index: number,
  lineTop: number,
  direction: 'top' | 'bottom',
};

@customElement('ui-list')
export class SortList extends LitElement {

    constructor() {
        super();
        this.addEventListener('item-dragstart', (event: any) => this.itemDragstart(event), false);
        this.addEventListener('item-dragend', () => this.itemDragend(), false);

        // 之前采用监听 list-item 的方式，但是鼠标在两个 list-item 之间移动时（特别是间隔很大的布局），位置无法判断
        // 所以直接采用监听 list 的事件
        // this.addEventListener('item-dragover', (event: any) => this.itemDragover(event), false);
        // this.addEventListener('item-drop', (event: any) => this.itemDrop(event), false);

        // Tips: drop 事件必须搭配 dragover 事件使用，否则 drop 事件不会触发
        this.addEventListener('dragover', (event) => this.dragover(event), false);
        this.addEventListener('drop', (event) => this.drop(event), false);
    }
  @property({
    attribute: false,
  })
  list: any[] = [];


  @property({
    type: Number,
    attribute: true,
  })
  itemSpace = 10;

  @property({
    type: Number,
  })
  listPadding = 10;

  @property({
    type: String,
  })
  lineColor = 'blue';

  get styles() {
    return {
        '--item-space': this.itemSpace + 'px',
        '--list-padding': this.listPadding + 'px',
        '--line-color': this.lineColor,
    };
  }

  @state()
  showLine = false;

  @state()
  dragItemIndex!: number;

  @state()
  positons: IPositon[] = [];

  @query('.line')
  $line!: HTMLElement;

  render() {
    return html`
    <div class="list-wrap" style=${styleMap(this.styles)}>
        <slot></slot>
        <div class="line" ?show=${this.showLine}></div>
    </div>
    `;
  }

  private calcPositons() {
    /* eslint-disable-next-line */
    const slotElement: HTMLElement[] | undefined = this.shadowRoot!.querySelector('slot')?.assignedNodes()
    .filter(node => node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'UI-LIST-ITEM')
    .map(node => node as HTMLElement);

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
      lineTop: (listRect.top + (firstRect.top - listRect.top) / 2) - listRect.top,
      direction: 'top',
    });

    this.positons = positons;
  }

  private sortList(fromIndex:number, toIndex:number, insertBefore:boolean): any[] | undefined {
    const list = [...this.list];
    if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) {
      console.error(`cannot drag ${fromIndex} to ${toIndex}`, list);
      return undefined;
    }

    // 从数组中提取要移动的元素
    const movedElement = list.splice(fromIndex, 1)[0];


    let insertIndex = -1;
    // 后面的往前面插入
    if (fromIndex > toIndex) {
      if (insertBefore) {
        insertIndex = toIndex;
      } else {
        insertIndex = toIndex + 1;
      }
    } else {
      // 前面的往后面插入，由于前面的已经从数组挪走，所以后面的索引会 -1
      if (insertBefore) {
        insertIndex = toIndex - 1;
      } else {
        insertIndex = toIndex;
      }
    }

    // 将元素插入新位置
    list.splice(insertIndex, 0, movedElement);
    return list;
  }

  private itemDragstart(event: CustomEvent) {
    this.dragItemIndex = event.detail.index;
    this.calcPositons();  // 每次 dragstart 的时候，计算出所有 item 的位置，不用在 dragover 的时候计算
  }
  private itemDragend() {
    this.showLine = false;
    this.dragItemIndex = -1;
    this.$line.style.top = '-2px';
  }

  private drop(event: DragEvent) {
    event.preventDefault();
    const clientY = event.clientY;
    const targetItem = this.positons.find(item => item.start <= clientY && item.end >= clientY);
    if (targetItem) {
      const newList = this.sortList(this.dragItemIndex, targetItem.index, targetItem.direction === 'top');
      if (newList) {
        this.dispatchEvent(new CustomEvent('change', {
          bubbles: true,
          detail: {
            list: newList,
          },
        }));
      }
    } else {
      console.error('drop 没有找到目标位置');
    }
  }

  private dragover(event: DragEvent) {
    event.preventDefault();
    const clientY = event.clientY;
    const targetItem = this.positons.find(item => item.start <= clientY && item.end >= clientY);
    if (targetItem) {
      this.showLine = true;
      this.$line.style.top = targetItem.lineTop + 'px';
    } else {
      this.showLine = false;
    }
  }

  // 关于 item 的部分样式需要被 list 管理，因为 list 会根据 itemSpace 属性来调整 line 的高度
  // TODO: 应该可以把 .list-wrap 这层包裹去掉，当前只是为了可以设置 css 变量
  static styles = css`
    :host {}
    .list-wrap {
      position: relative;
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
    .line[show] {
        display: block;
        transition: top 0.25s ease-in;
    }

    ::slotted(ui-list-item) {
      margin-bottom: var(--item-space);
    }
    ::slotted(ui-list-item:last-child) {
      margin-bottom: 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-list': SortList
  }
}
