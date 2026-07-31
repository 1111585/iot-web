<template>
  <div class="data-table-wrapper">
    <el-table
      :data="data"
      :row-key="rowKey"
      v-loading="loading"
      :stripe="stripe"
      border
      :height="height"
      :row-class-name="tableRowClassName"
    >
      <template v-for="column in columns" :key="column.prop">
        <!-- 使用默认的列渲染 -->
        <el-table-column
          v-if="!column.slot && !column.hide"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :fixed="column.fixed"
          :align="column.align"
          :sortable="column.sortable"
        />
        <!-- 使用自定义插槽渲染 -->
        <el-table-column
          v-else-if="!column.hide"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :fixed="column.fixed"
          :align="column.align"
        >
          <template #default="scope">
            <slot :name="column.slot" :row="scope.row" :prop="column.prop">
              <div :style="{ width: column.width }">
                {{ scope.row[column.prop] }}
              </div>
            </slot>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        hide-on-single-page
        background
        :layout="layout"
        :total="total"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        :current-page="pageNum"
        @update:page-size="(size: number) => $emit('update:pageSize', size)"
        @update:current-page="(num: number) => $emit('update:pageNum', num)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'

/**
 * TODO: 从每一个不同的 Column 的 prop 中推断出类型 ？？？
 * type ColumnProps<T> = {
    [K in T[number]['prop']]: string
  }
 */

interface Column {
  prop: string
  label: string
  slot?: string
  width?: string
  fixed?: boolean | string
  align?: string
  hide?: boolean
  sortable?: boolean
}

interface Props {
  data?: any[]
  // columns: Column[]
  columns: ReadonlyArray<Column>
  pageSize?: number
  pageSizes?: number[]
  pageNum?: number
  total?: number
  loading?: boolean
  rowKey?: string
  stripe?: boolean
  height?: string
  layout?: string
  tableRowClassName?: (params: { row: any; rowIndex: number }) => string
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  layout: 'prev, pager, next, total',
  pageSizes: () => [5, 10]
})
const emit = defineEmits(['page-change', 'update:pageSize', 'update:pageNum'])

const pageNum = computed({
  get() {
    return props.pageNum
  },
  set(val) {
    emit('update:pageNum', val)
  }
})

onMounted(() => {
  console.log('[配置表格]', props)
})
</script>

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.data-table-wrapper {
  &:deep(.el-table__row) {
    &.warning-row {
      --el-table-tr-bg-color: var(--el-color-warning);
    }
    &.success-row {
      --el-table-tr-bg-color: var(--el-color-success);
    }
    &.danger-row {
      --el-table-tr-bg-color: var(--el-color-danger-light-6);
    }
  }
}
</style>
