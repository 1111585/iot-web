import { ref } from 'vue'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import { chartApi } from '@/apis/chart'
import { treeDataTranslate, formatDate } from '@/util'
import user from '@/store/user'
import { addDialog } from './dialog'
import { shareDeviceDetail } from './store'
import type {
  DeviceDetailRes,
  BindingLocationAll,
  VideoStreamRes,
  SenseTempChartRes,
  SenseDeviceChartRes,
  AreaTempRes,
  TempCurveDataRes
} from '../types'

/**
 * 2024年12月10日15:12:40
 * 所有用到的 departmentId 已注释
 */

const userInfo = computed(() => user().userInfo)

/**
 * 点击气泡进行筛选，枚举对应 boxItem 中的 value，由后端指定(根据页面上气泡统计的返回值)
 */

enum AiBoxEnable {
  enable = 1,
  dis_enable = 0,
  total = ''
}
enum DetectDeviceMonitoringType {
  over_temperature = 2,
  arc_flare = 1,
  total = ''
}
enum SenseDeviceEnable {
  enable = 1,
  dis_enable = 0,
  total = ''
}

const warningType = {
  no_control: 0,
  yes_control: 1,
  total: ''
}

const pageType = {
  aibox: 1,
  detect: 2,
  sense: 3,
  deploy: 3
}

export const listPayload = ref({
  box: '',
  keyword: '',
  pageNum: 1,
  pageSize: 20,
  tab: '0', // 常量 consts.ts -> tabItems 绑定： 本部门0，全部1
  tag: '',
  detectDeviceId: '', // 被监测设备的id，设备通常是XX开关柜,
  treeNodeLevel: 1, // 树节点的层级
  treeNodeName: ''
})

/** 获取列表的请求参数 */
const payloads = computed(() => ({
  aibox: {
    pageNum: listPayload.value.pageNum,
    pageSize: listPayload.value.pageSize,
    menuTier: listPayload.value.treeNodeLevel,

    aiBoxName: listPayload.value.keyword, // 设备名称
    countType: listPayload.value.tag, // 总数 空，超温1，电弧2
    enable: AiBoxEnable[listPayload.value.box], // 全部 '', 启用中1, 禁用中0
    id: listPayload.value.detectDeviceId, // 被监测设备的id，设备通常是XX开关柜
    name: listPayload.value.treeNodeName
  },
  deploy: {
    pageNum: listPayload.value.pageNum,
    pageSize: listPayload.value.pageSize,
    menuTier: listPayload.value.treeNodeLevel,

    addId: listPayload.value.tab,
    countType: warningType[listPayload.value.box],
    monitoringEquipmentName: listPayload.value.keyword,
    warningType: listPayload.value.tag === '0' ? '' : listPayload.value.tag
  },
  detect: {
    pageNum: listPayload.value.pageNum,
    pageSize: listPayload.value.pageSize,
    menuTier: listPayload.value.treeNodeLevel,

    equipmentName: listPayload.value.keyword, // 设备名称
    monitoringType: listPayload.value.tag, // 总数 空，超温1，电弧2
    countType: DetectDeviceMonitoringType[listPayload.value.box], // 已监测 1 未监测 0
    switchCabinetId: listPayload.value.detectDeviceId, // 被监测设备的id，设备通常是XX开关柜
    name: listPayload.value.treeNodeName
  },
  sense: {
    pageNum: listPayload.value.pageNum,
    pageSize: listPayload.value.pageSize,
    menuTier: listPayload.value.treeNodeLevel,

    sensingDeviceName: listPayload.value.keyword, // 设备名称
    countType: listPayload.value.tag, // 总数 空，超温1，电弧2
    enable: SenseDeviceEnable[listPayload.value.box], // 全部 '', 启用中1, 禁用中0
    id: listPayload.value.detectDeviceId, // 被监测设备的id，设备通常是XX开关柜
    name: listPayload.value.treeNodeName
  }
}))

const detailId = ref('')
const detailPayloads = computed(() => ({
  aibox: {
    boxId: detailId.value
  },
  detect: {
    monitoringEquipmentId: detailId.value
  },
  deploy: {
    deployAndControlId: detailId.value
  },
  sense: {
    sensingId: detailId.value
  }
}))

/** 列表接口 */
const urls = {
  aibox: deviceApi.getAiBoxDevices,
  deploy: deviceApi.getDeployDevices,
  detect: deviceApi.getDetectDevices,
  sense: deviceApi.getSenseDevices
}
/** 统计数量接口 */
const countsUrls = {
  aibox: deviceApi.getAiBoxCounts,
  deploy: deviceApi.getDeployCounts,
  detect: deviceApi.getDetectCounts,
  sense: deviceApi.getSenseCounts
}
/** 详情页接口 */
const detailUrls = {
  aibox: deviceApi.getAiBoxDeviceDetail,
  deploy: deviceApi.getDeployDeviceDetail,
  detect: deviceApi.getDetectDeviceDetail,
  sense: deviceApi.getSenseDeviceDetail
}
export type DetailPage = keyof typeof detailUrls

