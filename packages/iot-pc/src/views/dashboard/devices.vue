<template>
  <BaseContainer
    class="devices-container"
    title="弧温监测"
    v-model:box="selectedBox"
    :boxes="deviceStatus"
  >
    <template #box-table>
      <div class="box-table">
        <el-table :data="devicesTableData" border stripe style="width: 100%" size="small">
          <template v-for="col in devicesColumn" :key="col.label">
            <el-table-column
              v-if="col.children"
              :label="col.label"
              :align="col.align"
              :width="col.width"
            >
              <el-table-column
                v-for="child in col.children"
                :key="child.prop"
                :prop="child.prop"
                :label="child.label"
                :align="child.align"
                :width="child.width"
              />
            </el-table-column>
            <el-table-column
              v-else
              :prop="col.prop"
              :label="col.label"
              :align="col.align"
              :width="col.width"
            />
          </template>
        </el-table>
      </div>
    </template>
    <template #operation>
      <div class="operation-loading" :class="{ active: isFetching }">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span class="loading-text" :title="'请求频率' + CFG.requestRate + 'ms/次'">加载中…</span>
      </div>
      <div class="sort-controls">
        <el-dropdown trigger="click" @command="handleSortCommand">
          <el-button size="small" class="win-sort-btn">
            <el-icon><Sort /></el-icon>
            <span class="btn-text">排序</span>
            <el-icon class="el-icon--right" size="12"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu class="win-sort-menu">
              <el-dropdown-item
                command="field:name"
                :class="{ 'is-selected': sortField === 'name' }"
              >
                <span class="dot-icon"></span>
                名称
              </el-dropdown-item>
              <el-dropdown-item
                command="field:time"
                :class="{ 'is-selected': sortField === 'time' }"
              >
                <span class="dot-icon"></span>
                时间
              </el-dropdown-item>
              <el-dropdown-item
                divided
                command="order:asc"
                :class="{ 'is-selected': sortOrder === 'asc' }"
              >
                <span class="dot-icon"></span>
                递增
              </el-dropdown-item>
              <el-dropdown-item
                command="order:desc"
                :class="{ 'is-selected': sortOrder === 'desc' }"
              >
                <span class="dot-icon"></span>
                递减
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
    <div v-if="isLoading" class="loading-overlay">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
    </div>
    <div class="devices-grid">
      <component
        :is="CFG.deviceTheme === 'v2' ? DeviceCardV2 : DeviceCard"
        v-for="device in filteredDevices"
        :key="device.id"
        :device="device"
        :temp-counts="CFG.tempCounts"
        :format-temp="formatTemp"
        @menu-click="onMenuItemClick"
      />
      <div v-if="filteredDevices.length === 0" style="width: 85vw">
        <empty />
      </div>
    </div>
    <!-- 分割线 -->
    <el-drawer size="90%" v-model="drawerVisible" :title="drawerTitle">
      <el-container>
        <el-aside width="200px">
          <el-scrollbar height="90vh">
            <div class="device-list">
              <div
                v-for="device in devices"
                :key="device.id"
                class="device-list-item"
                :class="{ active: drawerState.deviceId === device.id }"
                @click="onDrawerItemClick(device)"
              >
                <div class="device-list-item__header">
                  <div
                    class="device-status-indicator"
                    :class="device.online ? 'online' : 'offline'"
                  ></div>
                  <span class="device-list-item__name">{{ device.name }}</span>
                </div>
                <div class="device-list-item__status">
                  {{ device.online ? '在线' : '离线' }}
                </div>
              </div>
            </div>
          </el-scrollbar>
        </el-aside>
        <el-main style="margin-top: 14px">
          <component :is="drawerComponents[drawerType]" :key="drawerState.deviceId" />
        </el-main>
      </el-container>
    </el-drawer>
    <DetailDialog ref="detailDialogRef">
      <DeviceDetail page="sense" :data="detailDialogData" :activeTab="selectedTabName" />
    </DetailDialog>
  </BaseContainer>

  <!-- <BaseContainer title="设备预警统计">
    <el-table :data="devicesTableData" border stripe style="width: 100%">
      <template v-for="col in devicesColumn" :key="col.label">
        <el-table-column v-if="col.children" :label="col.label" :align="col.align">
          <el-table-column
            v-for="child in col.children"
            :key="child.prop"
            :prop="child.prop"
            :label="child.label"
            :align="child.align"
          />
        </el-table-column>
        <el-table-column v-else :prop="col.prop" :label="col.label" :align="col.align" />
      </template>
    </el-table>
  </BaseContainer> -->
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Loading, Sort, ArrowDown } from '@element-plus/icons-vue'

