import { PERM_KEY } from '@/store/auth'

export const useWindowUnload = () => {
  const handler = (e: BeforeUnloadEvent) => {
    localStorage.removeItem('tokenInfo')
    localStorage.removeItem('user')
    localStorage.removeItem(PERM_KEY)
  }

  window.addEventListener('beforeunload', handler)
  window.addEventListener('unload', handler)

  return () => {
    window.removeEventListener('beforeunload', handler)
    window.removeEventListener('unload', handler)
  }
}

/**
 * 以此标识为用户是否登录，登录接口成功后存值，浏览器关闭时自动清空
 *
 * 为什么不用localStorage中的tokenInfo来判断？
 *   - 想要达到关闭浏览器时就当做退出登录的效果，
 *   - AuthUtil（localStorage）的逻辑在多处有用到，所以token相关操作逻辑不变更
 */
export const useLoginState = () => {
  const KEY = '_login_state_'
  const get = () => {
    return sessionStorage.getItem(KEY)
  }

  const set = (value = '1') => {
    sessionStorage.setItem(KEY, value)
  }

  const remove = () => {
    sessionStorage.removeItem(KEY)
  }

  return {
    get,
    set,
    remove
  }
}

/**
 * 通用轮询 hooks，用于监听事件变化
 * @param callback 轮询执行的回调函数
 * @param interval 轮询间隔（毫秒），默认为30000ms（30秒）
 * @param immediate 是否立即执行一次回调函数，默认为false
 */
export const usePolling = (
  callback: () => void,
  interval: number = 30000,
  immediate: boolean = false
) => {
  let pollingTimer: number | null = null

  // 开始轮询
  const startPolling = () => {
    // 如果已经在轮询中，则先停止
    if (pollingTimer) {
      stopPolling()
    }

    // 如果设置了立即执行，则先执行一次
    if (immediate) {
      callback()
    }

    // 启动轮询
    pollingTimer = window.setInterval(() => {
      callback()
    }, interval)
  }

  // 停止轮询
  const stopPolling = () => {
    if (pollingTimer) {
      window.clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  // 立即执行一次回调
  const executeOnce = () => {
    callback()
  }

  // 组件卸载时自动停止轮询
  const cleanup = () => {
    stopPolling()
  }

  return {
    startPolling,
    stopPolling,
    executeOnce,
    cleanup
  }
}
