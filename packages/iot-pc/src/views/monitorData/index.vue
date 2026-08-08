<template>
  <BaseContainer class="tc-container" title="三相电流监测" v-model:box="selectedBox" :boxes="statusBoxes">
    <template #operation>
      <div class="operation-loading" :class="{ active: isFetching }">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span class="loading-text">加载中…</span>
      </div>
    </template>
    <div v-if="isLoading" class="loading-overlay">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>
    <div class="tc-grid">
      <TcDeviceCard v-for="d in filteredDevices" :key="d.id" :device="d"
        @chart="onChart" @config="onConfig" />
      <div v-if="filteredDevices.length === 0" style="width:85vw"><empty /></div>
    </div>

    <el-dialog v-model="configDialog.visible" title="设置告警阈值 & 量程" width="460px" destroy-on-close>
      <el-form :model="configDialog.form" label-width="110px">
        <el-form-item label="A相阈值(A)"><el-input v-model="configDialog.form.alarmAMax" type="number" step="any" /></el-form-item>
        <el-form-item label="B相阈值(A)"><el-input v-model="configDialog.form.alarmBMax" type="number" step="any" /></el-form-item>
        <el-form-item label="C相阈值(A)"><el-input v-model="configDialog.form.alarmCMax" type="number" step="any" /></el-form-item>
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
import { Loading } from '@element-plus/icons-vue'
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import TcDeviceCard from './components/TcDeviceCard.vue'
import IotChart from './components/IotChart.vue'
import { fetchTcDeviceList, updateTcConfig, iotCollList } from './utils'
import type { TcDeviceRes } from './types'

const isFetching = ref(false)
const isLoading = ref(true)
const POLL_INTERVAL = 2000
let pollTimer: ReturnType<typeof setInterval> | null = null

const selectedBox = ref('total')
const statusBoxes = computed(() => {
  const list = iotCollList.value
  const online = list.filter(d => d.onlineState === 1).length
  return [
    { name: '总数', num: list.length, value: 'total', unit: '台', type: 'info' },
    { name: '在线', num: online, value: 'online', unit: '台', type: 'success' },
    { name: '离线', num: list.length - online, value: 'offline', unit: '台', type: 'danger' }
  ]
})

const filteredDevices = computed(() => {
  if (selectedBox.value === 'total') return iotCollList.value
  const online = selectedBox.value === 'online' ? 1 : 0
  return iotCollList.value.filter(d => d.onlineState === online)
})

async function loadData() {
  if (isFetching.value) return
  isFetching.value = true
  try { await fetchTcDeviceList() } catch(e) { console.error(e) }
  finally { isFetching.value = false; isLoading.value = false }
}

const configDialog = reactive({
  visible: false, deviceId: '',
  form: { alarmAMax: '', alarmBMax: '', alarmCMax: '', currentRange: '100' },
  async submit() {
    const f = configDialog.form
    const a = f.alarmAMax !== '' ? +f.alarmAMax : undefined
    const b = f.alarmBMax !== '' ? +f.alarmBMax : undefined
    const c = f.alarmCMax !== '' ? +f.alarmCMax : undefined
    const r = f.currentRange !== '' ? +f.currentRange : undefined
    const ok = await updateTcConfig({ deviceId: configDialog.deviceId, alarmAMax: a, alarmBMax: b, alarmCMax: c, currentRange: r })
    if (ok) { configDialog.visible = false; ElMessage.success('设置已保存'); loadData() }
    else { ElMessage.error('保存失败') }
  }
})

const chartDialog = reactive({ visible: false, title: '', deviceId: '' })

function onChart(d: TcDeviceRes) { chartDialog.visible = true; chartDialog.title = d.deviceName + ' - 三相电流趋势图'; chartDialog.deviceId = d.id }
function onConfig(d: TcDeviceRes) {
  configDialog.visible = true; configDialog.deviceId = d.id
  configDialog.form.alarmAMax = d.alarmAMax ?? ''; configDialog.form.alarmBMax = d.alarmBMax ?? ''
  configDialog.form.alarmCMax = d.alarmCMax ?? ''; configDialog.form.currentRange = d.currentRange ?? '100'
}

onMounted(() => { loadData(); pollTimer = setInterval(loadData, POLL_INTERVAL) })
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })
</script>

<style lang="scss" scoped>
.tc-container { .tc-grid { display: grid; grid-template-columns: repeat(auto-fill, 260px); gap: 24px;
  grid-auto-flow: row; padding: 16px 10px 30px; justify-content: flex-start; } }
.loading-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 32px; color: #409eff; }
.operation-loading { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #999; opacity: 0; transition: opacity .3s;
  &.active { opacity: 1; } }
</style>