import BaseContainer from '@/components/renderer/BaseContainer.vue'
// import DataTable from '@/components/renderer/DataTable.vue'
// import DeviceToggleSwitcher from '@/components/form/DeviceToggleSwitcher.vue'
import DetailDialog from '@/views/deviceManage/detail/DetailDialog.vue'
import DeviceDetail from '@/views/deviceManage/detail/DeviceDetail.vue'
import DeviceCard from './components/DeviceCard.vue'
import DeviceCardV2 from './components/DeviceCardV2.vue'
import { findMaxAreaShape, polygonArea } from '@/components/drawing/tools'
import {
  fetchDevices,
  DrawerInjectKey,
  fetchDevicesWarningCounts,
  fetchPrimaryIdByDeviceId,
  fetchWarningStatistics,
  _generateMockDevices,
  FETCH_FAIL_KEY,
  devicesColumn,
  tempDeviceV2,
  generateTempDeviceV2Mock
} from './utils'
import { injectKeys } from '../deviceManage/utils'

import type { DrawShape } from '@/components/drawing/types'
import type { DevicesRender } from './types'

const formatTemp = (temp: number | undefined) =>
  Number.isFinite(temp) ? (temp as number).toFixed(1) : '--'

const TabVideo = defineAsyncComponent(() => import('./components/VideoSection.vue'))
const TabEvent = defineAsyncComponent(() => import('./components/EventSection.vue'))
const TabChart = defineAsyncComponent(() => import('./components/ChartSection.vue'))

const drawerComponents = {
  video: TabVideo,
  event: TabEvent,
  trend: TabChart
}

const isDev = import.meta.env.DEV
// const useMockData = isDev && true
const useMockData = false

const CFG = {
  // 一个 grid 右侧最多显示 x 个温度
  tempCounts: 4,
  // 轮询请求间隔
  requestRate: 3000,
  deviceTheme: 'v2' as 'v1' | 'v2'
}

const colorMaps = {
  0: '#5abd76',
  1: '#f3b5a8',
  2: '#fe3246'
}

const isLoading = ref(false)

const clickedDeviceId = ref<number | null>(null)
let menuCloseTimer: ReturnType<typeof setTimeout> | null = null

const detailDialogRef = ref<InstanceType<typeof DetailDialog>>()
const selectedTabName = ref<string>('')
const detailDialogData = computed(() => detailDialogRef.value?.data)

const drawerVisible = ref(false)
const drawerTitle = ref('')
const drawerType = ref('')
const drawerState = ref({
  deviceId: '' as number | string,
  deviceName: ''
})

provide(DrawerInjectKey, drawerState)
provide(injectKeys.data, drawerState.value)

const onContentClick = (deviceId: number) => {
  // 清除之前的计时器
  if (menuCloseTimer) {
    clearTimeout(menuCloseTimer)
    menuCloseTimer = null
  }

  // 如果点击的是已打开的菜单，则关闭
  if (clickedDeviceId.value === deviceId) {
    clickedDeviceId.value = null
    return
  }

  // 打开新的菜单
  clickedDeviceId.value = deviceId

  // 5秒后自动关闭菜单
  menuCloseTimer = setTimeout(() => {
    clickedDeviceId.value = null
    menuCloseTimer = null
  }, 5000)
}

const closeMenu = () => {
  if (menuCloseTimer) {
    clearTimeout(menuCloseTimer)
    menuCloseTimer = null
  }
  clickedDeviceId.value = null
}

