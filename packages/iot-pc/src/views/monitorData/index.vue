<template>
  <BaseContainer class="ct-container" title="三相电流监测" v-model:box="selectedBox" :boxes="statusBoxes">
    <template #operation>
      <div class="operation-loading" :class="{ active: isFetching }">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span class="loading-text">加载中…</span>
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
              <el-dropdown-item command="field:name" :class="{ 'is-selected': sortField === 'name' }">
                <span class="dot-icon"></span>名称
              </el-dropdown-item>
              <el-dropdown-item command="field:time" :class="{ 'is-selected': sortField === 'time' }">
                <span class="dot-icon"></span>时间
              </el-dropdown-item>
              <el-dropdown-item divided command="order:asc" :class="{ 'is-selected': sortOrder === 'asc' }">
                <span class="dot-icon"></span>递增
              </el-dropdown-item>
              <el-dropdown-item command="order:desc" :class="{ 'is-selected': sortOrder === 'desc' }">
                <span class="dot-icon"></span>递减
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
    <div v-if="isLoading" class="loading-overlay">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>
    <div class="ct-grid">
      <CtDeviceCard v-for="d in filteredDevices" :key="d.id" :device="d" @chart="onChart" @config="onConfig" />
      <div v-if="filteredDevices.length === 0" style="width:85vw"><empty /></div>
    </div>

    <el-dialog v-model="configDialog.visible" title="设置告警阈值 & 量程" width="460px" destroy-on-close>
      <el-form :model="configDialog.form" label-width="110px">
        <el-form-item label="A相阈值(A)"><el-input v-model="configDialog.form.alarmAMax" type="number" step="any" /></el-form-item>
        <el-form-item label="B相阈值(A)"><el-input v-model="configDialog.form.alarmBMax" type="number" step="any" /></el-form-item>
        <el-form-item label="C相阈值(A)"><el-input v-model="configDialog.form.alarmCMax" type="number" step="any" /></el-form-item>
        <el-form-item label="O相阈值(A)"><el-input v-model="configDialog.form.alarmOMax" type="number" step="any" /></el-form-item>
        <el-form-item label="进度条量程(A)"><el-input v-model="configDialog.form.currentRange" type="number" step="any" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="configDialog.submit">确定</el-button>
        <el-button @click="configDialog.visible=false">取消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="chartDialog.visible" :title="chartDialog.title" width="1000px" destroy-on-close>
      <IotChart :title="chartDialog.title" :device-id="chartDialog.deviceId" />
    </el-dialog>
  </BaseContainer>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Sort, ArrowDown } from '@element-plus/icons-vue'
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import CtDeviceCard from './components/CtDeviceCard.vue'
import IotChart from './components/IotChart.vue'
import { fetchCtDeviceList, updateCtConfig, iotCollList } from './utils'
import type { CtDeviceRes } from './types'

const isFetching = ref(false)
const isLoading = ref(true)
const POLL_INTERVAL = 2000
let pollTimer: ReturnType<typeof setInterval> | null = null

const selectedBox = ref('total')
const sortField = ref<'name' | 'time'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const statusBoxes = computed(() => {
  const list = iotCollList.value
  const online = list.filter(d => d.onlineState === 1).length
  return [
    { name: '总数', num: list.length, value: 'total', unit: '台', type: 'info' },
    { name: '在线', num: online, value: 'online', unit: '台', type: 'success' },
    { name: '离线', num: list.length - online, value: 'offline', unit: '台', type: 'danger' }
  ]
})

const handleSortCommand = (command: string) => {
  const [type, value] = command.split(':')
  if (type === 'field') sortField.value = value as 'name' | 'time'
  else if (type === 'order') sortOrder.value = value as 'asc' | 'desc'
}

const filteredDevices = computed(() => {
  let list = iotCollList.value
  if (selectedBox.value === 'online') list = list.filter(d => d.onlineState === 1)
  else if (selectedBox.value === 'offline') list = list.filter(d => d.onlineState !== 1)
  const locale = 'zh-Hans-CN'
  const rev = sortOrder.value === 'desc' ? -1 : 1
  return [...list].sort((a, b) => {
    if (sortField.value === 'name')
      return (a.deviceName || '').localeCompare(b.deviceName || '', locale) * rev
    const aTime = new Date(a.createTime || 0).getTime()
    const bTime = new Date(b.createTime || 0).getTime()
    return (aTime - bTime) * rev
  })
})

async function loadData() {
  if (isFetching.value) return
  isFetching.value = true
  try { await fetchCtDeviceList() } catch(e) { console.error(e) }
  finally { isFetching.value = false; isLoading.value = false }
}

const configDialog = reactive({
  visible: false, deviceId: '',
  form: { alarmAMax: '', alarmBMax: '', alarmCMax: '', alarmOMax: '', currentRange: '100' },
  async submit() {
    const f = configDialog.form
    const a = f.alarmAMax !== '' ? +f.alarmAMax : undefined
    const b = f.alarmBMax !== '' ? +f.alarmBMax : undefined
    const c = f.alarmCMax !== '' ? +f.alarmCMax : undefined
    const o = f.alarmOMax !== '' ? +f.alarmOMax : undefined
    const r = f.currentRange !== '' ? +f.currentRange : undefined
    const ok = await updateCtConfig({ deviceId: configDialog.deviceId, alarmAMax: a, alarmBMax: b, alarmCMax: c, alarmOMax: o, currentRange: r })
    if (ok) { configDialog.visible = false; ElMessage.success('设置已保存'); loadData() }
    else { ElMessage.error('保存失败') }
  }
})

const chartDialog = reactive({ visible: false, title: '', deviceId: '' })
function onChart(d: CtDeviceRes) { chartDialog.visible = true; chartDialog.title = d.deviceName + ' - 四相电流趋势图'; chartDialog.deviceId = d.id }
function onConfig(d: CtDeviceRes) {
  configDialog.visible = true; configDialog.deviceId = d.id
  configDialog.form.alarmAMax = d.alarmAMax ?? ''; configDialog.form.alarmBMax = d.alarmBMax ?? ''
  configDialog.form.alarmCMax = d.alarmCMax ?? ''; configDialog.form.alarmOMax = d.alarmOMax ?? ''; configDialog.form.currentRange = d.currentRange ?? '100'
}

onMounted(() => { loadData(); pollTimer = setInterval(loadData, POLL_INTERVAL) })
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })
</script>

<style lang="scss" scoped>
.ct-container { .ct-grid { display: grid; grid-template-columns: repeat(auto-fill, 260px); gap: 24px;
  grid-auto-flow: row; padding: 16px 10px 30px; justify-content: flex-start; } }
.sort-controls {
  margin-left: auto;
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
.loading-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 32px; color: #409eff; }
.operation-loading { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #999; opacity: 0; transition: opacity .3s;
  &.active { opacity: 1; } }
</style>