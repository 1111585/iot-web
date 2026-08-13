import { reactive, ref } from 'vue'
import { fetchCounts, fetchList } from './fetch'
import { playAlertSound } from './event'
import { EventType } from './consts'
import type { EventData, EventRes } from '../types'

/**
 * 全局告警弹窗状态
 * <p>
 * 将预警中心的告警弹窗机制提升为全局：App.vue 挂载 EventDetailDialog，
 * 任何非 eventCenter/login 页面（弧温、CT 等）常驻时，检测到新告警即弹窗。
 * 与 eventCenter 页内弹窗通过 localStorage 同一 key 互斥（App.vue 白名单跳过 eventCenter）。
 */

const STORE_KEY = 'eventCenter_undisposedNum'

/** 全局弹窗状态 */
export const globalAlarmDialog = reactive({
  visible: false,
  data: {} as EventData
})

/** 全局告警列表（供弹窗内上一条/下一条导航） */
export const globalEventList = ref<EventData[]>([])

// 错误计数与暂停状态
let errorCount = 0
let isPaused = false
const MAX_ERROR_COUNT = 5

export function resetGlobalAlarmErrorCount() {
  errorCount = 0
  isPaused = false
}

function showGlobalAlarm(item: EventData) {
  globalAlarmDialog.data = item
  globalAlarmDialog.visible = true
}

function fetchGlobalList(): Promise<void> {
  return fetchList<EventRes>('eventCenter').then((res) => {
    if (!res) return
    globalEventList.value = res.list.map((item) => ({
      id: item.warningId,
      type: EventType[item.levelType],
      typeRaw: item.levelType,
      detectDevice: item.monitoringDevice,
      senseDevice: item.sensingDevice,
      senseDeviceId: item.sensingDeviceId,
      date: item.warningTime,
      dateContinute: item.warningTimeDetail,
      areaPoint: item.owningPoint,
      disposeType: item.disposeType,
      handleStatus: item.handleStatus,
      image: item.picturePath,
      tag: 'normal',
      deployControlId: item.deployControlId,
      isSelected: false
    }))
  })
}

/** 弹窗内上一条/下一条（循环导航） */
export function handleGlobalStateChange(event: { action: 'prev' | 'next' }) {
  const { action } = event
  const currentId = globalAlarmDialog.data.id
  const currentIndex = globalEventList.value.findIndex((item) => item.id === currentId)

  if (currentIndex === -1) return

  let targetIndex: number
  if (action === 'prev') {
    targetIndex = currentIndex === 0 ? globalEventList.value.length - 1 : currentIndex - 1
  } else {
    targetIndex = currentIndex === globalEventList.value.length - 1 ? 0 : currentIndex + 1
  }
  showGlobalAlarm(globalEventList.value[targetIndex])
}

/**
 * 全局告警检查：检测新未处理告警，有则播放声音并弹窗
 * @param data 已获取的计数数据（不传则内部先请求计数）
 */
export function checkGlobalAlarm(data?: any) {
  // 未传数据时，先获取计数
  if (!data) {
    if (isPaused) {
      console.log('[全局告警]已暂停检查，错误次数达到上限')
      return
    }
    fetchCounts('eventCenter')
      .then((fetchedData: any) => {
        errorCount = 0
        isPaused = false
        checkGlobalAlarm(fetchedData)
      })
      .catch((error: any) => {
        const is50xError = error?.response?.status >= 500 && error?.response?.status < 600
        if (is50xError) {
          errorCount++
          console.log(`[全局告警]服务器错误，错误次数: ${errorCount}/${MAX_ERROR_COUNT}`)
          if (errorCount >= MAX_ERROR_COUNT) {
            isPaused = true
            console.log('[全局告警]错误次数达到上限，暂停检查')
          }
        }
      })
    return
  }

  const lastUndisposedNum = localStorage.getItem(STORE_KEY) || '0'
  const currentUndisposedNum = data.undisposedNum.toString()

  // 无论是否有新事件，都更新计数
  localStorage.setItem(STORE_KEY, currentUndisposedNum)

  if (parseInt(currentUndisposedNum) > parseInt(lastUndisposedNum)) {
    console.log('[全局告警]检测到新的未处理事件，播放提示音并弹窗')
    playAlertSound()
    fetchGlobalList().then(() => {
      const theLatestItem = globalEventList.value[0]
      if (theLatestItem) {
        showGlobalAlarm(theLatestItem)
      }
    })
  }
}
