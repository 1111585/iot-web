import { request } from '@/util/request'
import { chartApi } from '@/apis/chart'
import { AuthUtil } from '@infoview/util'
import { generateSignatureSm } from '@/util/crypto/tools'
import type { CtDeviceRes, CtRecordRes } from '../types'

const onError = (error: any) => console.log('[获取CT数据]', error?.message)

export const iotCollQuery = reactive({
  pageSize: 20,
  pageNum: 1,
  keyword: ''
})

export const iotCollList = ref<CtDeviceRes[]>([])
export const iotCollTotal = ref(0)

export async function fetchCtDeviceList() {
  try {
    const { data } = await request.get<any, CtDeviceRes[]>(chartApi.getCtDeviceList)
    if (data) {
      iotCollList.value = data
      iotCollTotal.value = data.length
    }
    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function fetchCtRecords(deviceId: string, days: number = 7, maxPoints: number = 0) {
  try {
    const { data } = await request.get<any, CtRecordRes[]>(chartApi.getCtDeviceRecords, {
      deviceId,
      days,
      maxPoints
    })
    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function fetchCtSamples(deviceId: string) {
  try {
    const { data } = await request.get<any, any[]>(chartApi.getCtDeviceSamples, {
      deviceId
    })
    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function updateCtConfig(payload: { deviceId: string; alarmAMax?: number; alarmBMax?: number; alarmCMax?: number; alarmOMax?: number; currentRange?: number; alarmCooldown?: number }) {
  try {
    const url = chartApi.updateCtConfig
    const body = JSON.stringify(payload)
    const { signature, timestamp, nonce } = generateSignatureSm({
      method: 'POST', url, body
    })
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'X-Nonce': nonce
    }
    const token = AuthUtil.getToken()
    if (token) headers['Authorization'] = token

    const base = (import.meta as any).env.VITE_APP_BASEURL || ''
    const res = await fetch(base + url, { method: 'POST', headers, body })
    if (!res.ok) throw new Error('请求失败: ' + res.status)
    return true
  } catch (error) { onError(error); return false }
}