/**
 * 循环渲染所需要的常量
 * - aiBox：算法服务器
 * - detectDevice：被监测的设备
 * - senseDevice：感知设备
 * - deployDevice：布控设备（暂时没有启用，后续继续不用应该删除）
 */

export const tabItems = [
  { title: '本部门', type: '0' },
  { title: '全部', type: '1' }
]

export const titles = {
  aiBox: {
    edit: '算法服务器编辑',
    add: '算法服务器添加'
  },
  detectDevice: {
    edit: '编辑被监测的设备',
    add: '添加被监测的设备'
  },
  senseDevice: {
    edit: '感知设备编辑',
    add: '感知设备添加'
  },
  deployDevice: {
    edit: '布控设备编辑',
    add: '布控设备添加'
  }
}

/**
 * <tag-panel> 组件用的数据
 *
 * - active: 当前激活的tag，对应list中的value
 */
export const aiBoxTag = [
  {
    title: '信息类型',
    value: 'msgType',
    active: '0',
    list: [
      { title: '全部', value: '0' },
      { title: '超温事件', value: '1' },
      { title: '电弧闪络', value: '2' }
    ]
  }
]
export const detectDeviceTag = [
  {
    title: '信息类型',
    value: 'msgType',
    active: '',
    list: [
      { title: '全部', value: '' },
      { title: '未监测', value: '0' },
      { title: '已监测', value: '1' }
    ]
  }
]
export const senceDeviceTag = [
  {
    title: '',
    value: 'msgType',
    active: '0',
    list: [
      { title: '全部', value: '0' },
      { title: '可见光', value: '1' },
      { title: '红外', value: '2' },
      { title: '可见光&红外', value: '3' }
    ]
  }
]

export const deployDeviceTag = [
  {
    title: '告警',
    value: 'msgType',
    active: '0',
    list: [
      { title: '全部', value: '0' },
      { title: '超温事件', value: '1' },
      { title: '电弧闪络', value: '2' }
    ]
  }
]

/** <el-table> <el-table-column> 组件用的数据 */
export const aiBoxColumn = [
  { prop: 'name', label: '算法服务器名称', slot: 'name', width: '250' },
  {
    prop: 'connectedness',
    label: '服务器状态',
    slot: 'connectedness',
    align: 'center',
    width: '120'
  },
  // { prop: 'deviceId', label: '设备ID', width: '120' },
  { prop: 'deviceCode', label: '设备编码', width: '120' },
  { prop: 'version', label: '算法服务器版本', align: 'center' },
  { prop: 'installationPosition', label: '安装位置', width: '350', align: 'center' },
  { prop: 'ability', label: '能力', slot: 'ability' },
  { prop: 'status', label: '启用状态', slot: 'status', align: 'center' },
  {
    prop: 'operation',
    label: '操作',
    slot: 'operation',
    align: 'center',
    width: '100',
    fixed: 'right'
  }
] as const

export const detectDeviceColumn = [
  { prop: 'id', label: 'ID', hide: true },
  {
    prop: 'senseName',
    label: '关联的感知设备名称',
    width: '180'
  },
  { prop: 'name', label: '设备名称', slot: 'name', width: '180' },
  { prop: 'alarm', label: '异常告警', align: 'center', width: '100' },
  { prop: 'deviceId', label: '设备ID', align: 'center' },
  { prop: 'addDate', label: '添加时间', width: '120' },
  { prop: 'location', label: '位置', width: '250' },
  { prop: 'detectContent', label: '检测内容', slot: 'detectContent' },
  { prop: 'status', label: '启用状态', slot: 'status', align: 'center', width: '100' },
  {
    prop: 'operation',
    label: '操作',
    slot: 'operation',
    align: 'center',
    width: '100',
    fixed: 'right'
  }
] as const

export const senceDeviceColumn = [
  { prop: 'id', label: 'ID', hide: true },
  { prop: 'name', label: '设备名称', slot: 'name' },
  {
    prop: 'connectedness',
    label: '设备连通性',
    slot: 'connectedness',
    width: '100',
    align: 'center'
  },
  { prop: 'alarm', label: '异常告警', align: 'center', width: '100' },
  // { prop: 'deviceId', label: '设备ID', align: 'center' },
  // { prop: 'addDate', label: '添加时间' },
  { prop: 'deviceCode', label: '设备SN编码', align: 'center' },
  { prop: 'location', label: '位置', width: '250' },
  { prop: 'detectContent', label: '类型', slot: 'detectContent', align: 'center', width: '120' },
  { prop: 'status', label: '启用状态', slot: 'status', align: 'center', width: '100' },
  {
    prop: 'operation',
    label: '操作',
    slot: 'operation',
    align: 'center',
    width: '100',
    fixed: 'right'
  }
] as const

