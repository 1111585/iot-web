import { createApp } from 'vue'

import appView from '@/App.vue'
import '@/styles/index.scss'
import '@/styles/reset.css'
import 'uno.css'
import 'virtual:svg-icons-register'
import base from '@/components/base'
import router from '@/router'
import store from '@/store'
import auth from '@/directives/auth'

// import VueKonva from 'vue-konva'

// import VNetworkGraph from 'v-network-graph'
// import 'v-network-graph/lib/style.css'

import 'element-plus/dist/index.css'

const app = createApp(appView)
// app.use(router).use(store).use(base).use(VueKonva).use(VNetworkGraph)
app.use(router).use(store).use(base)

import('v-network-graph').then((module) => {
  app.use(module.default)
})
import('v-network-graph/lib/style.css')

import('vue-konva').then((module) => {
  app.use(module.default)
})

app.directive('auth', auth)

app.config.performance = true

app.mount('#app')
