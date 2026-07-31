<template>
  <div class="tab-deploy">
    <el-table :data="deployInfo" border>
      <template v-if="page === 'aibox'">
        <el-table-column prop="sensingDeviceName" label="摄像头名称"> </el-table-column>
        <el-table-column prop="connectedness" label="在线状态">
          <template #default="{ row }">
            <el-tag :type="row.connectedness == 1 ? 'success' : 'danger'">{{ row.connectedness == 1 ? '正常' : '关闭' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="布控功能"> </el-table-column>
      </template>
      <template v-else>
        <el-table-column prop="title" label="布控标题"> </el-table-column>
        <el-table-column prop="description" label="描述"> </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { shareDeviceDetail } from '../utils/store'
import { injectKeys } from '../utils'

const page = inject(injectKeys.page)

const deployInfo = computed(() => {
  
  let data
  switch (page) {
    case 'aibox':
      data = shareDeviceDetail.value?.sensingEquipmentList
      break
    default:
      data = shareDeviceDetail.value?.deployAndControlList
      break
  }



  if (data?.length !== 0) {
    return data
  } else {
    return []
  }
})

console.log(deployInfo)
</script>

<style lang="scss" scoped>
.tab-deploy {
  font-size: 14px;
}
</style>
