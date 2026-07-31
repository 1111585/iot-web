import { createPinia } from 'pinia'
import { createApp } from 'vue'
// import "@/util/rem";

// import "@/style/index.scss"
import 'virtual:svg-icons-register'
import App from './reace.vue'

const app = createApp(App)

app.use(createPinia())
app.mount('#app')
