import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export const name = 'v2-ui-list-item'

type IValue = {
    id: string,
    name: string
}

@customElement(name)
export class SortListItem extends LitElement {
    constructor() {
        super();
        this.addEventListener('dragstart', this.itemDragstart);
        this.addEventListener('dragend', this.itemDragend);
    }

    @property()
    value: IValue = {id: '', name: ''};

    connectedCallback(): void {
        super.connectedCallback();
        this.draggable = true;
    }

    render() {
        return html`<div>${this.value.name} <button @click="${this.itemClick}">click</button></div>`;
    }
    private itemDragstart(event: DragEvent) {
        let index: null | string | number = this.getAttribute('index');
        if (index === null) {
            console.warn('index is null, please set index attribute');
            return;
        } else {
            index = parseInt(index);
        }
        this.dispatchEvent(
            new CustomEvent('item-dragstart', {
                bubbles: true,
                composed: true,
                detail: {
                    event,
                    item: this,
                    index,
                },
            })
        );
    }

    private itemDragend(event: DragEvent) {
        this.dispatchEvent(
            new CustomEvent('item-dragend', {
                bubbles: true,
                composed: true,
                detail: {
                    event,
                    item: this,
                },
            })
        );
    }

    private itemClick(event: MouseEvent) {
        this.dispatchEvent(
            new CustomEvent('item-click', {
                bubbles: true,
                composed: true,
                detail: {
                    event,
                    item: this,
                    data: this.value
                },
            })
        );
    }

    static styles = css`
        :host {
            display: block;
        }
        :host([draggable]) {
            cursor: grabbing;
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'name': SortListItem;
    }
}
