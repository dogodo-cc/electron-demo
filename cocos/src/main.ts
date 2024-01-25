import Vue from 'vue'
import './style.css'
import App from './App.vue'
import init from './web-components/index.ts'


Vue.config.ignoredElements = [/^ui-/, /^v2-/];

(async function() {
    await init();
    new Vue(App).$mount('#app')
})()
