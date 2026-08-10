export enum EventType {
  '电弧闪络' = 1,
  '超温事件（一级）' = 2,
  '超温事件（二级）' = 3,
  'CT过流' = 4
}

export enum EventStatus {
  '未处理' = 1,
  '已确认' = 3,
  '已忽略' = 4,
  '已处理' = 2
}

export const statusColor = {
  1: 'primary',
  2: 'success',
  3: 'danger',
  4: 'warning'
}

export const tabItems = [
  { title: '我管理的', type: '0' },
  { title: '全部', type: '1' }
]

export const eventCenterTag = ref([
  {
    title: '预警',
    value: 'msgType',
    active: '0',
    list: [
      { title: '全部', value: '0' },
      { title: '电弧闪络', value: '1' },
      { title: '超温事件（一级）', value: '2' },
      { title: '超温事件（二级）', value: '3' },
      { title: 'CT过流', value: '4' }
    ]
  }
])

export const handleRadios = [
  {
    label: '已处理',
    value: '2'
  },
  {
    label: '已确认',
    value: '3'
  },
  {
    label: '忽略',
    value: '4'
  }
]
