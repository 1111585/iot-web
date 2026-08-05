<template>
  <ElConfigProvider size="default" :z-index="3000" :locale="state.local">
    <ThemeProvider :theme-name="state.themeName" global>
      <div id="main">
        <router-view />
      </div>
    </ThemeProvider>
  </ElConfigProvider>
</template>

<script lang="ts" setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import ThemeProvider from '@/components/theme/themeProvider.vue'
import { handleEventRing } from '@/views/eventCenter/utils/event'
import { listenErrorLogs } from '@/views/systemManage/utils/actions'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash-es'

const isDev = import.meta.env.MODE === 'dev'

const router = useRouter()
const state = reactive({
  themeName: import.meta.env.VITE_APP_THEME_NAME ?? 'default',
  local: zhCn
})

const alertCheckTimer = ref<number | null>(null)
const stopErrorLogsListener = ref<Function | null>(null)

const isInWhitelist = () => {
  const currentPath = router.currentRoute.value.path
  return ['/eventCenter', '/login'].some((route) => currentPath.indexOf(route) !== -1)
}

function checkGlobalAlert() {
  if (isInWhitelist()) {
    return
  }
  handleEventRing()
}

// 使用防抖处理路由变化时的检查，避免短时间内多次触发
const debouncedCheckAlert = debounce(checkGlobalAlert, 300)

onMounted(() => {
  alertCheckTimer.value = window.setInterval(checkGlobalAlert, 3000)
  router.afterEach(debouncedCheckAlert)
  stopErrorLogsListener.value = listenErrorLogs()
})

onUnmounted(() => {
  if (alertCheckTimer.value !== null) {
    clearInterval(alertCheckTimer.value)
    alertCheckTimer.value = null
  }
  debouncedCheckAlert.cancel()
  if (stopErrorLogsListener.value) {
    stopErrorLogsListener.value()
  }
})
</script>
