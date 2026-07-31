import { DrawShape } from '@/components/drawing/types'

interface DeviceOnline {
  online: '0' | '1'
  num: string
}

interface DeviceRealTimeInfo {
  deviceId: string
  deviceName: string
  zt: 0 | 1
  sensingDeviceRealTimeVoList: {
    deviceName: string
    deviceId: string
    detZonesId: string
    maxTemp: string
    tempLevel: number // 温度等级, 0/1/2
    oneTemp?: number | string
    twoTemp?: number | string
    drawCfg: string | DrawShape
  }[]
}

/**
 * 无分页
 */
export interface DevicesRes {
  // 设备在线、离线的数量
  deviceOnline: DeviceOnline[]
  // 设备列表
  deviceRealTimeInfo: DeviceRealTimeInfo[]
}

/**
 * 设备的预警数量
 */
export interface DevicesWarningCountsRes {
  deviceId: string
  num: number
  levelType: 1 | 2 | 3 // 为 1 是表示为有闪络
}

/**
 * 设备列表 - 在页面渲染的时候需要的数据类型
 */
export interface DevicesRender {
  id: number
  name: string
  online: boolean
  power: boolean
  zones: {
    id: string | number
    name: string
    maxTemp: number
    color?: string
    area?: number
    rank?: number
    oneTemp?: number
    twoTemp?: number
  }[]
  warnCounts: number
  color?: string
  type?: 'camera' | 'sensor'
  hasArcFlash?: boolean
  isLegacy?: boolean
}

export interface WarningStatisticsRes {
  date: string
  arcFlashEventTotal: number
  arcFlashEventProcessed: number
  arcFlashEventUnprocessed: number
  overtempLevel1Total: number
  overtempLevel1Processed: number
  overtempLevel1Unprocessed: number
  overtempLevel2Total: number
  overtempLevel2Processed: number
  overtempLevel2Unprocessed: number
}
