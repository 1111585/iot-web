export interface DetectPointRes {
  pointId: number // 点位主键ID
  pointName: string // 点位名称
  affiliatedPark: string
  affiliatedParkId: number //所属园区ID
  buildingName: string
  buildingId: number // 楼宇ID
  localCityName: string
  localCityId: number // 市内ID
  description: string
  dhssgjNum: number
  cwyjgjNum: number
  cwejgjNum: number
  departmentId: string
  departmentName: string
  entId: string
  addTime: string
  addUser: string
  addId: string
  addPhone: string
  updateTime: string
  updateUser: string
  updateId: string
  enable: number
  monitoringType: number //全部 空，已监测 1 ，未监测 0
}

export interface DetectPointLocationRes {
  /** 所属园区 */
  affiliatedParkList: ParkItem[]
  /** 所属楼宇 */
  ownershipBuildingList: BuildingItem[]
  /** 所属城市 */
  localCityList: CityItem[]
  /** 所属部门 */
  departmentList: DepartmentItem[]
}

interface ParkItem {
  parkId: number
  parkName: string
  entId: string
  createTime: string
  createUser: string
  createId: string
  updateTime: string
  updateUser: string
  updateId: string
}

interface BuildingItem {
  buildingId: number
  buildingName: string
  entId: string
  createTime: string
  createUser: string
  createId: string
  updateTime: string
  updateUser: string
  updateId: string
}

interface CityItem {
  localCityId: number
  localCityName: string
  entId: string
  createTime: string
  createUser: string
  createId: string
  updateTime: string
  updateUser: string
  updateId: string
}

interface DepartmentItem {
  departmentId: number
  departmentName: string
  entId: string
  createTime: string
  createUser: string
  createId: string
  updateTime: string
  updateUser: string
  updateId: string
}

export interface EventRuleRes {
  ruleId: number //规则配置主键ID
  ruleConfigurationName: string //规则配置名称
  afterTheEvent: string //事件发生后
  afterTheIgnore: string //事件忽略后
  afterTheConfirm: string //事件确定后
  afterTheProcessed: string //事件已处理后
  entId: string //企业ID
  addTime: string
  addUser: string
  addId: string
  updateTime: string
  updateUser: string
  updateId: string
  enable: number //是否启用
  warningTime: number //预警时长
}

export interface ErrorLogRes {
  id: number
  name: string
  opType: number
  funcType: number
  opMethod: string
  result: string
  ip: string
  location: string
  userName: string
  entName: string
  reqUrl: string
  reqParams: string
  repData: string
  repTime: string
  browser: string
  os: string
  className: string
  createTime: string
  state: number
  eventType: number
}
