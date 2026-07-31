/** 所属园区、所属楼宇、所属室内、所属点位 */
export type AreaType = 'park' | 'building' | 'room' | 'point'

interface BaseListRes {
  entId: string
  createTime: string
  createUser: string
  createId: string
  updateTime: string
  updateUser: string
  updateId: string
}

export interface ParkRes extends BaseListRes {
  parkId: number //主键
  parkName: string //所属园区名称
}

export interface BuildingRes extends BaseListRes {
  buildingId: number //主键
  buildingName: string //所属园区名称
}

export interface RoomRes extends BaseListRes {
  localCityId: number //主键
  localCityName: string //所属园区名称
}
