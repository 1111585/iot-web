import { request } from '@/util/request'
import { chartApi } from '@/apis/chart'
import type { TcDeviceRes, TcRecordRes } from '../types'

const onError = (error: any) => console.log('[获取TC数据]', error?.message)

export const iotCollQuery = reactive({
  pageSize: 20,
  pageNum: 1,
  keyword: ''
})

export const iotCollList = ref<TcDeviceRes[]>([])
export const iotCollTotal = ref(0)

export async function fetchTcDeviceList() {
  try {
    const { data } = await request.get<any, TcDeviceRes[]>(chartApi.getTcDeviceList)
    if (data) {
      iotCollList.value = data
      iotCollTotal.value = data.length
    }
    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function fetchTcRecords(deviceId: string, days: number = 7) {
  try {
    const { data } = await request.get<any, TcRecordRes[]>(chartApi.getTcDeviceRecords, {
      deviceId,
      days
    })
    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function updateTcConfig(payload: { deviceId: string; alarmAMax?: number; alarmBMax?: number; alarmCMax?: number; currentRange?: number }) {
  try {
    const base = (import.meta as any).env.VITE_APP_BASEURL || ''
    const res = await fetch(base + '/tc/device/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('请求失败: ' + res.status)
    return true
  } catch (error) { onError(error); return false }
}