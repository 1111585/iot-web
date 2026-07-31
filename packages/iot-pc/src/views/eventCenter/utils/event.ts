import { fetchCounts } from './fetch'
import audioStore from '@/store/audio'

const isDev = import.meta.env.DEV

// 全局错误计数器和状态标志
let errorCount = 0
let isPaused = false
const MAX_ERROR_COUNT = 1

// 重置错误计数器的方法，在任何成功的请求后调用
export function resetEventRingErrorCount() {
  errorCount = 0
  isPaused = false
}
export interface EventRingOptions {
  // 是否批量操作模式
  isBatch?: boolean
  // 处理数据的回调函数
  handleCount?: (data: any) => void
  // 处理列表的回调函数，返回Promise
  handleList?: () => Promise<void>
  // 显示详情的回调函数
  showDetail?: (item: any) => void
  // 按钮加载状态的设置函数
  setBtnLoading?: (loading: boolean) => void
  // 声音文件路径
  soundPath?: string
}

/**
 * 处理预警铃声提示
 * @param data 预警数据
 * @param options 配置选项
 * @returns
 */
export function handleEventRing(data?: any, options?: EventRingOptions) {
  const {
    isBatch = false,
    handleCount,
    handleList,
    showDetail,
    setBtnLoading,
    soundPath = '/sounds/event-ring.mp3'
  } = options || {}

  if (isDev) return

  // 批量操作模式下不响应刷新
  if (isBatch) {
    console.log('[预警中心]批量操作模式下，不响应刷新')
    return
  }

  const STORE_KEY = 'eventCenter_undisposedNum'

  // 如果没有传入数据，则获取数据
  if (!data) {
    // 如果已暂停（错误次数达到上限），则不执行
    if (isPaused) {
      console.log(`[预警中心]已暂停预警检查，当前错误次数: ${errorCount}/${MAX_ERROR_COUNT}`)
      if (setBtnLoading) setBtnLoading(false)
      return
    }

    if (setBtnLoading) setBtnLoading(true)

    fetchCounts('eventCenter')
      .then((fetchedData: any) => {
        // 成功后重置错误计数
        errorCount = 0
        isPaused = false
        handleEventRing(fetchedData, options)
        if (setBtnLoading) setBtnLoading(false)
      })
      .catch((error) => {
        const is50xError = error?.response?.status >= 500 && error?.response?.status < 600

        if (is50xError) {
          errorCount++
          console.log(`[预警中心]服务器错误，当前错误次数: ${errorCount}/${MAX_ERROR_COUNT}`)

          // 如果错误次数达到上限，暂停执行
          if (errorCount >= MAX_ERROR_COUNT) {
            isPaused = true
            console.log('[预警中心]错误次数达到上限，暂停预警检查')
          }
        }

        if (setBtnLoading) setBtnLoading(false)
      })
    return
  }

  if (!data) {
    if (setBtnLoading) setBtnLoading(false)
    return
  }

  const lastUndisposedNum = localStorage.getItem(STORE_KEY) || '0'
  const currentUndisposedNum = data.undisposedNum.toString()

  // 更新localStorage中的值，无论是否有新事件
  localStorage.setItem(STORE_KEY, currentUndisposedNum)

  if (parseInt(currentUndisposedNum) > parseInt(lastUndisposedNum)) {
    console.log('[预警中心]检测到新的未处理事件，播放提示音')
    playAlertSound(soundPath)

    // 如果提供了处理数据的回调，则调用
    if (handleCount) handleCount(data)

    // 如果提供了处理列表的回调，则调用
    if (handleList) {
      handleList()
        .then(() => {
          // 如果提供了显示详情的回调，则调用
          if (showDetail) {
            // 这里假设列表的第一项是最新的预警
            const theLatestItem = window['eventList']?.[0]
            if (theLatestItem) {
              showDetail(theLatestItem)
            }
          }
        })
        .finally(() => {
          if (setBtnLoading) setBtnLoading(false)
        })
    } else if (setBtnLoading) {
      setBtnLoading(false)
    }
  } else if (setBtnLoading) {
    setBtnLoading(false)
  }
}

/**
 * 播放预警提示音
 * @param soundPath 声音文件路径
 */
export function playAlertSound(soundPath: string = '/sounds/event-ring.mp3') {
  const { isBellEnabled } = audioStore()

  if (!isBellEnabled) {
    console.log('[预警中心]音频提醒已禁用，不播放提示音')
    return
  }

  const audio = new Audio(soundPath)
  audio.play().catch((err) => {
    console.error('[预警中心]播放提示音失败:', err)
  })
}
