import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 1. 引入 Element Plus 和 样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 2. 引入 路由 (稍后创建)
import router from './router'

const app = createApp(App)

app.use(ElementPlus) // 使用 UI 库
app.use(router)      // 使用 路由
app.mount('#app')