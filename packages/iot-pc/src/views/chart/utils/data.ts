import { formatDate, generateEasyId } from "@/util";
import { request } from '@/util/request'
import { chartApi } from '@/apis/chart'
import type { Nodes, Edges, Layouts } from 'v-network-graph'
import type { DeviceStatus, DeviceData, AlertData, AlertStatistics, ChartType, LiveAlertListRes, DeviceDataRes } from '../chart.d'


const iotApi = chartApi.iot
export const onError = (error: any, module?: ChartType) => console.log(`[图表-${module}]数据获取出错`, error?.message)

// loading 状态
export const loading = ref({
  liveAlert: false
})


export const systemData = ref({
  account: 0,
  gateway: 1,
  connect: 0
})

// 接入设备数据
export const deviceStatusData = ref<DeviceStatus[]>([
  { type: '接入设备', count: 2, color: '#1890ff', alias: 'jrsb_num' },
  { type: '运行正常', count: 0, color: '#52c41a', alias: 'yxzc_num' },
  { type: '设备告警', count: 0, color: '#ff4d4f', alias: 'sbgj_num' },
  { type: '设备离线', count: 0, color: '#faad14', alias: 'sblx_num' },
  { type: '设备异常', count: 2, color: '#722ed1', alias: 'sbyc_num' }
])

export async function fetchDeviceStatus() {
  try {
    const { data } = await request.get<any, any>(iotApi.getDeviceCountInfo)
    if (!data) throw new Error('设备状态统计')
    deviceStatusData.value = deviceStatusData.value.map((item) => ({
      ...item,
      count: data[item.alias] || 0
    }))
  } catch (error) {
    onError(error)
  }
}

// 接入区域数据
export const areaDeviceData = ref<DeviceData[]>([
  { id: '0', name: '区域0', count: 0 },
  { id: '1', name: '区域1', count: 0 },
  { id: '2', name: '区域2', count: 0 },
  { id: '3', name: '区域3', count: 0 },
  { id: '4', name: '区域4', count: 0 },
  { id: '5', name: '区域5', count: 0 },
  { id: '6', name: '区域6', count: 0 },
  { id: '7', name: '区域7', count: 0 }
])

export async function fetchAreaDevice() {
  try {
    const { data } = await request.get<any,DeviceDataRes[]>(iotApi.getAccessInformation)
    if (!data) throw new Error('接入信息')
    areaDeviceData.value = data.map((item) => ({
      id: generateEasyId(),
      name: item.type,
      count: item.num
    }))
  } catch (error) {
    onError(error)
  }
}

// 告警数据
export const alertRankData = ref<AlertData[]>([
  { level: 1, count: 0, times: 0, name: '组态告警' },
  { level: 2, count: 0, times: 0, name: '视频告警' },
  { level: 3, count: 0, times: 0, name: '环境告警' }
])

export async function fetchAlertRank() {
  try {
    const { data } = await request.get(iotApi.getAlarmRanking)
    if (!data) throw new Error('告警排行')
    alertRankData.value = data.map((item) => ({
      times: item.num,
      name: item.type
    }))
  } catch (error) {
    onError(error)
  }
}

// 告警统计数据
export const alertStatisticsData = ref<AlertStatistics[]>([
  { type: '组态告警', value: 0, color: '#FFA500' },
  { type: '视频告警', value: 0, color: '#FF4500' },
  { type: '环境告警', value: 0, color: '#4CAF50' },
  { type: '状态告警', value: 0, color: '#2196F3' },
  { type: '设备告警', value: 0, color: '#9C27B0' },
  { type: '系统告警', value: 0, color: '#F44336' }
]);

export async function fetchAlertStatistics() {
  try {
    const { data } = await request.get(iotApi.getAlarmCount)
    if (!data) throw new Error('告警统计')
    alertStatisticsData.value = data?.alarmCountVoList?.map((item) => ({
      type: item.type,
      value: item.num,
      color: ''
    }))
  } catch (error) {
    onError(error)
  }
}

// 实时告警数据
export const liveAlertData = ref({
  today: 0,
  lastWeek: 0,
  lastMonth: 0,
});

export async function fetchLiveAlert() {
  try {
    loading.value.liveAlert = true
    const { data } = await request.get(iotApi.getWarningCount)
    if (!data) throw new Error('实时告警统计')
    liveAlertData.value = {
      today: data.today_num,
      lastWeek: data.week_num,
      lastMonth: data.month_num,
    }
    return data
  } catch (error) {
    onError(error)
  } finally {
    loading.value.liveAlert = false
  }
}

export const liveAlertPayload = ref({
  timeType: 2  // 1: 今日 2: 近一周 3: 近一月
})

export const liveAlertList = ref<LiveAlertListRes[]>([])

export async function fetchLiveAlertList() {
  try {
    const { data } = await request.get<any, LiveAlertListRes[]>(iotApi.getWarningDetaiListByTimeType, liveAlertPayload.value)
    if (!data) throw new Error('实时告警列表')

    liveAlertList.value = data.map((item) => ({
      ...item,
      // alarmTime: formatDate(new Date(item.alarmTime), 'yyyy年MM月dd日 hh时mm分ss秒')
      alarmTime: formatDate(new Date(item.alarmTime), 'yyyy-MM-dd hh:mm:ss')
    }))
  } catch (error) {
    onError(error)
  }
}


// 设备部署数据
export const deviceDeploymentData = {
  mainDevice: { name: '智慧电', id: '1' },
  subDevice: { name: '接入1个设备', id: '19141027' }
};

// 天气数据
export const weatherData = ref({
  city: '广州',
  weather: '晴天',
  temperature: '17°-36°C',
  time: '2025年4月15日 19时50分44秒'
});

export const useWeatherData = () => {
  let updateWeatherTimer
  onMounted(() => {
    updateWeatherTimer = setInterval(() => {
      weatherData.value.time = formatDate(new Date(), 'yyyy年MM月dd日 hh时mm分ss秒')
    }, 1000)
  })
  onUnmounted(() => {
    clearInterval(updateWeatherTimer)
  })
}

export const nodes: Nodes = {
  node1: { active: true, name: '接入2个网关\n智慧电', face: "connect.png"},
  node2: { active: true, name: '接入12个设备\n文案', face: "connect.png" },
  node3: { active: true, name: '接入3个设备\n文案', face: "connect.png" },
}

export const edges: Edges = {
  edge1: { source: 'node3', target: 'node1' },
  edge2: { source: 'node2', target: 'node1' },
}

export const layouts: Layouts = {
  nodes: {
    node1: { x: 0, y: 0 },
    node2: { x: 80, y: 160 },
    node3: { x: -80, y: 160 },
  }
}