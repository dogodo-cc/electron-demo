import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

const name = 'ui-list-item';
@customElement(name)
export class ListItem extends LitElement {
    constructor() {
        super();
        this.addEventListener('dragstart', this.itemDragstart, false);
        this.addEventListener('dragend', this.itemDragend, false);
    }

    @property({
        type: Boolean,
        attribute: 'show-prefix',
        reflect: true,
    })
    showPrefix = false;

    @property({
        type: Boolean,
        attribute: 'show-suffix',
        reflect: true,
    })
    showSuffix = false;

    render() {
        return html`
            ${this.showPrefix
                ? html`<div class="prefix">
                      <slot name="prefix"><div class="streak" title="Drag to sort"></div></slot>
                  </div>`
                : ''}
            <div class="content"><slot></slot></div>
            ${this.showSuffix
                ? html`<div class="suffix">
                      <slot name="suffix"><button @click="${this.itemDelete}" class="delete-icon" color="" value="del"></button></slot>
                  </div>`
                : ''}
        `;
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

    private itemDelete(event: Event) {
        let index: null | string | number = this.getAttribute('index');
        if (index === null) {
            console.warn('index is null, please set index attribute');
            return;
        } else {
            index = parseInt(index);
        }
        this.dispatchEvent(
            new CustomEvent('item-delete', {
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

    static styles = css`
        :host {
            display: flex;
        }
        :host([draggable]) {
            cursor: grabbing;
        }
        .prefix {
            position: relative;
            padding-right: 10px;
        }
        .prefix .streak {
            width: 6px;
            height: 100%;
            cursor: move;
            background: linear-gradient(
                45deg,
                var(--color-default-border-weaker, #eee) 25%,
                var(--color-normal-fill, #ccc) 0,
                var(--color-normal-fill, #ccc) 50%,
                var(--color-default-border-weaker, #eee) 0,
                var(--color-default-border-weaker, #eee) 75%,
                var(--color-normal-fill, #ccc) 0
            );
            background-size: 6px 6px;
        }
        .content {
            flex: 1;
        }
        .suffix {
            position: relative;
            min-width: 16px;
            margin-left: 10px;
        }
        .suffix .delete-icon {
            cursor: pointer;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        [name]: ListItem;
    }
}
