import { createApp } from 'vue';
import './style.css'
import App from './App.vue'
import router from './router/index.ts';

import Antd from 'ant-design-vue';

createApp(App).use(Antd).use(router).mount('#app')
