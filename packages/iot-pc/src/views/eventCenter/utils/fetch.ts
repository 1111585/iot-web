import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import user from '@/store/user'
import { EventType, EventStatus, statusColor } from './consts'
import type { EventData, EventDetail, ShareEventDetail, EventRes } from '../types'

const userInfo = computed(() => user().userInfo)

export const listPayload = ref({
  box: '',
  keyword: '',
  pageNum: 1,
  pageSize: 12, // 一行刚好放下4个卡片
  tab: '1',
  tag: '',
  location: '',
  timeRange: ''
})

const payloads = computed(() => ({
  eventCenter: {
    pageNum: listPayload.value.pageNum,
    pageSize: listPayload.value.pageSize,
    levelType: listPayload.value.tag == '0' ? '' : listPayload.value.tag, // 预警类型 （1:电弧闪烁、2:超温事件一级、3:超温事件二级）多个、拼接
    monitoringDevice: listPayload.value.keyword, // 检测（监测）设备名称
    warningStartTime: listPayload.value?.timeRange?.[0] || '', // 预警开始时间
    warningEndTime: listPayload.value?.timeRange?.[1] || '', // 预警结束时间
    owningPoint: listPayload.value.location || '', // 所属点位 （ 多个、拼接）
    disposeType: listPayload.value.box === 'total' ? '' : listPayload.value.box, // 处置状态（ 1:初次预警、2:已确认、3:已处理，4:忽略）多个、拼接
    userId: listPayload.value.tab == '0' ? userInfo.value?.empId : ''
  }
}))

const urls = {
  eventCenter: deviceApi.getEvents
}

const countsUrls = {
  eventCenter: deviceApi.getEventCounts
}

export async function fetchList<T>(type: keyof typeof payloads.value) {
  try {
    const payload = payloads.value[type]
    const url = urls[type]
    const { data } = await request.get(url, { ...payload })

    const list: T[] = data.list
    return { list, raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function fetchCounts(type: keyof typeof countsUrls) {
  try {
    const url = countsUrls[type]
    const res = await request.get<any, ARC.Res.Counts[]>(url, {
      userId: listPayload.value.tab == '0' ? userInfo.value?.empId : ''
    })

    if (res?.data) return res.data

    throw {
      response: { status: 500 },
      message: '获取数据失败aaaaaaaaaaa'
    }
  } catch (error) {
    throw error
  }
}

export const shareEventDetail = ref<ShareEventDetail>()

export async function fetchEventDetail(id: ARC.SN) {
  try {
    const { data } = await request.get<any, EventDetail>(deviceApi.getEventDetail, {
      warningId: id
    })

    const _base = data.warningInformation
    const _list = data.disposeInfoList
    const _shapes = data.monitoringInformationList.map((item) => JSON.parse(item.drawCfg)) || []

    const baseInfo = {
      eventType: EventType[_base.levelType],
      status: EventStatus[_base.disposeType],
      location: _base.owningPoint,
      duration: _base.warningTimeDetail,
      aiBox: _base.aiBoxName,
      aiBoxId: _base.aiBoxId,
      sensorDevice: _base.sensingDevice,
      sensorDeviceId: _base.sensingDeviceId,
      monitorDevice: _base.monitoringDevice,
      monitorDeviceId: _base.monitoringDeviceId,
      videoUrl: _base.videoUrl,
      pictureUrl: _base.picturePath,
      warningTime: _base.warningTime
    }

    const activities = _list.map((item) => ({
      timestamp: item.handlerTime,
      user: item.handlerUser,
      title: EventStatus[item.disposeType],
      content: item.remark,
      type: statusColor[item.disposeType],
      size: 'large' as 'normal' | 'large',
      image: item.pictureId,
      equipmentName: item.equipmentName,
      equipmentId: item.equipmentId,
      oneAlarmTemperature: item.oneAlarmTemperature,
      twoAlarmTemperature: item.twoAlarmTemperature,
      addUser: item.addUser
    }))

    shareEventDetail.value = baseInfo

    return {
      baseInfo,
      activities,
      raw: data,
      shapes: _shapes
    }
  } catch (error) {
    onError(error)
  }
}

export async function fetchTags() {
  try {
    const { data } = await request.get(deviceApi.eventDict)

    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function deleteEvents(ids: ARC.SN[]) {
  try {
    const { data, code } = await request.postJson(deviceApi.deleteEvents, ids)
    return { code, data }
  } catch (error) {
    onError(error)
    return { code: 0, data: null }
  }
}

export async function settleEvents(ids: ARC.SN[], raw: EventRes[]) {
  try {
    type Payload = {
      deployControlId: string
      disposeType: string
      equipmentId: string
      equipmentName: string
      levelType: number
      picturePath: string
      remark: string
      warningInformationId: number
    }

    // 根据ids从raw中筛选出需要的数据
    const items: Payload[] = ids
      .map((id) => {
        const rawItem = raw.find((item) => item.warningId === id)
        if (!rawItem) return null
        return {
          deployControlId: rawItem.deployControlId || '',
          disposeType: '2', // 设为已处置状态
          equipmentId: rawItem.sensingDeviceId || '',
          equipmentName: rawItem.sensingDevice || '',
          levelType: rawItem.levelType,
          picturePath: rawItem.picturePath || '',
          remark: '批量设为已处置',
          warningInformationId: Number(rawItem.warningId)
        }
      })
      .filter(Boolean) as Payload[]

    const { data, code } = await request.postJson<Payload[]>(deviceApi.status.settleEvent, items)
    return { code, data }
  } catch (error) {
    onError(error)
    return { code: 0, data: null }
  }
}

const onError = (error: any) => console.log('获取数据错误了', error?.message)
