<template>
  <el-dropdown>
    <el-button text icon="i-ep-more"></el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="action in actions"
          :key="action.text"
          @click="action.callback(row, handleRefresh)"
        >
          {{ action.text }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
interface Action {
  icon?: string
  text: string
  callback: (...arg: any[]) => void
}
interface Props {
  row: any
  actions: Action[]
}
const props = defineProps<Props>()
const emits = defineEmits(['refresh'])

function handleRefresh() {
  emits('refresh')
}
</script>

<style lang="scss" scoped></style>
