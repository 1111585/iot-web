import type { InjectionKey} from 'vue'
import type { DeviceDetailRes } from '../types'


export const injectKeys = {
  page: Symbol() as InjectionKey<ARC.MonitorDeviceType>,
  data: Symbol() as InjectionKey<ARC.AnyObj>
} 

/**
 * 多子组件使用的共享数据
 */
export const shareDeviceDetail = ref<DeviceDetailRes | null>(null)

/**
 * 给<tab-box>组件用的数据，num为变动值，value和后端返回值绑定，方便组件渲染
 */

export const aiBoxBoxItems = ref([
  { name: '总数', num: 0, type: 'info', value: 'total', unit: '个' },
  { name: '启用', num: 0, type: 'success', value: 'enable', unit: '个' },
  { name: '禁用', num: 0, type: 'danger', value: 'dis_enable', unit: '个' }
])

export const detectDeviceBoxItems = ref([
  { name: '总数', num: 0, type: 'info', value: 'total', unit: '个' },
  { name: '超温事件监测', num: 0, type: 'success', value: 'over_temperature', unit: '个' },
  { name: '电弧闪络监测', num: 0, type: 'danger', value: 'arc_flare', unit: '个' }
])

export const senseDeviceBoxItems = ref([
  { name: '总数', num: 0, type: 'info', value: 'total', unit: '个' },
  { name: '启用', num: 0, type: 'success', value: 'enable', unit: '个' },
  { name: '禁用', num: 0, type: 'danger', value: 'dis_enable', unit: '个' }
])
