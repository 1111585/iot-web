import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import { sysApi } from '@/apis/sys'
import type { DetectPointRes, DetectPointLocationRes } from '../types'

// const departmentId = 1

const isDev = import.meta.env.DEV

export const listPayload = ref({
  pageNum: 1,
  pageSize: 20,
  // departmentId: departmentId,
  tag: '',
  keyword: '',
  box: ''
})

const urls = {
  detectPoint: deviceApi.getDetectPoints
}

export async function fetchList(type: keyof typeof urls) {
  try {
    const payload = listPayload.value
    const url = urls[type]
    const { data } = await request.get<any, ARC.ListRes<DetectPointRes>>(url, {
      pageNum: payload.pageNum,
      pageSize: payload.pageSize,
      // departmentId: payload.departmentId,
      monitoringType: payload.tag,
      pointName: payload.keyword,
      countType: payload.box
    })
    return data.list.map((item) => ({
      id: item.pointId,
      name: item.pointName,
      arcCounts: item.dhssgjNum,
      levelOneCounts: item.cwyjgjNum,
      levelTwoCounts: item.cwejgjNum,
      description: item.description,
      status: item.enable
    }))
  } catch (error) {
    onError(error)
  }
}

export async function fetchCounts(type: string) {
  try {
    const { data } = await request.get(deviceApi.getDetectPointCounts, {
      // departmentId: departmentId,
      type: type
    })

    return data
  } catch (error) {
    onError(error)
  }
}

/** 添加点位时的下拉选项 */
export async function fetchAddOptions() {
  try {
    const { data } = await request.get<any, DetectPointLocationRes>(
      deviceApi.getDetectPointAddOptions
    )

    const areaOptions = data.affiliatedParkList.map((item) => ({
      label: item.parkName,
      value: item.parkId,
      disabled: false
    }))
    const buildingOptions = data.ownershipBuildingList.map((item) => ({
      label: item.buildingName,
      value: item.buildingId,
      disabled: false
    }))
    const roomOptions = data.localCityList.map((item) => ({
      label: item.localCityName,
      value: item.localCityId,
      disabled: false
    }))

    return {
      areaOptions,
      roomOptions,
      buildingOptions
    }
  } catch (error) {
    onError(error)
  }
}

export async function fetchDetectPointDetail(id: number) {
  try {
    const { data } = await request.get<any, DetectPointRes>(deviceApi.getDetectPointDetail, {
      pointId: id
    })

    return data
  } catch (error) {
    onError(error)
  }
}

export const errorLogsQuery = reactive({
  pageSize: 999 as const,
  pageNum: 1,
  keyword: ''
})

export async function fetchErrorLogs() {
  if (isDev) return
  try {
    const { data } = await request.get<any, ARC.ListRes<any>>(sysApi.getError, errorLogsQuery)

    return { list: data.list, total: data.total }
  } catch (error) {
    onError(error)
  }
}

const onError = (error: any) => console.log('获取数据错误了', error?.message)
