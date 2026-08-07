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
}

export interface TcRecordRes {
  currentA: number
  currentB: number
  currentC: number
  collectTime: string
}
