import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import user from '@/store/user'
import { EventStatus } from '@/enums'
import { getImageList } from '@/util'
import type { MonitorOptionsRes } from '../types'
import type { DeployDetail, SenseDeviceRes } from '@/views/deviceManage/types'

const warningType = {
  no_control: -1,
  cw_control: 2,
  sl_control: 1,
  total: ''
}

const userInfo = computed(() => user().userInfo)

export const listPayload = ref({
  box: '',
  keyword: '',
  pageNum: 1,
  pageSize: 20,
  tab: '0',
  tag: '',
  treeNodeLevel: '' as unknown as number,
  deviceId: '',
  treeNodeName: ''
})

const payloads = computed(() => ({
  deploy: {
    pageNum: listPayload.value.pageNum,
    pageSize: listPayload.value.pageSize,
    menuTier: listPayload.value.treeNodeLevel,

    addId: listPayload.value.tab,
    countType: warningType[listPayload.value.box],
    monitoringEquipmentName: listPayload.value.keyword,
    warningType: listPayload.value.tag === '0' ? '' : listPayload.value.tag,
    deviceId: listPayload.value.deviceId
  }
}))

const urls = {
  deploy: deviceApi.getDeployDevices
}

const countsUrls = {
  deploy: deviceApi.getDeployCounts
}

/** 列表统计气泡的数量请求参数 */
function countsPayload(type: keyof typeof countsUrls, tab: string) {
  switch (type) {
    case 'deploy':
      return {
        addId: userInfo.value?.empId,
        deviceId: listPayload.value.deviceId,
        deviceName: listPayload.value.treeNodeName,
        menuTier: listPayload.value.treeNodeLevel
      }
  }
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

export async function fetchCounts(type: keyof typeof countsUrls, countType: string) {
  try {
    const url = countsUrls[type]
    const payloadNeeds = countsPayload(type, countType)

    const { data } = await request.get<any, ARC.Res.Counts[]>(url, {
      ...payloadNeeds
    })

    return data
  } catch (error) {
    onError(error)
  }
}

/** 获取下拉选项 */
export async function fetchOptions(type: string | number, v?: string) {
  try {
    const reqUrl = v ? deviceApi.getMonitorOprionsV2 : deviceApi.getMonitorOprions
    const { data } = await request.get<any, MonitorOptionsRes>(reqUrl, {
      type: type
    })

    const { aiBoxList, sensingDeviceList, monitoringEquipmentList, pointManagementList } = data

    const points = pointManagementList.map((item) => ({
      label: `${item.pointName}（${item.description}）`,
      value: item.pointId
    }))
    const aiBoxes = aiBoxList.map((item) => ({
      label: item.aiBoxName,
      value: item.aiBoxId
    }))
    const sense = sensingDeviceList.map((item) => ({
      label: item.sensingDeviceName,
      value: item.sensingDeviceId
    }))
    const detect = monitoringEquipmentList.map((item) => ({
      label: item.equipmentName,
      value: item.equipmentId
    }))

    return {
      options: {
        points,
        aiBoxes,
        sense,
        detect
      },
      raw: data
    }
  } catch (error) {
    onError(error)
  }
}

/** 通过点位下拉选项，动态获取当前点位可用的下拉 */
export async function fetchDeviceOptions(ponitId: number) {
  try {
    const { data } = await request.get<any, { deviceId: string; deviceName: string }[]>(
      deviceApi.getMonitorDeviceOption,
      {
        id: ponitId
      }
    )

    const options = data.map((item) => ({
      label: item.deviceName,
      value: item.deviceId
    }))

    return { options, raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function fetchSenseDevicesByAiboxId(aiBoxId: number, type: number) {
  try {
    const { data } = await request.get<any, SenseDeviceRes[]>(deviceApi.getSenseDevicesByAiboxId, {
      aiBoxId,
      type
    })

    const options = data.map((item) => ({
      label: item.sensingDeviceName,
      value: item.sensingDeviceId,
      posiName: item.bindingPosition,
      posiId: item.bindingPositionId
    }))

    return { options, raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function fetchDetail(id: number) {
  try {
    const res = await request.get<any, DeployDetail>(deviceApi.getDeployDeviceDetail, {
      deployAndControlId: id
    })

    const data = res.data.deployAndControl
    const areaMap = res.data.monitoringInformationMap
    const alerts = res.data.disposeInfoList
    const senseDevices = res.data.deviceConfigInfoList || []
    // 所有监测区域合为一个数组
    const allAreaList = Object.values(areaMap).flat()

    const baseInfo = {
      name: data.monitoringEquipmentName,
      description: data.description,
      aiBoxName: data.aiBoxName,
      addUserName: data.addUser,
      addUserContact: data.addPhone,
      addTime: data.addTime,
      location: data.bindingPosition,
      title: data.title,
      image: getImageList(data.picturePath)
    }

    // 红外设备列表
    const infraredId = data.infraredEquipmentId.split('、')
    const infraredName = data.infraredEquipmentName.split('、')
    const infraredList = infraredId.map((item, index) => ({
      infraredId: item,
      infraredName: infraredName[index]
    }))
    // 可见光设备列表
    const light = data.visibleLightEquipmentId.split('、')
    const lightName = data.visibleLightEquipmentName.split('、')
    const lightList = light.map((item, index) => ({
      lightId: item,
      lightName: lightName[index]
    }))
    // 组合给页面的tabs
    const tabs: { text: string; value: string }[] = [
      ...infraredList.map((item) => ({ text: item.infraredName, value: item.infraredId })),
      ...lightList.map((item) => ({ text: item.lightName, value: item.lightId }))
    ].filter((item) => item.value)

    // 保证 infraredId 和 light 组合后的唯一性，并且当前值需要在 areaMap 存在
    const tabsUniqueByValue = [...new Map(tabs.map((item) => [item.value, item])).values()].filter(
      (item) => Object.keys(areaMap).includes(item.value)
    )

    const alertsList = alerts.map((item) => ({
      title: item.levelType == '1' ? '闪络告警' : '超温告警',
      device: item.equipmentName,
      time: item.handlerTime,
      descrition: item.remark,
      status: item.disposeType
    }))

    return {
      raw: res.data,
      baseInfo,
      tabs: tabsUniqueByValue,
      areaMap,
      alertsList,
      allAreaList,
      senseDevices
    }
  } catch (error) {
    onError(error)
  }
}

export async function checkAreaName(name: string, deviceId: string) {
  try {
    const { code } = await request.get(deviceApi.checkAreaName, {
      name,
      deviceId
    })

    return code === 100
  } catch (error) {
    onError(error)
  }
}

const onError = (error: any) => console.log('获取数据错误了', error?.message)