const onMenuItemClick = async (
  type: 'video' | 'event' | 'trend' | 'netInfo' | 'temp',
  device: DevicesRender
) => {
  // 没有布控区域，不打开详情
  if (device.zones.length === 0) return ElMessage.error('暂无布控信息')

  try {
    // 映射菜单项到对应的 tab
    const tabMapping: Record<string, string> = {
      video: 'realTimeVideo', // 实时视频
      event: 'alertInfo', // 告警记录
      trend: 'chart-device', // 设备态势
      netInfo: 'netInfo',
      temp: 'chart-temp'
    }

    selectedTabName.value = tabMapping[type]

    const data = await fetchPrimaryIdByDeviceId(device.id)

    // 打开详情弹窗
    detailDialogRef.value?.open('感知设备详情', {
      deviceId: device.id,
      id: data,
      name: device.name,
      online: device.online,
      power: device.power,
      zones: device.zones
    })

    closeMenu()
  } catch (error) {
    console.log(error)
  }
}

const onDrawerItemClick = (device: DevicesRender) => {
  drawerState.value.deviceId = device.id
  drawerState.value.deviceName = device.name
}

const selectedBox = ref('total')

const deviceStatus = ref([
  { name: '总数', num: 0, value: 'total', unit: '台', type: 'primary' },
  { name: '在线', num: 0, value: 'online', unit: '台', type: 'success' },
  { name: '离线', num: 0, value: 'offline', unit: '台', type: 'danger' }
])

const devices = ref<DevicesRender[]>([])
const sortField = ref<'name' | 'time'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const tableColumns = ref([...devicesColumn])
let draggedColumnIndex: number | null = null

const handleColumnDragStart = (index: number) => {
  draggedColumnIndex = index
}

const handleColumnDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
}

const handleColumnDrop = (targetIndex: number) => {
  if (draggedColumnIndex === null || draggedColumnIndex === targetIndex) return

  const draggedColumn = tableColumns.value[draggedColumnIndex]
  tableColumns.value.splice(draggedColumnIndex, 1)
  tableColumns.value.splice(targetIndex, 0, draggedColumn)
  draggedColumnIndex = null
}

const handleSortCommand = (command: string) => {
  const [type, value] = command.split(':')
  if (type === 'field') {
    sortField.value = value as 'name' | 'time'
  } else if (type === 'order') {
    sortOrder.value = value as 'asc' | 'desc'
  }
}

const filteredDevices = computed(() => {
  let list = devices.value

  if (selectedBox.value === 'online') {
    list = devices.value.filter((device) => device.online)
  } else if (selectedBox.value === 'offline') {
    list = devices.value.filter((device) => !device.online)
  }

  const locale = 'zh-Hans-CN'
  const opts: Intl.CollatorOptions = { numeric: true, sensitivity: 'base' }
  return [...list].sort((a, b) => {
    if (sortField.value === 'name') {
      return (
        (a.name || '').localeCompare(b.name || '', locale, opts) *
        (sortOrder.value === 'asc' ? 1 : -1)
      )
    }

    const aTime = (a as any).time ?? a.id ?? 0
    const bTime = (b as any).time ?? b.id ?? 0
    return (aTime === bTime ? 0 : aTime > bTime ? 1 : -1) * (sortOrder.value === 'asc' ? 1 : -1)
  })
})

const devicesTableData = ref()

const fetchFailCount = ref<number>(Number(sessionStorage.getItem(FETCH_FAIL_KEY)) || 0)
let pollTimer: ReturnType<typeof setInterval> | null = null
const isFetching = ref(false)

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

const recordFail = () => {
  const next = fetchFailCount.value + 1
  fetchFailCount.value = next
  sessionStorage.setItem(FETCH_FAIL_KEY, `${next}`)
  if (next >= 5) {
    stopPolling()
  }
}

