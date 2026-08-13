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
  currentO: number
  alarmAMax: number | null
  alarmBMax: number | null
  alarmCMax: number | null
  alarmOMax: number | null
  currentRange: number
  alarmCooldown: number
  currentFps: number
  warnCounts?: number
  createTime: string | null
}

export interface CtRecordRes {
  currentA: number
  currentB: number
  currentC: number
  currentO: number
  maxCurrentA?: number
  maxCurrentB?: number
  maxCurrentC?: number
  maxCurrentO?: number
  collectTime: string
}