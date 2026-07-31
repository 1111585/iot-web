<template>
  <div class="tab-resource">
    <el-table :data="deviceList" border>
      <el-table-column prop="deviceId" label="设备ID"> </el-table-column>
      <el-table-column prop="deviceName" label="设备名称"> </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { map } from 'lodash-es'
import { shareDeviceDetail } from '../utils/store'

const deviceList = computed(() => {
  const data = map(shareDeviceDetail.value?.monitoringEquipmentList)
  if (data.length !== 0) {
    return data
  } else {
    return []
  }
})
</script>

<style lang="scss" scoped>
.tab-resource {
  font-size: 14px;
}
</style>
