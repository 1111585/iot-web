import { request } from '@/util/request'
import { dashboardApi } from '@/apis/dashboard'

import type { DevicesRes, WarningStatisticsRes, DevicesWarningCountsRes } from '../types'

export async function fetchDevices() {
  try {
    const { data } = await request.get<any, DevicesRes>(dashboardApi.devices, {
      pageNum: 1,
      pageSize: 199
    })
    if (!data) throw new Error('获取设备数据失败')

    return { raw: data }
  } catch (error) {
    console.log(error)
  }
}

// 获取所有设备上的告警数量
export async function fetchDevicesWarningCounts() {
  try {
    const { data } = await request.get<any, DevicesWarningCountsRes[]>(dashboardApi.devicesWarning)
    if (!data) throw new Error('获取设备数据失败')

    return { raw: data }
  } catch (error) {
    console.log(error)
  }
}

export async function fetchWarningStatistics() {
  try {
    const { data } = await request.get<any, WarningStatisticsRes[]>(dashboardApi.warningStatistics)
    if (!data) throw new Error('获取设备数据失败')

    return { raw: data }
  } catch (error) {
    console.log(error)
  }
}

export async function fetchPrimaryIdByDeviceId(deviceId: number) {
  try {
    const { data } = await request.get<any, string>(dashboardApi.primaryId, { deviceId })
    if (!data) throw new Error('获取设备数据失败')

    return data
  } catch (error) {
    console.log(error)
  }
}

// 生成模拟数据，结构与 DevicesRes 一致，可直接用于 devices.vue 的赋值
export function _generateMockDevices(count = 20): DevicesRes {
  const deviceRealTimeInfo = Array.from({ length: count }).map((_, index) => {
    const deviceId = `mock-${index + 1}`
    const sensingDeviceRealTimeVoList = Array.from({ length: 4 }).map((__, zIndex) => ({
      deviceName: zIndex === 0 ? '全局' : `区域${zIndex}`,
      deviceId: `${deviceId}-zone-${zIndex + 1}`,
      detZonesId: `${1000 + index * 10 + zIndex}`,
      maxTemp: (20 + Math.random() * 15).toFixed(1)
    }))

    return {
      deviceId,
      // 使用 #号+编号 的命名，便于测试数字排序（如 #40风机）
      deviceName: `#${40 + index}风机`,
      zt: (Math.random() > 0.2 ? 1 : 0) as 1 | 0,
      sensingDeviceRealTimeVoList,
      warnCounts: Math.floor(Math.random() * 6) // 0-5条预警，用于显示角标
    }
  })

  const onlineNum = deviceRealTimeInfo.filter((item) => item.zt === 1).length
  const offlineNum = deviceRealTimeInfo.length - onlineNum

  return {
    deviceOnline: [
      { online: '1', num: `${onlineNum}` },
      { online: '0', num: `${offlineNum}` }
    ],
    // @ts-ignore
    deviceRealTimeInfo
  }
}

// 生成按日期排序的数据（今天、昨天、前天等）
export function _generateMockTableData() {
  const data: any[] = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })

    let label = ''
    if (i === 0) label = '今天'
    else if (i === 1) label = '昨天'
    else if (i === 2) label = '前天'
    else label = dateStr

    data.push({
      date: label,
      arcFlashCount: Math.floor(Math.random() * 30),
      arcFlashResolvedCount: Math.floor(Math.random() * 25),
      arcFlashUnresolvedCount: Math.floor(Math.random() * 10),
      overTemperatureCount: Math.floor(Math.random() * 15),
      overTemperatureResolvedCount: Math.floor(Math.random() * 12),
      overTemperatureUnresolvedCount: Math.floor(Math.random() * 8),
      overTemperatureLevel2Count: Math.floor(Math.random() * 10),
      overTemperatureLevel2ResolvedCount: Math.floor(Math.random() * 8),
      overTemperatureLevel2UnresolvedCount: Math.floor(Math.random() * 5)
    })
  }

  return data
}
