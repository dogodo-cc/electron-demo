import Vue from 'vue'
import './style.css'
import App from './App.vue'
import './web-components/list/index'
import './web-components/list-item/index'


Vue.config.ignoredElements = [/^ui-/];

(async function() {
    new Vue(App).$mount('#app')
})()
