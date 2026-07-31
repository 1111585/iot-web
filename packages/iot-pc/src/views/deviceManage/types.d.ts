import { StreamConfigRes } from '../eventCenter/types'

/**
 * Res结尾的是接口返回的数据
 */

export interface DetectDeviceRes {
  monitoringEquipmentId: number //监测设备主键ID
  equipmentName: string //设备名称
  equipmentId: string //设备ID
  equipmentCoding: string //设备编码
  sensingDeviceName: string //感知设备名称
  sensingDeviceId: string //感知设备ID
  bindingPosition: string //绑定位置
  bindingPositionId: string //绑定位置ID
  deviceType: string //设备类型
  deviceTypeId: string //设备类型ID
  equipmentPicture: string //设备图片ID
  monitoringContent: string //监测内容：(1电弧闪烁、2超温)
  description: string //描述
  departmentId: string //部门ID
  departmentName: string //部门名称
  addTime: string //添加人ID
  addUser: string //添加人
  addId: string //添加时间
  addPhone: string //添加人联系方式
  updateTime: string //更新时间
  updateUser: string //更新人
  updateId: string //更新人ID
  existWarning: number //当前是否存在告警（0否、1是）
  enable: number //是否启用（0禁用、1启用）
  monitoringType: number //监测类型（0未监测、1已监测）
}
export interface BindingLocation {
  buildingId: number //绑定位置楼宇ID
  buildingName: string //绑定位置名称
  entId: string //企业ID
  createTime: string //创建时间
  createUser: string //创建人
  createId: string //创建人ID
  updateTime: string //更新时间
  updateUser: string //更新人
  updateId: string //更新人ID
}

export interface BindingLocationAll {
  pointId: number //监测点ID
  pointName: string //监测点名称
  description: string //描述 如 园区B-办公楼B栋-办公室C
}

export interface VideoStreamRes {
  id: number // 主键
  name: string // 名称
  type: number // 类型 1视频流，2系统配置，3其它
  address: string // http://192.168.1.34:8080/preview/{deviceno}/34020000001320000001.flv
  description: string
}

export interface AiBoxRes {
  boxId: number //AI盒子主键
  aiBoxName: string //AI设备名称
  aiBoxId: string //设备ID
  aiBoxCoding: string //设备编码
  bindingPosition: string //绑定位置
  bindingPositionId: string //绑定位置ID
  description: string //描述
  pictureId: string //图片ID
  pictureName: string //图片名称
  picturePath: string //图片位置
  ipAddress: string //IP地址
  subNetworkMask: string //子网掩码
  defaultGateway: string //默认网关
  distributionTitle: string //布控标题
  distributionId: string //布控ID
  sensingDeviceName: string //感知设备名称
  sensingDeviceId: string //感知设备ID
  monitoringEquipmentName: string //监测设备名称
  monitoringEquipmentId: string //监测设备主键ID
  streamingMediaAddress: string //流媒体地址
  departmentName: string //部门名称
  departmentId: string //部门ID
  addTime: string //添加人ID
  addUser: string //添加人
  addId: string //添加时间
  addPhone: string //添加人联系方式
  updateTime: string //更新时间
  updateUser: string //更新人
  updateId: string //更新人ID
  existWarning: number //当前是否存在告警（0否、1是）
  enable: number //全部 空，启用 1 ，禁用 0
  connectedness: number //设备连通性(1正常,0不正常)
  analyticalAbility: number //分析能力：1超温事件、2电弧闪烁
  version: string //版本
  installationPosition: string //安装位置
}

export interface SenseDeviceRes {
  sensingId: number //感知设备主键
  sensingDeviceName: string //设备名称
  sensingDeviceId: string //感知设备ID
  sensingDeviceCoding: string //设备编码
  bindingPosition: string //绑定位置
  bindingPositionId: string //绑定位置ID
  sensingDeviceType: number //设备类型：1可见光、2红外
  description: string //描述
  pictureId: string //图片ID
  pictureName: string //图片名称
  picturePath: string //图片位置
  intranetAddress: string //内网地址
  externalAddress: string //外网地址
  distributionTitle: string //布控标题
  distributionId: string //布控ID
  aiBoxName: string //AI设备名称
  aiBoxId: string //设备ID
  streamingMediaAddress: string //流媒体地址
  monitoringEquipmentName: string //监测设备名称
  monitoringEquipmentId: string //监测设备主键ID
  departmentName: string //部门名称
  departmentId: string //部门ID
  addTime: string //添加人ID
  addUser: string //添加人
  addId: string //添加时间
  addPhone: string //添加人联系方式
  updateTime: string //更新时间
  updateUser: string //更新人
  updateId: string //更新人ID
  existWarning: number //当前是否存在告警（0否、1是）
  enable: number //全部 空，启用 1 ，禁用 0
  monitoringType: number // 监测类型（0未监测、1已监测）
  connectedness: number //设备连通性(1正常,0不正常)
}

