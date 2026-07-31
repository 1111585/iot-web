import { defineStore } from 'pinia'

export default defineStore('audio', () => {
  // 音频提醒是否启用（true 表示启用，false 表示禁用）
  const isBellEnabled = ref(true)

  // 从 localStorage 恢复状态
  const initBellState = () => {
    const saved = localStorage.getItem('isBellEnabled')
    if (saved !== null) {
      isBellEnabled.value = saved === 'true'
    }
  }

  // 切换音频提醒状态
  const toggleBell = () => {
    isBellEnabled.value = !isBellEnabled.value
    localStorage.setItem('isBellEnabled', isBellEnabled.value.toString())
  }

  // 设置音频提醒状态
  const setBellEnabled = (enabled: boolean) => {
    isBellEnabled.value = enabled
    localStorage.setItem('isBellEnabled', enabled.toString())
  }

  return {
    isBellEnabled,
    initBellState,
    toggleBell,
    setBellEnabled
  }
})
