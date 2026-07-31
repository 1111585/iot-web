<template>
  <el-button type="primary" icon="i-ep-plus" @click="onAddBtnClick()">
    {{ btnTexts[type] }}
  </el-button>
</template>

<script setup lang="ts">
import { addDialog, titles } from '../utils';

type UsePage = keyof typeof titles

const props = defineProps<{
  type: ARC.MonitorDeviceType
}>()

const btnTexts: Record<ARC.MonitorDeviceType, string> = {
  aibox: '算法服务器添加',
  detect: '设备添加',
  sense: '设备添加'
}

// TODO:应该统一为 ARC.MonitorDeviceType，但是太多地方用到
const reflection: Record<ARC.MonitorDeviceType, UsePage> = {
  aibox: 'aiBox',
  detect: 'detectDevice',
  sense: 'senseDevice',
}

function onAddBtnClick() {
    addDialog.showing('add', reflection[props.type])
}
</script>

<style scoped></style>
