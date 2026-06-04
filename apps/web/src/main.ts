import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'flag-icons/css/flag-icons.min.css'

import App from './App.vue'
import router from './router'
import i18n from './locales'
import './styles/index.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 注册全局插件
app.use(createPinia()) // 状态管理
app.use(router) // 路由
app.use(i18n) // 国际化
app.use(ElementPlus) // UI 组件库

app.mount('#app')
