export interface TcDeviceRes {
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

export interface TcRecordRes {
  currentA: number
  currentB: number
  currentC: number
  collectTime: string
}