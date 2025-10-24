import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/main.scss' // 导入全局样式和颜色变量
import './assets/element.scss' // Element Plus 覆盖样式，使用项目变量
import App from './App.vue'
import router from './router/index.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')