/** <el-form> <el-form-item> 组件用的数据 */

export const aiBoxForm = [
  {
    label: '算法服务器名称',
    prop: 'boxName',
    type: 'input',
    attrs: {
      placeholder: '请输入'
    }
  },
  // {
  //   label: '设备ID',
  //   prop: 'deviceId',
  //   type: 'input',
  //   attrs: {
  //     placeholder: '请输入'
  //   }
  // },
  {
    label: '设备编码',
    prop: 'deviceCode',
    type: 'input',
    attrs: {
      placeholder: '请输入'
    }
  },
  // {
  //   label: '绑定位置',
  //   prop: 'location',
  //   type: 'input',
  //   // type: 'slot',
  //   attrs: {
  //     placeholder: '请输入'
  //   }
  // },
  {
    label: '安装位置',
    prop: 'installationPosition',
    type: 'input',
    attrs: {
      placeholder: '请输入'
    }
  },
  // 先隐藏，默认传1
  // {
  //   label: '分析能力',
  //   prop: 'ability',
  //   type: 'radio-group',
  //   options: [
  //     { label: '超温事件', value: 1 },
  //     { label: '电弧闪络', value: 2 }
  //   ],
  //   attrs: {
  //     placeholder: '请选择'
  //   }
  // },
  {
    label: '二维码',
    prop: 'image',
    type: 'upload',
    limit: 1,
    accept: 'image/png,image/jpeg',
    listType: 'picture',
    multiple: true,
    attrs: {
      placeholder: '请选择'
    }
  },
  {
    label: '版本号',
    prop: 'version',
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
  },
  {
    label: '配置',
    prop: 'config',
    type: 'radio-group',
    options: [
      { label: '自动获取', value: 'auto' },
      { label: '手动配置', value: 'manual' }
    ],
    attrs: {
      placeholder: '请选择'
    }
  },
  {
    label: 'IP地址',
    prop: 'ip',
    type: 'input',
    attrs: {
      placeholder: '请输入IP地址'
    },
    condition: (formData: any) => formData.config === 'manual'
  },
  {
    label: '子网掩码',
    prop: 'mask',
    type: 'input',
    attrs: {
      placeholder: '请输入子网掩码'
    },
    condition: (formData: any) => formData.config === 'manual'
  },
  {
    label: '默认网关',
    prop: 'gateway',
    type: 'input',
    attrs: {
      placeholder: '请输入默认网关'
    },
    condition: (formData: any) => formData.config === 'manual'
  }
] as const

export const aiBoxFormRules = {
  boxName: [{ required: true, message: '请输入算法服务器名称', trigger: 'blur' }],
  deviceId: [{ required: true, message: '请输入设备ID', trigger: 'blur' }],
  deviceCode: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
  // location: [{ required: true, message: '请输入绑定位置', trigger: 'blur' }],
  installationPosition: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
  // ability: [{ required: true, message: '请选择分析能力', trigger: 'change' }],
  ip: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
  mask: [{ required: true, message: '请输入子网掩码', trigger: 'blur' }],
  gateway: [{ required: true, message: '请输入默认网关', trigger: 'blur' }]
  // image: [{ required: true, message: '请选择设备图片', trigger: 'change' }]
  // description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
}

export const detectDeviceForm = [
  {
    label: '设备名称',
    prop: 'deviceName',
    type: 'input',
    attrs: {
      placeholder: '请输入'
    }
  },
  {
    label: '设备ID',
    prop: 'deviceId',
    type: 'input',
    attrs: {
      placeholder: '请输入'
    }
  },
  {
    label: '设备编码',
    prop: 'deviceCode',
    type: 'input',
    attrs: {
      placeholder: '请输入'
    }
  },
  {
    label: '安装位置',
    prop: 'location',
    type: 'slot',
    attrs: {
      placeholder: '请输入'
    }
  },
  {
    label: '设备类型',
    prop: 'deviceType',
    type: 'slot',
    attrs: {
      placeholder: '请输入'
    }
  },
  {
    label: '监测内容',
    prop: 'detectContent',
    type: 'checkbox-group',
    options: [
      { label: '电弧闪络', value: '1' },
      { label: '超温', value: '2' }
    ],
    attrs: {
      placeholder: '请选择'
    }
  },
  {
    label: '设备图片',
    prop: 'image',
    type: 'upload',
    limit: 1,
    accept: 'image/png',
    listType: 'picture',
    attrs: {
      placeholder: '请选择'
    }
  },
  {
    label: '描述',
    prop: 'description',
    type: 'input',
    attrs: {
      rows: 4,
      type: 'textarea',
      placeholder: '请输入'
    }
  }
] as const

