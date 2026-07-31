export interface VideoRes {
  videoId: string
  sensingDeviceId: string //感知设备id
  sensingDeviceName: string //感知设备名称
  deviceType: number //视频类型：1可见光、2红外
  monitoredEquipment: string
  location: string
  aiBoxName: string //预警设备名称
  aiBoxId: string //预警设备ID
  videoName: string //视频名称
  recordTime: string //视频录制时间
  duration: number //时长 S
  size: string //大小（单位：字节）
  videoUrl: string //视频详情
  createTime: string
  createUser: string
  createId: string
  updateUser: string
  updateTime: string
  updateId: string
}