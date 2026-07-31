export const areaTabs = [
  {
    title: '所属园区',
    type: 'park'
  },
  {
    title: '所属楼宇',
    type: 'building'
  },
  {
    title: '所属室内',
    type: 'room'
  },
  {
    title: '所属点位',
    type: 'point'
  }
]

export const dialogTitles = {
  park: '所属园区',
  building: '所属楼宇',
  room: '所属室内',
  point: '所属点位'
}

export const parkColumns = [
  { prop: 'id', label: 'ID', hide: true },
  { prop: 'name', label: '园区名称' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'createUser', label: '创建人' },
  { prop: 'operation', label: '操作', slot: 'operation', align: 'center' }
] as const

export const buildingColumns = [
  { prop: 'id', label: 'ID', hide: true },
  { prop: 'name', label: '楼宇名称' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'createUser', label: '创建人' },
  { prop: 'operation', label: '操作', slot: 'operation', align: 'center' }
]

export const roomColumns = [
  { prop: 'id', label: 'ID', hide: true },
  { prop: 'name', label: '室内名称' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'createUser', label: '创建人' },
  { prop: 'operation', label: '操作', slot: 'operation', align: 'center' }
]

export const pointColumns = [
  { prop: 'id', label: 'ID', hide: true },
  { prop: 'name', label: '点位名称' },
  { prop: 'park', label: '所属园区' },
  { prop: 'building', label: '所属楼宇' },
  { prop: 'room', label: '所属室内' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'createUser', label: '创建人' },
  { prop: 'operation', label: '操作', slot: 'operation', align: 'center' }
]
