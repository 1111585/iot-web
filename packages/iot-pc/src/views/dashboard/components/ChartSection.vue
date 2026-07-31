<template>
  <div class="chart-section">
    <el-row :gutter="20">
      <el-col :span="12">
        <TabChart type="temp" />
      </el-col>
      <el-col :span="12">
        <TabChart type="device" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import TabChart from '@/views/deviceManage/components/TabChart.vue'
</script>

<style scoped lang="scss">
.chart-section {
  width: 100%;
  height: 70vh;
  padding: 20px;
}
</style>
