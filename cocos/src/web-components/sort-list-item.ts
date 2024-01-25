import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

const name = 'ui-sort-list-item';
@customElement(name)
export class SortListItem extends LitElement {
    constructor() {
        super();
        this.addEventListener('dragstart', this.itemDragstart, false);
        this.addEventListener('dragend', this.itemDragend, false);
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.draggable = true;
    }

    render() {
        return html`<slot></slot>`;
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
        [name]: SortListItem;
    }
}
