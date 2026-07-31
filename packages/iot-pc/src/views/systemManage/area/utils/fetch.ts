import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import type { AreaType } from '../types'

const urls: Record<AreaType, string> = {
  park: deviceApi.getParkList,
  building: deviceApi.getBuildingList,
  room: deviceApi.getRoomList,
  point: deviceApi.getDetectPoints
}

const detailUrls: Record<AreaType, string> = {
  park: deviceApi.getParkDetail,
  building: deviceApi.getBuildingDetail,
  room: deviceApi.getRoomDetail,
  point: deviceApi.getDetectPointDetail
}

export const submitUrls: Record<AreaType, string> = {
  park: deviceApi.addPark,
  building: deviceApi.addBuilding,
  room: deviceApi.addRoom,
  point: deviceApi.addDetectPoint
}

export const editUrls: Record<AreaType, string> = {
  park: deviceApi.editPark,
  building: deviceApi.editBuilding,
  room: deviceApi.editRoom,
  point: deviceApi.editDetectPoint
}

export const listPayload = ref({
  box: '',
  tab: 'park' as AreaType,
  tag: '',
  keyword: '',
  pageNum: 1,
  pageSize: 20
})

export const submitPayloads = (type: AreaType, formData: any) => {
  switch (type) {
    case 'park':
      return {
        parkName: formData.name
      }
    case 'building':
      return {
        buildingName: formData.name
      }
    case 'room':
      return {
        localCityName: formData.name
      }
  }
}

export async function fetchList<T>(type: AreaType) {
  try {
    const url = urls[type]
    const { data } = await request.get<any, ARC.ListRes<T>>(url, {
      pageNum: listPayload.value.pageNum,
      pageSize: listPayload.value.pageSize,
      keyword: listPayload.value.keyword
    })

    return {
      list: data.list,
      total: data.total
    }
  } catch (error) {
    onError(error)
  }
}

export async function fetchDetail(type: AreaType, id: number) {
  try {
    const url = detailUrls[type]
    const keys = {
      park: 'parkId',
      building: 'buildingId',
      room: 'localCityId'
    }
    const { data } = await request.get(url, {
      [keys[type]]: id
    })

    return {
      raw: data
    }
  } catch (error) {
    onError(error)
  }
}

const onError = (error: any) => console.log('[区域管理]出错了', error?.message)
