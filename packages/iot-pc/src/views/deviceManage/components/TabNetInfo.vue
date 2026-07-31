<template>
    <div class="tab-deploy">
      <el-table :data="deployInfo" border>
          <el-table-column prop="ipAddress" label="IP地址"> </el-table-column>
          <el-table-column prop="connectedness" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.connectedness == 1 ? 'success' : 'danger'">{{ row.connectedness == 1 ? '正常' : '关闭' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sensingDeviceType" label="类型"> </el-table-column>
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
      case 'aibox': case 'sense':
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
 
  </script>
  
  <style lang="scss" scoped>
  .tab-deploy {
    font-size: 14px;
  }
  </style>
  