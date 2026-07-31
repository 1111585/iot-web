export interface DeviceRes {
  id: string
  deviceName: string //设备名称
  deviceId: string //设备id
  dataInfo: string //数据信息
  createTime: string //创建时间
  updateTime: string //更新时间
  state: number //状态:1开 2关
}
