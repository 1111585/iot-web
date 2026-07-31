import type { InjectionKey } from 'vue'
import type { DevicesRender } from '../types'

export const devicesColumn = [
  { label: '今日汇总', prop: 'date', align: 'center', width: '120' },
  {
    label: '电弧闪络事件',
    align: 'center',
    children: [
      { label: '产生', prop: 'arcFlashCount', align: 'center' },
      { label: '未处置', prop: 'arcFlashUnresolvedCount', align: 'center' }
    ]
  },
  {
    label: '超温一级事件',
    align: 'center',
    children: [
      { label: '产生', prop: 'overTemperatureCount', align: 'center' },
      { label: '未处置', prop: 'overTemperatureUnresolvedCount', align: 'center' }
    ]
  },
  {
    label: '超温二级事件',
    align: 'center',
    children: [
      { label: '产生', prop: 'overTemperatureLevel2Count', align: 'center' },
      { label: '未处置', prop: 'overTemperatureLevel2UnresolvedCount', align: 'center' }
    ]
  }
] satisfies typeof devicesColumn

export const drawerTitles = {
  video: '实时视频',
  event: '预警列表',
  trend: '趋势统计'
}

export const eventColumn = [
  { label: '事件类型', prop: 'levelType', align: 'center' },
  { label: '监测设备', prop: 'monitoringDevice', align: 'center' },
  { label: '感知设备', prop: 'sensingDevice', align: 'center' },
  { label: '预警时间', prop: 'warningTime', align: 'center' },
  { label: '所属点位', prop: 'owningPoint', align: 'center' },
  { label: '处理状态', prop: 'disposeType', align: 'center', slot: 'disposeType' }
]

export interface InjectData {
  deviceId?: number | string
  deviceName?: string
}

export const DrawerInjectKey = Symbol() as InjectionKey<Ref<InjectData>>

export const FETCH_FAIL_KEY = 'devicesFetchFailCount'

export function generateTempDeviceV2Mock(): DevicesRender[] {
  const rand = (min: number, max: number) => +(Math.random() * (max - min) + min).toFixed(1)
  const makeZones = (base: number) => [
    { id: 'g', name: '全局', maxTemp: rand(base + 20, base + 40), color: '#fe3246', rank: 1 },
    { id: 'a', name: 'A', maxTemp: rand(base, base + 15), color: '#ff9900', rank: 2 },
    { id: 'b', name: 'B', maxTemp: rand(base - 10, base + 5), color: '#67c23a', rank: 3 },
    { id: 'c', name: 'C', maxTemp: rand(base - 12, base + 3), color: '#67c23a', rank: 4 }
  ]

  return Array.from({ length: 20 }).map((_, idx) => {
    const base = 30 + Math.random() * 10
    return {
      id: idx + 1,
      name: `双光摄像头 ${String.fromCharCode(65 + (idx % 26))}${idx >= 26 ? idx - 25 : ''}`,
      online: Math.random() > 0.2,
      power: Math.random() > 0.2,
      zones: makeZones(base),
      warnCounts: Math.floor(Math.random() * 80),
      type: 'camera',
      hasArcFlash: Math.random() > 0.7
    }
  })
}

// 默认导出一份初始数据，用于静态展示或占位
export const tempDeviceV2: DevicesRender[] = generateTempDeviceV2Mock()
