import { ref } from 'vue'

/**
 * 设备列表刷新信号（模块级全局单例）。
 * 处置/删除告警后调用 notifyDeviceListRefresh()，设备列表页 watch 该信号触发刷新，
 * 使卡片红点（未处理告警数）及时更新。
 * 用模块级 ref 而非 pinia，避免引入额外依赖，与 shareDeviceDetail 等现有全局 ref 一致。
 */
export const deviceListRefreshSignal = ref(0)

export function notifyDeviceListRefresh() {
  deviceListRefreshSignal.value++
}
