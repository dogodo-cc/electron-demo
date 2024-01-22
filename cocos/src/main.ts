import Vue from 'vue'
import './style.css'
import App from './App.vue'
import('./web-components/index.ts')

Vue.config.ignoredElements = [/^ui-/]

new Vue(App).$mount('#app')
