<template>
  <div
    v-for="column in columns.filter((item) => item.isShow)"
    :key="column.text"
    class="column"
    :class="{ 'column-divider': column.isShowDivider }"
  >
    <AsLongAsMe :style="{ width: longestStr + 'em' }" :str="column.text" />：
    <span v-if="editable">
      <template v-if="column.isSlot">
        <slot :name="column.alias" :column="column"></slot>
      </template>
      <template v-else>
        <el-input class="input" style="width: 40%" size="small" v-model="column.value">
          <template #suffix>
            {{ column.unit }}
          </template>
        </el-input>
      </template>
    </span>
    <span v-else class="ml5">
      <template v-if="column.isSlot">
        <slot :name="column.alias" :column="column"></slot>
      </template>
      <template v-else>
        <span>{{ column.value }}</span>
        <span class="unit">{{ column.unit }}</span>
      </template>
    </span>
  </div>
</template>

<script setup lang="ts">
import { AsLongAsMe } from '@/components/renderer'

interface Column {
  text: string
  value: string
  unit?: string
  isShow?: boolean
  isEditing?: boolean // 是否展示输入框
  isSlot?: boolean // 是否是 slot
  isSingle?: boolean // 是否是单值（特殊处理）
  isShowDivider?: boolean // 是否展示分隔线
  alias?: string
}
interface Props {
  columns: Column[]
  editable?: boolean // 数值是否可编辑
}

const props = defineProps<Props>()
const longestStr = computed(() => {
  return Math.max(...props.columns.map((item) => item.text.length))
})
</script>

<style lang="scss" scoped>
.column {
  display: flex;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;

  & > span:first-child {
    display: inline-block;
    width: 100px;
    min-width: 100px;
  }

  .unit {
    margin-left: 4px;
  }

  &-divider {
    position: relative;
    margin-top: 10px;
    border-top: 1px dashed #ccc;

    &::before {
      content: '共享配置';
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translate(-50%, 0);
      padding: 2px 10px;
      font-size: 12px;
      color: #999;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  }
}
</style>