export interface DeployDeviceRes {
  deployAndControlId: number //布控信息主键
  monitoringEquipmentName: string //监测设备名称
  monitoringEquipmentId: string //监测设备主键ID
  warningId: string //告警ID
  warningType: string //告警类型 1:电弧闪烁、2:超温事件
  infraredEquipmentName: string //红外设备名称
  infraredEquipmentId: string //红外设备ID
  infraredEquipmentZt: 1 | 0 //红外设备连通状态 1正常 0异常
  visibleLightEquipmentName: string //可见光设备名称
  visibleLightEquipmentId: string //可见光设备ID
  visibleLightEquipmentZt: 1 | 0 //可见光设备连通状态 1正常 0异常
  pictureId: string //图片ID
  pictureName: string //图片名称
  picturePath: string //图片位置
  aiBoxName: string //AI设备名称
  aiBoxId: string //设备ID
  description: string //描述
  addTime: string //添加人ID
  addUser: string //添加人
  addId: string //全部 空,我管理的（用户ID）
  addPhone: string //添加人联系方式
  updateTime: string //更新时间
  updateUser: string //更新人
  updateId: string //更新人ID
  controlOrNot: 1 | 0 //是否布控（0未布控、1已布控）
  bindingPosition: string //绑定位置,
  bindingPositionId: string
}

interface DeployAndControl {
  deployAndControlId: number //主键
  monitoringEquipmentName: string //监测设备名称
  monitoringEquipmentId: string //监测设备设备ID
  warningId: number //告警ID
  warningType: number //告警类型 1:电弧闪烁、2:超温事件
  infraredEquipmentName: string //红外设备名称
  infraredEquipmentId: string //红外设备ID
  infraredEquipmentZt: number //红外设备连通状态 1正常 0异常
  visibleLightEquipmentName: string //可见光设备名称
  visibleLightEquipmentId: string //可见光设备ID
  visibleLightEquipmentZt: number //可见光设备连通状态 1正常 0异常
  bindingPosition: string //安装位置
  bindingPositionId: string //安装位置ID
  pictureId: string
  pictureName: string
  picturePath: string //图片位置
  aiBoxName: string //算法服务器名称
  aiBoxId: string //算法服务器设备ID
  description: string //描述详情
  addTime: string
  addUser: string
  addId: string
  addPhone: string
  updateTime: string
  updateUser: string
  updateId: string
  controlOrNot: number //是否布控（0未布控、1已布控）
  title: string //任务主题
  rect: string //目标框
}

export interface MonitoringInformation {
  monitoringInformationId: number //主键
  deployAndControlId: number //布控主键
  equipmentName: string //设备名称
  equipmentId: string //设备ID
  monitoringArea: string //监测区域名称
  monitoringAreaId: string //测温距离
  distance: string //测温距离
  oneAlarmTemperature: string
  twoAlarmTemperature: string //二级报警温度
  coolingTime: string //冷却时间
  addTime: string
  addUser: string
  addId: string
  addPhone: string
  updateTime: string
  updateUser: string
  updateId: string
  existWarning: number //当前是否存在告警（0否、1是）
  enable: number //是否启用（0禁用、1启用）
  connectedness: number // 设备连通性(1正常,0不正常)
  analyticalAbility: string //分析能力：1超温事件、2电弧闪烁
  zxdfz: string //置信度阀值
  deviceType: number //设备类型：1可见光、2红外、3混合
  drawCfg: string // 绘制区域的配置
  dets: string
  compare: string
}

export interface CompareItem {
  id: string
  threshold: string
}

interface DisposeInfo {
  disposeId: number
  disposeType: number
  remark: string
  warningInformationId: string
  pictureId: string
  pictureName: string
  picturePath: string
  handlerTime: string
  handlerUser: string
  handlerId: string
  handlerPhone: string
  updateTime: string
  updateUser: string
  updateId: string
  deployControlId: string
  levelType: string
  equipmentName: string // 设备名称
}

export interface DeployDetail {
  deployAndControl: DeployAndControl
  monitoringInformationMap: Map<number, MonitoringInformation>
  disposeInfoList: DisposeInfo[]
  deviceConfigInfoList: StreamConfigRes[]
}

/** 设备详情页接口返回 */
export interface DeviceDetailRes {
  /** 设备详细信息 */
  info: DeviceManageDetailInfo
  /** 当前设备的布控信息 */
  deployAndControlList: DeviceManageDeployAndControl[]
  /** 当前设备的告警信息 */
  disposeInfoList: DeviceManageDisposeInfo[]
  /** 涉及到的感知设备 */
  sensingEquipmentList: DeviceManageSensingEquipment[]
  /** 涉及到的监测设备 */
  monitoringEquipmentList: DeviceManageMonitoringEquipment[]
  /** 布控区域 */
  monitoringInformationList: any[]
}

/**
 * 详情信息
 */
