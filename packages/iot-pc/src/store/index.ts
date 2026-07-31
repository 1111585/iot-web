import { createPinia } from 'pinia'
import persistedstate from 'pinia-plugin-persistedstate'
import userStore from './user'
import sysStore from './sys'
import openStore from './open'
import { usePermStore } from './auth'
import { type App } from 'vue'
const install = (app: App<Element>) => {
  // app.use(createPinia().use(persistedstate))
  const pinia = createPinia()
  pinia.use(persistedstate)
  app.use(pinia)
}
export { install as default, sysStore, userStore, openStore, usePermStore }
