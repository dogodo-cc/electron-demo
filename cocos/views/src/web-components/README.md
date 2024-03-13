## web-component

### 属性
不要在 constructor 里设置属性， 需要在 connectedCallback 里设置


### 样式
默认是 inline 元素，需要设置 display: block 外面才可以设置样式
```css
:host {
    display: block; 
}

```