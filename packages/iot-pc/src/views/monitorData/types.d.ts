export interface CtDeviceRes {
  id: string
  deviceName: string
  ip: string
  port: number
  onlineState: number
  lastCollectTime: string
  currentA: number
  currentB: number
  currentC: number
  alarmAMax: number | null
  alarmBMax: number | null
  alarmCMax: number | null
  currentRange: number
  createTime: string | null
}

export interface CtRecordRes {
  currentA: number
  currentB: number
  currentC: number
  maxCurrentA?: number
  maxCurrentB?: number
  maxCurrentC?: number
  collectTime: string
}