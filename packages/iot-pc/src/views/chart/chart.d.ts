/**
 * 带 Res 的为接口返回数据
 */


export type ChartType = 'iot'

export interface DeviceStatus {
  type: string;
  count: number;
  color?: string;
  alias: string;
}

export interface DeviceData {
  id: string;
  name: string;
  count: number;
}

export interface AlertData {
  level: number;
  count: number;
  times: number;
  name: string;
}

export interface AlertStatistics {
  type: string;
  value: number;
  color: string;
}

export interface LiveAlertListRes {
    name: string;   // 告警点位
    alarmType: string;  // 类型
    deviceid: string;
    alarmSmoke: number;
    alarmTemperature: number;
    alarmFire: number;
    state: number;  // 1101 正常，其他不正常
    alarmTime: string;
}

export interface DeviceDataRes {
  type: string;
  num: number;
}