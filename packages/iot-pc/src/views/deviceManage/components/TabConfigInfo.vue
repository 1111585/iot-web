<template>
  <div class="tab-config">
    <empty v-if="noMoreData" />
    <el-descriptions v-else direction="vertical" border>
      <el-descriptions-item label="IP地址" width="20%">{{
        baseInfo?.ipAddress || '-'
      }}</el-descriptions-item>
      <el-descriptions-item label="子网掩码" width="20%">
        {{ baseInfo?.subNetworkMask || '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts">
import { shareDeviceDetail } from '../utils/store'

const baseInfo = computed(() => {
  return shareDeviceDetail.value?.info
})
const noMoreData = computed(() => {
  return Object.keys(baseInfo.value || {}).length === 0
})
</script>

<style lang="scss" scoped>
.tab-config {
  .el-input {
    width: 50%;
  }
}
</style>
