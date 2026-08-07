<template>
  <BaseContainer class="monitor-data">
    <DataTable
      v-model:page-num="iotCollQuery.pageNum"
      :columns="iotCollColumn"
      :data="iotCollList"
      :total="iotCollTotal"
      :table-row-class-name="tableRowClassName"
      :key="forceKey"
    >
      <template #deviceName="{ row }">
        <span class="link" @click="onTitleClick(row)">{{ row.deviceName }}</span>
      </template>
      <template #onlineState="{ row }">
        <el-tag :type="row.onlineState === 1 ? 'success' : 'danger'" size="small">
          {{ row.onlineState === 1 ? '在线' : '离线' }}
        </el-tag>
      </template>
      <template #opt="{ row }">
        <el-button size="small" @click="setThreshold(row)">设置阈值</el-button>
      </template>
    </DataTable>

    <el-dialog v-model="dialogState.visible" title="设置告警阈值" width="500px" destroy-on-close draggable @close="dialogState.cancel()">
      <el-form ref="formRef" :model="dialogState.formData" label-width="100px" style="padding-right: 20px">
        <el-form-item label="A相阈值(A)" prop="thresholdA">
          <el-input v-model="dialogState.formData.thresholdA" type="number" placeholder="A相电流上限" />
        </el-form-item>
        <el-form-item label="B相阈值(A)" prop="thresholdB">
          <el-input v-model="dialogState.formData.thresholdB" type="number" placeholder="B相电流上限" />
        </el-form-item>
        <el-form-item label="C相阈值(A)" prop="thresholdC">
          <el-input v-model="dialogState.formData.thresholdC" type="number" placeholder="C相电流上限" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="dialogState.submit()">确定</el-button>
        <el-button @click="dialogState.cancel()">取消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="chartDialog.visible" :title="chartDialog.title" width="1000px" destroy-on-close draggable>
      <IotChart :title="chartDialog.title" :device-id="chartDialog.data.id" />
    </el-dialog>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import DataTable from '@/components/renderer/DataTable.vue'
import IotChart from './components/IotChart.vue'
import { fetchTcDeviceList, iotCollColumn, iotCollList, iotCollTotal, iotCollQuery } from './utils'

const forceKey = ref(0)
const isFetching = ref(false)
const TC_THRESHOLD_KEY = 'tc_threshold'
const POLL_INTERVAL = 2000

let pollTimer: ReturnType<typeof setInterval> | null = null
const stopPolling = () => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

async function loadData() {
  if (isFetching.value) return
  isFetching.value = true
  try { await fetchTcDeviceList() }
  catch (e) { console.error('[三相电流] 加载失败:', e) }
  finally { isFetching.value = false }
}

const dialogState = reactive({
  visible: false, rowData: {} as any,
  formData: { thresholdA: '', thresholdB: '', thresholdC: '' },
  submit() {
    const thresholds = JSON.parse(localStorage.getItem(TC_THRESHOLD_KEY) || '{}')
    thresholds[this.rowData.id] = {
      a: parseFloat(this.formData.thresholdA) || 0,
      b: parseFloat(this.formData.thresholdB) || 0,
      c: parseFloat(this.formData.thresholdC) || 0
    }
    localStorage.setItem(TC_THRESHOLD_KEY, JSON.stringify(thresholds))
    this.visible = false; forceKey.value++
  },
  cancel() { this.visible = false; this.formData = { thresholdA: '', thresholdB: '', thresholdC: '' } }
})

const chartDialog = reactive({ visible: false, title: '', data: {} as any })

function onTitleClick(row: any) {
  chartDialog.visible = true
  chartDialog.title = row.deviceName + ' - 三相电流趋势图'
  chartDialog.data = row
}

function setThreshold(row: any) {
  dialogState.visible = true; dialogState.rowData = row
  const thresholds = JSON.parse(localStorage.getItem(TC_THRESHOLD_KEY) || '{}')
  const t = thresholds[row.id]
  dialogState.formData.thresholdA = t?.a || ''
  dialogState.formData.thresholdB = t?.b || ''
  dialogState.formData.thresholdC = t?.c || ''
}

function tableRowClassName({ row }: { row: any }): string {
  const thresholds = JSON.parse(localStorage.getItem(TC_THRESHOLD_KEY) || '{}')
  const t = thresholds[row.id]
  if (!t) return ''
  const phases = [
    { val: row.currentA, max: t.a },
    { val: row.currentB, max: t.b },
    { val: row.currentC, max: t.c }
  ]
  if (phases.some(p => p.max > 0 && p.val > p.max)) return 'danger-row'
  return ''
}

onMounted(() => {
  loadData()
  pollTimer = setInterval(loadData, POLL_INTERVAL)
})

onUnmounted(() => stopPolling())
</script>

<style lang="scss" scoped>
.monitor-data { .link { color: #409eff; cursor: pointer; &:hover { text-decoration: underline; } } }
</style>