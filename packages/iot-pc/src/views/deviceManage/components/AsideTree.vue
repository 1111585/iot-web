<template>
  <div class="app-container aside-container">
    <div class="aside-container__button">算法服务器</div>
    <el-divider class="aside-container__divider" />
    <el-tooltip :visible="tooltip.visible" placement="right">
      <template #content>
        <span>{{ tooltip.content }}</span>
      </template>
      <el-tree
        style="max-width: 600px"
        accordion
        icon="i-ep-arrow-right"
        :key="forceKey"
        :data="treeData"
        :props="treeProps"
        @node-click="handleNodeClick"
      >
        <template #default="{ data }">
          <span
            class="aside-container__node"
            @mouseenter="onMouseEnter($event, data)"
            @mouseleave="onMouseLeave"
          >
            {{ data.deviceName }}
          </span>
        </template>
      </el-tree>
    </el-tooltip>
    <el-button
      class="aside-container__clear"
      text
      type="primary"
      :disabled="listPayload.detectDeviceId === ''"
      @click="handleClear"
    >
      清除筛选
    </el-button>
  </div>
</template>

<script setup lang="ts">
import type { TreeNode } from 'element-plus'
import { treeProps, listPayload as deviceListPayload, fetchTrees } from '../utils'
import { listPayload as monitorListPayload } from '@/views/monitorCenter/utils'
import type { Tree } from '../types'

interface Props {
  type: 'aibox' | 'detect' | 'sense' | 'deploy'
}


const props = defineProps<Props>()

const forceKey = ref(0)

const listPayload = ref()
if (props.type === 'deploy') {
  listPayload.value = monitorListPayload.value
} else {
  listPayload.value = deviceListPayload.value
}

const treeData = ref<Tree[]>([])
function handleNodeClick(data: any, node: TreeNode) {
  console.log('[设备管理]点击树形列表', data, node)
  listPayload.value.detectDeviceId = data.deviceId as string
  listPayload.value.treeNodeName = data?.deviceName
  listPayload.value.deviceId = data.deviceId as string
  if (node.level) {
    listPayload.value.treeNodeLevel = node.level
  }
  // 布控时点击树形列表，需要选中总布控
  if (props.type === 'deploy') {
    listPayload.value.box = 'total'
  }
}
function handleClear() {
  listPayload.value.detectDeviceId = ''
  listPayload.value.treeNodeLevel = '' as unknown as number
  listPayload.value.treeNodeName = ''
  // 布控时点击树形列表，需要清空布控类型，恢复为未布控
  if (props.type === 'deploy') {
    listPayload.value.box = 'no_control'
  }
  forceKey.value++
}

const tooltip = reactive({
  visible: false,
  content: ''
})

function onMouseEnter(e: MouseEvent, data: any) {
  const ele = e.target as HTMLElement
  const { width } = ele.getBoundingClientRect()

  // console.log(width)

  if (width > 140) {
    tooltip.visible = true
    tooltip.content = data.deviceName
  }
}

function onMouseLeave() {
  tooltip.visible = false
}

onMounted(() => {
  fetchTrees(props.type).then((res) => {
    if (!res) return
    treeData.value = res.list
  })
})
</script>

<style lang="scss" scoped src="../styles.scss"></style>