interface DeviceManageDetailInfo {
  sensingId: number //感知设备ID
  sensingDeviceName: string //设备名称
  sensingDeviceId: string //感知设备ID
  sensingDeviceCoding: string //感知设备编码
  bindingPosition: string //绑定位置
  bindingPositionId: string //绑定位置ID
  sensingDeviceType: number //感知设备类型
  description: string //描述
  pictureId: string //图片ID
  pictureName: string //图片名称
  picturePath: string //图片地址
  intranetAddress: string //内网IP
  externalAddress: string //外网IP
  distributionTitle: string //分配标题
  distributionId: string //分配ID
  aiBoxName: string //AI盒子名称
  aiBoxId: string //AI盒子ID
  aiBoxCoding: string //AI盒子编码
  streamingMediaAddress: string //流媒体地址
  monitoringEquipmentName: string //监测设备名称
  monitoringEquipmentId: string //监测设备设备ID
  monitoringEquipmentCoding: string //监测设备编码
  departmentName: string //部门名称
  departmentId: string //部门ID
  addTime: string //添加时间
  addUser: string //添加人
  addId: string //添加人ID
  addPhone: string //添加人联系方式
  updateTime: string //更新时间
  updateUser: string //更新人
  updateId: string //更新人ID
  existWarning: number //当前是否存在告警（0否、1是）
  enable: number //全部 空，启用 1 ，禁用 0
  monitoringType: number //监测类型（0未监测、1已监测）
  connectedness: number //设备连通性(1正常,0不正常)
  ipAddress: string //IP地址
  subNetworkMask: string //子网掩码
  installationPosition: string // 安装位置
}

/**
 * 布控信息
 */
interface DeviceManageDeployAndControl {
  deployAndControlId: number //布控信息主键ID
  monitoringEquipmentName: string //监测设备名称
  monitoringEquipmentId: string //监测设备设备ID
  warningId: string //预警主键ID
  warningType: number //告警类型 1:电弧闪烁、2:超温事件
  infraredEquipmentName: string //红外设备名称
  infraredEquipmentId: string //红外设备ID
  infraredEquipmentZt: number //红外设备连通状态 1正常 0异常
  visibleLightEquipmentName: string //可见光设备名称
  visibleLightEquipmentId: string //可见光设备ID
  visibleLightEquipmentZt: number //可见光设备连通状态 1正常 0异常
  bindingPosition: string //绑定位置
  bindingPositionId: string //绑定位置ID
  pictureId: string //图片ID
  pictureName: string //图片名称
  picturePath: string //图片地址
  aiBoxName: string //AI盒子名称
  aiBoxId: string //AI盒子ID
  description: string //描述
  addTime: string //添加时间
  addUser: string //添加人
  addId: string //添加人ID
  addPhone: string //添加人联系方式
  updateTime: string //更新时间
  updateUser: string //更新人
  updateId: string //更新人ID
  controlOrNot: number //是否布控（0未布控、1已布控）
  title: string //标题
}

/**
 * 处置信息
 */
interface DeviceManageDisposeInfo {
  disposeId: number //主键
  disposeType: number //处置状态（ 1:初次预警(未处理)、2:已处理、3:已确认，4:已忽略）
  remark: string //备注（描述）
  warningInformationId: string //预警主键ID
  pictureId: string //图片ID
  pictureName: string //图片名称
  picturePath: string //图片地址
  handlerTime: string //处理人
  handlerUser: string //处理人
  handlerId: string //处理人ID
  handlerPhone: string //联系方式
  updateTime: string //更新时间
  updateUser: string //更新人
  updateId: string //更新人ID
  deployControlId: string //布控ID
  levelType: number //预警类型 （1:电弧闪烁、2:超温事件一级、3:超温事件二级）多个、拼接
  equipmentName: string //设备名称 (告警 sensingDevice的值)
  equipmentId: string //设备ID (告警 sensingDeviceId的值)
}

/**
 * 感知设备
 */
interface DeviceManageSensingEquipment {
  deviceId: string //感知设备
  deviceName: string //感知设备名称
}

/**
 * 监测设备
 */
interface DeviceManageMonitoringEquipment {
  monitoringEquipmentId: string //监测设备ID
  monitoringEquipmentName: string //监测设备名称
}

export interface Tree {
  label: string | number
  value: string | number
  children?: Tree[]
}

export interface SenseTempChartRes {
  deviceId: string
  maxTemp: number
  minTemp: number
  recordTime: string
}

export interface SenseDeviceChartRes {
  deviceId: string
  flashoverCount: number // 闪络
  minTemp: number
  maxTemp: number
  recordTime: string
}

export interface AreaTempRes {
  zonesId: string //区域ID
  zonesName: string // 区域名称
  deviceId: string //设备ID
  minTemp: number //最小温度
  maxTemp: number //最大温度
  avgTemp: number //平均温度
  recordTime: string //记录时间
  // 区域内最高温度的坐标点
  maxX: number
  maxY: number
}

export interface TempCurveDataRes {
  zonesId: string //区域ID
  zonesName: string //区域名称
  deviceId: string //设备ID
  deviceName: string //设备名称
  minTemp: number //最小温度
  maxTemp: number //最大温度
  recordTime: string //记录时间
}
