<template>
  <BaseContainer title="链路监测">
    <template #operation>
      <el-button type="primary" @click="connectionTest()">连通性监测</el-button>
    </template>
    <ConnectionGraph />
  </BaseContainer>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import ConnectionGraph from './components/ConnectionGraph.vue'

function connectionTest() {
  ElMessage.info('开发中')
}
</script>

<style scoped></style>
