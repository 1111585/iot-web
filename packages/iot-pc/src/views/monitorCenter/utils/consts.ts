export enum MonitorType {
  '可见光' = 1,
  '红外光' = 2
}

export const monitoreTags = [
  {
    title: '告警',
    value: 'msgType',
    active: '0',
    list: [
      { title: '全部', value: '0' },
      { title: '超温事件', value: '2' },
      { title: '电弧闪络', value: '1' }
    ]
  }
]

export const monitorForm = [
  // {
  //   type: 'slot',
  //   label: '选择位置',
  //   prop: 'location',
  //   attrs: {
  //     placeholder: '选择位置'
  //   }
  // },
  // {
  //   type: 'slot',
  //   label: '选择被监控设备',
  //   prop: 'detectDevice',
  //   attrs: {
  //     placeholder: '请选择'
  //   }
  // },
  {
    type: 'input',
    label: '被监控设备',
    prop: 'detectDevice',
    attrs: {
      placeholder: '请选择'
    }
  },
  {
    type: 'slot',
    label: '算法服务器',
    prop: 'aiBox',
    attrs: {
      placeholder: '选择'
    }
  },
  {
    type: 'slot',
    label: '感知设备',
    prop: 'senseDevice',
    attrs: {
      placeholder: '请选择'
    },
    condition: (formData: any) => formData.config === 'light' && formData.aiBox
  },
  {
    type: 'slot',
    label: '感知设备',
    prop: 'infraredSensedDevice',
    attrs: {
      placeholder: '请选择'
    },
    condition: (formData: any) => formData.config === 'infrared' && formData.aiBox
  },
  {
    type: 'input',
    label: '标题',
    prop: 'title',
    attrs: {
      placeholder: '请输入'
    }
  },
  {
    type: 'input',
    label: '备注',
    prop: 'description',
    attrs: {
      type: 'textarea',
      rows: 4,
      placeholder: '请输入'
    }
  }
] as const

export const monitorFormRules = {
  location: [{ required: true, message: '请选择位置', trigger: 'change' }],
  detectDevice: [{ required: true, message: '请选择被监控设备', trigger: 'blur' }],
  senseDevice: [{ required: true, message: '请选择可见光感知设备', trigger: 'blur' }],
  infraredSensedDevice: [{ required: true, message: '请选择红外感知设备', trigger: 'blur' }],
  aiBox: [{ required: true, message: '请选择算法服务器', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
}

// 参数设置 -> 点击感知设备添加的表单（红外、可见光绘制区域左边的表单）
export const monitorAreaForm = [
  {
    type: 'suffix',
    label: '测温距离',
    prop: 'distance',
    unit: 'm',
    attrs: {
      placeholder: '请输入'
    },
    // condition: (formData: any) => formData.config === 'infrared'
    condition: (formData: any) => false
  },
  {
    type: 'suffix',
    label: '一级警报温度',
    prop: 'firstLevel',
    unit: '°C',
    attrs: {
      placeholder: '请输入'
    },
    condition: (formData: any) => formData.config === 'infrared'
  },
  {
    type: 'suffix',
    label: '二级警报温度',
    prop: 'secondLevel',
    unit: '°C',
    attrs: {
      placeholder: '请输入'
    },
    condition: (formData: any) => formData.config === 'infrared'
  },
  {
    type: 'suffix',
    label: '冷却时间',
    prop: 'cd',
    unit: 'S',
    attrs: {
      placeholder: '请输入'
    },
    condition: () => false
  },
  {
    type: 'input',
    label: '置信度阈值',
    // prop: 'thresholdValue',
    prop: 'zxdfz',
    attrs: {
      placeholder: '请输入'
    },
    condition: (formData: any) => formData.config === 'light'
  }
  // {
  //   type: 'slot',
  //   label: '对比区域',
  //   prop: 'contrastArea'
  // }
] as const

export const monitorAreaFormRules = {
  // distance: [{ required: true, message: '请输入测温距离', trigger: 'blur' }],
  firstLevel: [{ required: true, message: '请输入一级警报温度', trigger: 'blur' }],
  secondLevel: [{ required: true, message: '请输入二级警报温度', trigger: 'blur' }],
  // cd: [{ required: true, message: '请输入冷却时间', trigger: 'blur' }],
  // thresholdValue: [{ required: true, message: '请输入置信度阈值', trigger: 'blur' }]
  zxdfz: [{ required: true, message: '请输入置信度阈值', trigger: 'blur' }]
}

// 红外、可见光监控区域的必填字段
export const monitorAreaFormKeys = new Map([
  ['infrared', ['distance', 'firstLevel', 'secondLevel', 'cd']],
  // ['light', ['thresholdValue', 'cd']]
  ['light', ['zxdfz', 'cd']]
])

// 回显测试数据
export const _shapes = [
  {
    points: [
      { x: 143, y: 197.453125 },
      { x: 143, y: 197.453125 },
      { x: 161, y: 306.453125 },
      { x: 161, y: 306.453125 },
      { x: 462, y: 279.453125 },
      { x: 462, y: 279.453125 },
      { x: 441, y: 156.453125 },
      { x: 441, y: 156.453125 },
      { x: 311, y: 241.453125 },
      { x: 311, y: 241.453125 },
      { x: 144, y: 199.453125 },
      { x: 143, y: 197.453125 }
    ],
    offset: { x: 0, y: 0 },
    config: { stroke: 'rgba(123, 230, 135, 1)' }
  },
  {
    points: [
      { x: 117, y: 32.453125 },
      { x: 117, y: 32.453125 },
      { x: 76, y: 139.453125 },
      { x: 76, y: 139.453125 },
      { x: 226, y: 189.453125 },
      { x: 226, y: 189.453125 },
      { x: 255, y: 16.453125 },
      { x: 255, y: 16.453125 },
      { x: 117, y: 35.453125 },
      { x: 117, y: 32.453125 }
    ],
    offset: { x: 0, y: 0 },
    config: { stroke: '#ff6684' }
  }
]
