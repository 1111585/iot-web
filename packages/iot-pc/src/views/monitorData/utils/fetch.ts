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

export async function fetchCtRecords(
  deviceId: string,
  days: number = 7,
  maxPoints: number = 0,
  intervalType?: string,
  startDate?: string,
  endDate?: string
) {
  try {
    // 注意：params 里的值不能是 undefined/空串。
    // 签名按 params 原文拼接（key=value），而 axios 会丢弃值为 undefined 的键，
    // 后端 TokenFilter 用 request.getParameterNames() 重建参数验签，
    // 两端待签名串不一致就会报「签名验证失败」，所以这里只放有值的参数。
    const params: Record<string, string | number> = { deviceId, days, maxPoints }
    if (intervalType) params.intervalType = intervalType
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    const { data } = await request.get<any, CtRecordRes[]>(chartApi.getCtDeviceRecords, params)
    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function exportCtRecords(params: {
  deviceId: string
  intervalType: string
  days?: number
  maxPoints?: number
  startDate?: string
  endDate?: string
}) {
  // 同上：只放有值的参数，避免空串/undefined 参与签名
  const query: Record<string, string | number> = {
    deviceId: params.deviceId,
    intervalType: params.intervalType
  }
  if (params.days) query.days = params.days
  if (params.maxPoints) query.maxPoints = params.maxPoints
  if (params.startDate) query.startDate = params.startDate
  if (params.endDate) query.endDate = params.endDate
  return request.downloadStream(chartApi.getCtDeviceRecordsExport, undefined, query, 'GET')
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

/** 导出实时高频原始采样（内存环形缓冲，最近 60s） */
export async function exportCtSamples(deviceId: string) {
  return request.downloadStream(chartApi.getCtDeviceSamplesExport, undefined, { deviceId }, 'GET')
}

export async function updateCtConfig(payload: { deviceId: string; alarmAMax?: number; alarmBMax?: number; alarmCMax?: number; alarmOMax?: number; currentRange?: number; alarmCooldown?: number; enabled?: number }) {
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