/** 列表统计气泡的数量请求参数 */
function countsPayload(type: keyof typeof countsUrls, tab: string) {
  switch (type) {
    case 'aibox':
    case 'detect':
      return {
        // departmentId: departmentIdNeeds[tab],
        type: tab
      }
    case 'sense':
      return {
        type: tab,
        menuTier: listPayload.value.treeNodeLevel,
        deviceId: listPayload.value.detectDeviceId,
        deviceName: listPayload.value.treeNodeName
      }
    case 'deploy':
      return {
        addId: userInfo.value?.empId
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

/**
 * 获取所有绑定位置的下拉选项
 * - fetchDeviceTypeList 同样可获取绑定点位列表（pointId: number）
 * - 将 ponitId 统一为 number 类型方便下拉菜单的绑定
 */
export async function fetchBindingLocationOptions() {
  try {
    const { data } = await request.get<any, BindingLocationAll[]>(deviceApi.getAllBindingLocation)

    const options = data.map((item) => ({
      label: `${item.pointName}（${item.description}）`,
      value: Number(item.pointId)
    }))

    return { options, raw: data }
  } catch (error) {
    onError(error)
  }
}

/** 获取设备详情：不是很多详情，用在设备编辑的时候 */
export async function fetchDetail(type: keyof typeof detailUrls, reqData?: ARC.AnyObj) {
  try {
    detailId.value = reqData?.id

    const url = detailUrls[type]
    const payload = detailPayloads.value[type]

    const { data } = await request.get(url, { ...payload })

    // switch (type) {
    //   case 'aibox':
    //     return { raw: data.aiBox }
    //   case 'detect':
    //   case 'sense':
    //     return { raw: data }
    // }

    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

/**
 * 获取设备的详情：很多详情信息
 * @param type 设备类型
 * @param id 主键id
 */
export async function fetchDeviceDetail(type: keyof typeof pageType, id: ARC.SN, deviceId: string) {
  try {
    const { data } = await request.get<any, DeviceDetailRes>(deviceApi.getDeviceDetail, {
      type: pageType[type],
      id,
      deviceId
    })

    shareDeviceDetail.value = data

    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function fetchVideoBaseInfo(type: 'video' | 'systemConfig' | 'other') {
  try {
    const types = {
      video: 1,
      systemConfig: 2,
      other: 3
    }

    const { data } = await request.get<any, VideoStreamRes>(deviceApi.getVideoStream, {
      type: types[type]
    })

    return data
  } catch (error) {
    onError(error)
  }
}
/**
 * 测试设备连通性，在配置设备IP的时候自动配置，先通过这个方法请求到目标IP地址（反之手动输入IP）
 * 然后再进行联通测试？？？
 */
export async function fetchDeviceConnectUrl(id: number, name?: string) {
  try {
    const { data } = await request.get(deviceApi.getFlvStream, {
      id,
      name: name || ''
    })
    return {
      url: data.url,
      raw: data
    }
  } catch (error: any) {
    console.log('[获取连通性目标地址]失败', error?.message)
  }
}

export async function fetchDeviceTypeList() {
  try {
    const { data } = await request.get(deviceApi.getDeviceTypeList)
    const deviceTypeList = data.sensingDeviceList
    const locationList = data.pointManagementList

    const options = deviceTypeList.map((item) => ({
      label: item.sensingDeviceName,
      value: item.sensingDeviceId
    }))
    const locationOptions = locationList.map((item) => ({
      label: `${item.pointName}（${item.description}）`,
      value: Number(item.pointId)
    }))

    return {
      raw: deviceTypeList,
      options,
      locationOptions
    }
  } catch (error) {
    onError(error)
  }
}

export const bindingLocation = ref<ARC.Options[]>([])

export const useBindingLocation = (dialog: typeof addDialog) => {
  watch(
    () => dialog.visible,
    (flag) => {
      if (!flag) return
      fetchBindingLocationOptions().then((res) => {
        if (!res) return
        bindingLocation.value = res.options
      })
    }
  )
}

export const deviceTypeList = ref<ARC.Options[]>([])
export const locationList = ref<ARC.Options[]>([])

export const useDeviceTypeList = (dialog: typeof addDialog) => {
  watch(
    () => dialog.visible,
    (flag) => {
      if (!flag) return
      fetchDeviceTypeList().then((res) => {
        if (!res) return
        deviceTypeList.value = res.options
        locationList.value = res.locationOptions
      })
    }
  )
}

export const useDetailFetching = <T>(type: keyof typeof detailUrls) => {
  // 编辑内容时，页面绑定的表单内容替换，不变的内容原封不动post回去
  const detail = ref<T | null>(null)
  const detailId = ref<number | null>(null)

  async function fetching(reqData?: ARC.AnyObj) {
    if (!detailId.value) return
    detail.value = await fetchDetail(type, reqData)
  }

  onUnmounted(() => {
    detailId.value = null
    detail.value = null
  })

  return {
    detail,
    fetching
  }
}

export async function fetchDeviceTypeFromDict() {
  try {
    const { data } = await request.get(deviceApi.dictType, { dictType: 'switchboard_type' })
    const options = data.list.map((item) => ({
      label: item.dictName,
      value: item.dictValue
      // value: item.dictId
    }))

    return {
      options,
      raw: data
    }
  } catch (error) {
    onError(error)
  }
}

export async function fetchTrees(type: keyof typeof pageType, dictType = 'switchboard_type') {
  try {
    const { data } = await request.get(deviceApi.getDeviceTree, {
      dictType: dictType,
      type: pageType[type]
    })

    const list = data.map((item) => item.treeInfoVoList).flat()

    return {
      list: treeDataTranslate(list, 'id', 'pid'),
      raw: data
    }
  } catch (error) {
    onError(error)
  }
}

export async function fetchAllAibox() {
  try {
    const { data } = await request.get(deviceApi.getAiBoxAll)
    const options = data.map((item) => ({
      label: item.aiBoxName,
      value: item.aiBoxId
    }))
    return { options, raw: data }
  } catch (error) {
    onError(error)
  }
}

// 感知设备温度曲线（7天）
export async function fetchSenseTempChart(deviceId: string) {
  try {
    const reqUrl = chartApi.device.sense.tempSevenDays
    const { data } = await request.get<any, SenseTempChartRes[]>(reqUrl, { deviceId })

    if (!data || data.length === 0) return { tempData: [] as any[] }
    const tempData = data
      .map((item) => {
        const formattedDate = formatDate(item.recordTime)
        return [
          { date: formattedDate, type: '温度1', value: item.minTemp },
          { date: formattedDate, type: '温度2', value: item.maxTemp }
        ]
      })
      .flat()

    return { raw: data, tempData }
  } catch (error) {
    onError(error)
    return { tempData: [] }
  }
}

export async function fetchSenseDeviceSevenDays(deviceId: string) {
  try {
    const reqUrl = chartApi.device.sense.deviceSevenDays
    const { data } = await request.get<any, SenseDeviceChartRes[]>(reqUrl, { deviceId })

    if (!data || data.length === 0) return { deviceData: [] as any[] }
    const deviceData = data
      .map((item) => {
        const formattedDate = formatDate(item.recordTime)
        return [
          { date: formattedDate, type: '闪络', value: item.flashoverCount },
          { date: formattedDate, type: '温度1', value: item.minTemp },
          { date: formattedDate, type: '温度2', value: item.maxTemp }
        ]
      })
      .flat()

    return { raw: data, deviceData }
  } catch (error) {
    onError(error)
    return { deviceData: [] }
  }
}

export async function fetchAreaTemp(deviceId: string, date?: string) {
  try {
    const { data } = await request.get<any, AreaTempRes[]>(deviceApi.getVideoAreaTemp, {
      deviceId,
      date: date || ''
    })

    // const mockTemps = [
    //   {
    //     zonesId: 1766634813,
    //     zonesName: '区域A',
    //     maxTemp: 68.3,
    //     minTemp: 45.2,
    //     avgTemp: 54.7,
    //     deviceId: 101,
    //     maxX: 0.51171875,
    //     maxY: 0.7708333
    //   },
    //   {
    //     zonesId: 1766634850,
    //     zonesName: '区域B',
    //     maxTemp: 72.1,
    //     minTemp: 48.9,
    //     avgTemp: 60.3,
    //     deviceId: 101,
    //     maxX: 0.51171875,
    //     maxY: 0.7708333
    //   },
    //   {
    //     zonesId: 1766634868,
    //     zonesName: '区域C',
    //     maxTemp: 65.4,
    //     minTemp: 43.5,
    //     avgTemp: 52.8,
    //     deviceId: 101,
    //     maxX: 0.51171875,
    //     maxY: 0.7708333
    //   }
    // ]

    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function fetchTempCurve(query: ARC.AnyObj) {
  try {
    // TODO: 暂时不传 endDate
    const { data } = await request.get<any, TempCurveDataRes[]>(
      chartApi.device.sense.tempCurveData,
      { ...query }
    )

    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

const onError = (error: any) => console.log('获取数据错误了', error?.message)
