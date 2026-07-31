import type { AiBoxRes, DetectDeviceRes, SenseDeviceRes } from '@/views/deviceManage/types'
import type { DrawShape } from '@/components/drawing/types'
import type { StreamConfigRes } from '@/views/eventCenter/types'

interface PointManagement {
  pointId: string //点位主键ID
  pointName: string //点位名称
  description: string //点位详情
}

export interface MonitorOptionsRes {
  /** 点位列表 */
  pointManagementList: PointManagement[]
  /** 被监测设备列表 */
  monitoringEquipmentList: DetectDeviceRes[]
  /** 见光感知设备列表 */
  sensingDeviceList: SenseDeviceRes[]
  aiBoxList: AiBoxRes[]
}

export interface AlertItem {
  title: string
  device: string
  time: string
  descrition: string
  status: number | string
  [key: string]: any
}

export interface TabData {
  id?: number // 添加id字段，用于保持一致性
  title: string
  name: string
  type: 'monitor' | 'shield' // 监控区，屏蔽区
  color?: string // 线条颜色
  rectCoords?: ARC.RectCoords[] // 所有定位
  formData: ARC.AnyObj
  shapes: DrawShape
  monitoringInformationId?: number // 监测区域信息主键
  senseDevices?: StreamConfigRes
  stageSize: { width: number; height: number }
}

export interface DeviceData {
  id: number
  detectDevice: string
  detectType: string
  areaPoint: string
  /** 红外 */
  infrared: string
  infraredId: string
  infraredStatus: string | number
  light: string
  lightId: string
  lightStatus: string | number
  image: string
  senseDeviceId: string
  senseDeviceName: string
  aiBoxId: string
  aiBoxName: string
  isMonitoring: number | '' // 0 未布控 1 已布控
  domId: string
}

type MTypes =
  | 'fullscreen'
  | 'clear'
  | 'exportAsImage'
  | 'getImage'
  | 'clearCurrent'
  | 'checkAreaName'
export interface MonitorAction {
  type: MTypes
  payload?: ARC.AnyObj
}

export interface ContrastArea {
  sourceArea: string | number
  targetArea: string | number
  value: string
}
