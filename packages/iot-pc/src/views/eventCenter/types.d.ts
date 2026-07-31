import type { DrawShape } from '@/components/drawing/types'

/** 预警返回值(列表) */
export interface EventRes {
  warningId: number //主键
  levelType: number //预警类型 （1:电弧闪烁、2:超温事件一级、3:超温事件二级）多个、拼接
  monitoringDevice: string //监测设备名称
  monitoringDeviceId: string //监测设备ID
  sensingDevice: string //感知设备
  sensingDeviceId: string //感知设备ID
  warningContent: string //预警内容
  warningTime: string //预警开始时间
  warningTimeDetail: string //预警持续时间
  owningPoint: string //所属点位 （ 多个、拼接）
  owningPointId: string //所属点位ID
  aiBoxName: string //AI盒子名称
  aiBoxNameId: string //AI计算盒子ID
  deployControlTitle: string //布控标题
  deployControlId: string //布控ID
  disposeId: string //处置ID
  disposeType: number //处置状态（ 1:未处理、2:已确认、3:已忽略、4:已处理）多个、拼接
  handleStatus: number // 处置状态 1 新，2 已查看（界面上只需要显示新）
  pictureId: string //图片ID
  videoId: string //视频ID
  remark: string //备注
  createTime: string //创建时间
  createUser: string //创建人
  createId: string //创建人ID
  createPhone: string //创建人联系方式
  updateTime: string //更新时间
  updateUser: string //更新人
  updateId: string //更新人ID
  picturePath: string //图片路径
  videoUrl: string //视频路径
}

/** 事件卡片 */
export interface EventData {
  id: string | number
  type: string // 类型转成中文在页面渲染
  typeRaw: number // 原始值
  date: string // 预警时间
  dateContinute: string // 预警持续事件
  detectDevice: string
  senseDevice: string
  areaPoint: string
  handleStatus: string | number
  disposeType: number
  tag?: 'new' | 'normal'
  image: string
  senseDeviceId: string
  deployControlId: string // 布控ID
  isSelected: boolean
}

interface EventDetail {
  monitoringInformationList: any[]
  warningInformation: {
    warningId: number // 预警主键ID
    levelType: number // 预警类型 （1:电弧闪烁、2:超温事件一级、3:超温事件二级）多个、拼接
    monitoringDevice: string //检测（监测）设备名称
    monitoringDeviceId: string
    sensingDevice: string
    sensingDeviceId: string
    warningContent: string
    warningTime: string
    warningTimeDetail: string
    owningPoint: string //所属点位 （ 多个、拼接）
    owningPointId: string
    aiBoxName: string
    aiBoxId: string
    deployControlTitle: string
    deployControlId: string
    disposeType: number //处置状态（ 1:未处理、2:已确认、3:已忽略、4:已处理）多个、拼接
    pictureId: string
    videoId: string
    remark: string
    createTime: string
    createUser: string
    createId: string
    createPhone: string
    updateTime: string
    updateUser: string
    updateId: string
    picturePath: string //图片路径
    videoUrl: string //视频路径
  } //预警对象
  disposeInfoList: {
    disposeId: number //处置ID
    disposeType: number //处置状态（ 1:未处理、2:已确认、3:已忽略、4:已处理）多个、拼接
    remark: string //备注
    warningInformationId: string //预警主键ID
    pictureId: string //图片ID
    handlerTime: string //处理时间
    handlerUser: string //处理人
    handlerId: string //处理人ID
    handlerPhone: string //处理人联系方式
    updateTime: string //更新时间
    updateUser: string //更新人
    updateId: string //更新人ID
    equipmentName: string
    equipmentId: string
    oneAlarmTemperature: string
    twoAlarmTemperature: string
    addUser: string
  }[]
}

/** 抽离出多出共用的预警详情 */
export interface ShareEventDetail {
  aiBoxId: string
  sensorDeviceId: string
  monitorDeviceId: string
  // 渲染需要
  eventType: string
  status: string
  location: string
  duration: string
  aiBox: string
  monitorDevice: string
  sensorDevice: string
  videoUrl: string
  pictureUrl: string
}

export interface StreamConfigRes {
  account: string
  address: string // 视频流地址
  description: string
  flag: string
  flagId: string
  id: number
  newIp: string
  name: string // 设备名称
  type: number // 设备类型
  domId: string // 播放器的唯一标识
}

/** 处理流程时间线 */
export interface TimelineActivity {
  timestamp: string
  title: string
  content: string
  user: string
  type: 'primary' | 'success' | 'warning' | 'info' | 'danger'
  size: 'normal' | 'large'
  image?: string
  equipmentName: string
  equipmentId: string
  oneAlarmTemperature: string
  twoAlarmTemperature: string
  addUser: string
}

export type ActivitiesColumn = Pick<
  TimelineActivity,
  'equipmentName' | 'equipmentId' | 'oneAlarmTemperature' | 'twoAlarmTemperature' | 'addUser'
>
