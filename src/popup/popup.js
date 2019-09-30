import Vue from 'vue'
import App from './App'
import { ListGroupPlugin } from 'bootstrap-vue';
Vue.use(ListGroupPlugin);
import { BadgePlugin } from 'bootstrap-vue'
Vue.use(BadgePlugin)
    /* eslint-disable no-new */
new Vue({
    el: '#app',
    render: h => h(App)
})
