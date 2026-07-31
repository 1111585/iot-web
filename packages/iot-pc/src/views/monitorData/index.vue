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
      <template #devicename="{ row }">
        <span class="link" @click="onTitleClick(row)">{{ row.devicename }}</span>
      </template>
      <template #opt="{ row }">
        <el-button size="small" @click="setThreshold(row)">设置阈值</el-button>
      </template>
    </DataTable>
    <el-dialog
      v-model="dialogState.visible"
      title="设置"
      width="500px"
      destroy-on-close
      draggable
      @close="dialogState.cancel()"
    >
      <el-form
        ref="formRef"
        :model="dialogState.formData"
        label-width="80px"
        style="padding-right: 20px"
      >
        <el-form-item label="告警阈值" prop="threshold">
          <el-input v-model="dialogState.formData.threshold" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="dialogState.submit()">确定</el-button>
        <el-button @click="dialogState.cancel()">取消</el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="chartDialog.visible"
      :title="chartDialog.title"
      width="1000px"
      destroy-on-close
      draggable
    >
      <IotChart
        :title="`${chartDialog.data.devicename || '设备'} - 温度趋势图`"
        :device-name="chartDialog.data.devicename"
        :device-id="chartDialog.data.deviceid"
      />
    </el-dialog>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import DataTable from '@/components/renderer/DataTable.vue'
import IotChart from './components/IotChart.vue'

import { fetchIotCollection, iotCollColumn, iotCollList, iotCollTotal, iotCollQuery } from './utils'

const forceKey = ref(0)

const dialogState = reactive({
  visible: false,
  title: '设置阈值',
  rowData: {} as ARC.AnyObj,
  formData: {
    threshold: ''
  },
  submit() {
    // 保存阈值到localStorage
    const deviceName = dialogState.rowData.devicename
    const threshold = dialogState.formData.threshold

    const thresholds = JSON.parse(localStorage.getItem('temp_threshold') || '{}')
    thresholds[deviceName] = threshold
    localStorage.setItem('temp_threshold', JSON.stringify(thresholds))

    dialogState.visible = false
    forceKey.value++
  },
  cancel() {
    dialogState.visible = false
    dialogState.formData.threshold = ''
  }
})

const chartDialog = reactive({
  visible: false,
  title: '温度趋势图',
  data: {} as ARC.AnyObj
})

function onTitleClick(row: ARC.AnyObj) {
  chartDialog.visible = true
  chartDialog.title = `${row.devicename} - 温度趋势图`
  chartDialog.data = row
}

function setThreshold(row: ARC.AnyObj) {
  dialogState.visible = true
  dialogState.rowData = row

  const thresholds = JSON.parse(localStorage.getItem('temp_threshold') || '{}')
  dialogState.formData.threshold = thresholds[row.devicename] || ''
}

function main() {
  fetchIotCollection()
}

function tableRowClassName({ row, rowIndex }: { row: any; rowIndex: number }): string {
  const tempKeys = ['temp1', 'temp2', 'temp3', 'temp4', 'temp5']
  const thresholds = JSON.parse(localStorage.getItem('temp_threshold') || '{}')

  // 获取当前设备的阈值，如果没有设置则默认为26
  const deviceThreshold = thresholds[row.devicename] || 26

  // 检查是否有温度超过阈值
  const tempKeysValue = tempKeys.map((key) => row[key])
  if (tempKeysValue.some((item) => item > deviceThreshold)) {
    return 'danger-row'
  }
  return ''
}

onMounted(() => {
  main()
})
</script>

<style lang="scss" scoped>
.monitor-data {
}
</style>