// 获取设备列表
const loadDevices = async (showLoading = false) => {
  if (fetchFailCount.value >= 5) {
    stopPolling()
    return
  }

  if (isFetching.value) return

  if (showLoading) {
    isLoading.value = true
  }

  isFetching.value = true

  try {
    const res = await fetchDevices()
    if (!res) return

    /**
     * 模拟数据
     */
    let rawData = res.raw
    if (useMockData) {
      rawData = _generateMockDevices()
    }

    const countsRes = await fetchDevicesWarningCounts()
    const countsRaw = countsRes?.raw

    const statusMap = new Map<
      string,
      { name: string; num: number; value: string; unit: string; type: string }
    >()
    statusMap.set('total', { name: '总数', num: 0, value: 'total', unit: '台', type: 'info' })
    statusMap.set('online', {
      name: '在线',
      num: 0,
      value: 'online',
      unit: '台',
      type: 'success'
    })
    statusMap.set('offline', {
      name: '离线',
      num: 0,
      value: 'offline',
      unit: '台',
      type: 'danger'
    })

    let total = 0
    rawData.deviceOnline.forEach((item) => {
      const key = +item.online ? 'online' : 'offline'
      const num = +item.num
      statusMap.get(key)!.num = num
      total += num
    })

    statusMap.get('total')!.num = total

    deviceStatus.value = Array.from(statusMap.values())

    devices.value = rawData.deviceRealTimeInfo.map((item, index) => {
      const zonesWithArea = item.sensingDeviceRealTimeVoList.map((zone) => {
        const parseTemp = (v: unknown) =>
          v === null || v === undefined || v === '' ? undefined : +(+v as number).toFixed(1)
        let parsed: DrawShape | null = null
        if (typeof zone.drawCfg === 'string') {
          try {
            parsed = JSON.parse(zone.drawCfg)
          } catch (error) {
            parsed = null
          }
        } else if (zone.drawCfg && typeof zone.drawCfg === 'object') {
          parsed = zone.drawCfg as DrawShape
        }

        const points = Array.isArray(parsed?.points) ? parsed!.points : null
        const area = points ? polygonArea(points) : 0

        return {
          id: zone.detZonesId,
          name: zone.deviceName,
          maxTemp: +(+zone.maxTemp).toFixed(1),
          color: colorMaps[zone.tempLevel] || colorMaps[0],
          oneTemp: parseTemp(zone.oneTemp),
          twoTemp: parseTemp(zone.twoTemp),
          area
        }
      })

      // 计算面积排名，面积为 0 的排在末尾
      const rankedZones = (() => {
        const sorted = [...zonesWithArea].sort((a, b) => b.area - a.area)
        const rankMap = new Map(sorted.map((z, idx) => [z.id, z.area > 0 ? idx + 1 : 0]))
        return zonesWithArea.map((z) => ({ ...z, rank: rankMap.get(z.id) || 0 }))
      })()

      const warnInfoFromApi = countsRaw?.find((itemCount) => item.deviceId == itemCount.deviceId)
      const warnCountFromApi = warnInfoFromApi?.num
      const hasArcFlash = warnInfoFromApi?.levelType === 1

      return {
        id: item.sensingDeviceRealTimeVoList[0]?.deviceId as unknown as number,
        name: item.deviceName,
        online: !!item.zt,
        power: !!item.zt,
        zones: rankedZones,
        warnCounts: warnCountFromApi ?? (item as any).warnCounts ?? 0,
        hasArcFlash
      }
    })

    // console.log('[设备列表]格式化之后\n', devices.value)
  } catch (error) {
    recordFail()
    console.log(error)
  } finally {
    isFetching.value = false
    if (showLoading) {
      isLoading.value = false
    }
  }
}