export const detectDeviceFormRules = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  deviceId: [{ required: true, message: '请输入设备ID', trigger: 'blur' }],
  deviceCode: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
  location: [{ required: true, message: '请输入绑定位置', trigger: 'blur' }],
  deviceType: [{ required: true, message: '请输入设备类型', trigger: 'blur' }],
  detectContent: [{ required: true, message: '请输入监测内容', trigger: 'blur' }]
}

export const senceDeviceForm = [
  {
    label: '设备名称',
    prop: 'deviceName',
    type: 'input',
    attrs: {
      placeholder: '请输入'
    }
  },
  // {
  //   label: '设备ID',
  //   prop: 'deviceId',
  //   type: 'input',
  //   attrs: {
  //     placeholder: '请输入'
  //   }
  // },
  {
    label: '设备SN编码',
    prop: 'deviceCode',
    type: 'input',
    attrs: {
      placeholder: '请输入'
    }
  },
  {
    label: '绑定位置',
    prop: 'location',
    // type: 'input',
    type: 'slot',
    attrs: {
      placeholder: '请输入'
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
    label: '类型',
    prop: 'deviceType',
    type: 'radio-group',
    options: [
      { label: '可见光', value: '1' },
      { label: '红外', value: '2' },
      { label: '可见光&红外', value: '3' }
    ],
    attrs: {
      placeholder: '请选择'
    }
  },
  // {
  //   label: '设备图片',
  //   prop: 'image',
  //   type: 'upload',
  //   limit: 1,
  //   accept: 'image/png',
  //   listType: 'picture',
  //   attrs: {
  //     placeholder: '请选择'
  //   }
  // },
  {
    label: '内网地址',
    prop: 'lan',
    type: 'slot',
    attrs: {
      placeholder: '请输入'
    }
  },
  {
    label: '外网地址',
    prop: 'wan',
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

export const senceDeviceFormRules = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  deviceId: [{ required: true, message: '请输入设备ID', trigger: 'blur' }],
  deviceCode: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
  location: [{ required: true, message: '请输入绑定位置', trigger: 'blur' }],
  deviceType: [{ required: true, message: '请输入设备类型', trigger: 'blur' }],
  lan: [{ required: true, message: '请输入内网地址', trigger: 'blur' }],
  aiBox: [{ required: true, message: '请选择算法服务器', trigger: 'blur' }]
  // wan: [{ required: true, message: '请输入外网地址', trigger: 'blur' }]
}

export const deviceDetailColumns = [
  {
    label: '设备名称',
    prop: 'name'
  },
  {
    label: '设备ID',
    prop: 'deviceId'
  },
  {
    label: '设备编号',
    prop: 'deviceCode'
  },
  {
    label: '绑定位置',
    prop: 'location'
  },
  {
    label: '添加时间',
    prop: 'addDate'
  },
  {
    label: '添加人',
    prop: 'contact'
  },
  {
    label: '描述',
    prop: 'description'
  },
  {
    label: '设备图片',
    prop: 'img'
  }
]

export const senseDeviceDetailColumns = [
  {
    label: '设备名称',
    prop: 'name'
  },
  {
    label: '算法服务器',
    prop: 'aiBoxName'
  },
  {
    label: '设备SN编号',
    prop: 'deviceCode'
  },
  {
    label: '绑定位置',
    prop: 'location'
  },
  {
    label: '添加时间',
    prop: 'addDate'
  },
  {
    label: '添加人',
    prop: 'contact'
  },
  {
    label: '描述',
    prop: 'description'
  }
  // {
  //   label: '设备图片',
  //   prop: 'img'
  // }
]

export const treeProps = {
  children: 'children',
  label: 'deviceName'
}
