export const titles = {
  detectPoint: {
    edit: '点位编辑',
    add: '点位添加'
  }
}

export const tabItems = [
  { title: '本部门', type: '0' },
  { title: '全部', type: '1' }
]

/** 点位管理 */
export const detectPointTag = [
  {
    title: '区域类型',
    value: 'msgType',
    active: '0',
    list: [
      { title: '全部', value: '0' },
      { title: '已监测', value: '1' },
      { title: '未监测', value: '2' }
    ]
  }
]

export const detectPointColumn = [
  { prop: 'id', label: 'ID', hide: true },
  { prop: 'name', label: '点位名称' },
  { prop: 'arcCounts', label: '电弧网络告警数量' },
  { prop: 'levelOneCounts', label: '超温（一级）告警数量' },
  { prop: 'levelTwoCounts', label: '超温（二级）告警数量' },
  { prop: 'description', label: '描述' },
  { prop: 'status', label: '状态', slot: 'status' },
  { prop: 'operation', label: '操作', slot: 'operation' }
] as const

export const detectPointForm = [
  {
    label: '所属园区',
    prop: 'areaName',
    type: 'slot',
    attrs: {
      placeholder: '请输入'
    }
  },
  {
    label: '所属楼宇',
    prop: 'buildingName',
    type: 'slot',
    attrs: {
      placeholder: '请输入'
    }
  },
  {
    label: '所属室内',
    prop: 'roomName',
    type: 'slot',
    attrs: {
      placeholder: '请输入'
    }
  },
  {
    label: '点位名称',
    prop: 'pointName',
    type: 'input',
    attrs: {
      placeholder: '请输入'
    }
  },
  {
    label: '描述',
    prop: 'description',
    type: 'input',
    attrs: {
      type: 'textarea',
      rows: 4,
      placeholder: '请输入'
    }
  }
] as const

export const detectPointFormRules = {
  areaName: [{ required: true, message: '请输入所属园区', trigger: 'blur' }],
  buildingName: [{ required: true, message: '请输入所属楼宇', trigger: 'blur' }],
  roomName: [{ required: true, message: '请输入所属室内', trigger: 'blur' }],
  pointName: [{ required: true, message: '请输入点位名称', trigger: 'blur' }]
}