const loadWarningStatistics = async () => {
  try {
    const res = await fetchWarningStatistics()
    if (!res) return
    const rawData = res.raw
    const today = new Date().toISOString().split('T')[0]

    const todayRows = rawData.filter((item) => item.date === today)

    if (!todayRows.length) {
      devicesTableData.value = [
        {
          date: today,
          arcFlashCount: 0,
          arcFlashResolvedCount: 0,
          arcFlashUnresolvedCount: 0,
          overTemperatureCount: 0,
          overTemperatureResolvedCount: 0,
          overTemperatureUnresolvedCount: 0,
          overTemperatureLevel2Count: 0,
          overTemperatureLevel2ResolvedCount: 0,
          overTemperatureLevel2UnresolvedCount: 0
        }
      ]
      return
    }

    devicesTableData.value = todayRows.map((item) => ({
      date: item.date,
      arcFlashCount: item.arcFlashEventTotal,
      arcFlashResolvedCount: item.arcFlashEventProcessed,
      arcFlashUnresolvedCount: item.arcFlashEventUnprocessed,
      overTemperatureCount: item.overtempLevel1Total,
      overTemperatureResolvedCount: item.overtempLevel1Processed,
      overTemperatureUnresolvedCount: item.overtempLevel1Unprocessed,
      overTemperatureLevel2Count: item.overtempLevel2Total,
      overTemperatureLevel2ResolvedCount: item.overtempLevel2Processed,
      overTemperatureLevel2UnresolvedCount: item.overtempLevel2Unprocessed
    }))
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  loadDevices(true)
  loadWarningStatistics()

  if (fetchFailCount.value < 5) {
    pollTimer = setInterval(() => {
      loadDevices()
      loadWarningStatistics()
    }, CFG.requestRate)
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped lang="scss">
.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 260px);
  gap: 24px;
  grid-auto-flow: row;
  margin-top: 16px;
  padding: 0 10px 30px;
  width: 100%;
  box-sizing: border-box;
  justify-content: flex-start;
}

.device-status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;

  &.online {
    background-color: #67c23a;
    box-shadow: 0 0 6px rgba(103, 194, 58, 0.6);
  }

  &.offline {
    background-color: #f56c6c;
    box-shadow: 0 0 6px rgba(245, 108, 108, 0.6);
  }
}
.device-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  height: 100%;
  overflow-y: auto;
}

.device-list-item {
  padding: 12px;
  border-radius: 6px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;

  &:hover {
    background: #e8f4f8;
    transform: translateX(4px);
  }

  &.active {
    background: #e6f7ff;
    border-left-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  &__name {
    font-size: 13px;
    font-weight: 500;
    color: #333;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__status {
    font-size: 12px;
    color: #666;
    padding-left: 20px;
  }
}

.devices-container {
  position: relative;
  // height: 93vh;
  overflow-y: auto;
  background-color: #fff !important;

  &:deep(.el-drawer__header) {
    padding: 10px 20px;
    margin: 0;
    background: linear-gradient(135deg, #384274 0%, #2d3456 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .el-drawer__title {
      color: #ffffff;
      font-weight: 600;
      font-size: 16px;
    }

    .el-drawer__close {
      color: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;

      &:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

.sort-controls {
  .el-button {
    border: none !important;

    &:hover {
      background: #f3f3f3 !important;
      color: #000 !important;
    }
  }
}

.win-sort-btn {
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 15px;
  padding: 4px 12px;
  height: 32px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #e5e5e5;
    color: #000;
  }

  .btn-text {
    font-size: 13px;
    margin: 0 4px;
  }

  .el-icon {
    font-size: 14px;
  }
}

.win-sort-menu {
  padding: 4px 0;
  min-width: 140px;

  :deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    font-size: 13px;
    position: relative;
    padding-left: 32px;

    .dot-icon {
      position: absolute;
      left: 12px;
      width: 4px;
      height: 4px;
      background: transparent;
      border-radius: 50%;
    }

    &.is-selected {
      background-color: transparent !important;
      color: inherit;

      .dot-icon {
        background: #333;
      }
    }

    &:hover {
      background-color: #f0f0f0 !important;
    }

    &.el-dropdown-menu__item--divided {
      margin-top: 4px;
      &::before {
        margin: 0 4px;
      }
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 100;
  border-radius: 4px;

  .is-loading {
    font-size: 40px;
    color: #409eff;
    animation: spin 1s linear infinite;
  }
}

.operation-loading {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #bfc4cc;
  font-size: 13px;
  transition:
    color 0.35s ease,
    opacity 0.35s ease;
  opacity: 0.6;

  .is-loading {
    font-size: 18px;
    color: #cfd3dc;
    transition: color 0.35s ease;
  }

  .loading-text {
    color: inherit;
    transition:
      color 0.35s ease,
      opacity 0.35s ease;
    opacity: 0.9;
  }
}

.operation-loading.active {
  color: #409eff;
  opacity: 1;

  .is-loading {
    color: #409eff;
  }

  .loading-text {
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.box-table {
  &:deep(.el-table) {
    .el-table__header {
      .cell {
        font-size: 12px;
        font-weight: normal;
      }
    }

    .el-table__row {
      font-size: 14px;
      font-weight: 600;
    }
    .el-table__cell {
      padding: 1px !important;
    }
  }
}
</style>
