export const iotCollColumn = [
  { prop: 'deviceName', label: '设备名称', fixed: 'left', slot: 'deviceName', width: '160' },
  { prop: 'ip', label: 'IP地址', align: 'center', width: '150' },
  { prop: 'onlineState', label: '在线状态', align: 'center', width: '100', slot: 'onlineState' },
  { prop: 'currentA', label: 'A相电流(A)', align: 'center', width: '130' },
  { prop: 'currentB', label: 'B相电流(A)', align: 'center', width: '130' },
  { prop: 'currentC', label: 'C相电流(A)', align: 'center', width: '130' },
  { prop: 'lastCollectTime', label: '采集时间', align: 'center', width: '170' },
  { prop: 'opt', label: '操作', align: 'center', slot: 'opt', width: '100' }
]
