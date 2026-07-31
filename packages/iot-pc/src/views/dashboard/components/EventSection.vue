<template>
  <div class="event-section">
    <div class="filter-container">
      <div class="filter-item">
        <span class="filter-label">时间:</span>
        <el-date-picker
          style="width: 340px; margin-right: 10px"
          v-model="listPayload.timeRange"
          type="datetimerange"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          arrow-control
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
          :default-time="defaultTimeRange"
          clearable
          @clear="onDateClear"
        />
      </div>
      <div class="filter-item">
        <span class="filter-label">点位:</span>
        <el-select
          v-model="listPayload.location"
          placeholder="请选择点位"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">处置状态:</span>
        <el-select
          v-model="listPayload.box"
          placeholder="请选择处置状态"
          clearable
          style="width: 180px"
          @clear="() => (listPayload.box = 'total')"
        >
          <el-option label="全部" :value="'total'" />
          <el-option label="未处理" :value="1" />
          <el-option label="已处理" :value="2" />
          <el-option label="已确认" :value="3" />
          <el-option label="已忽略" :value="4" />
        </el-select>
      </div>
    </div>
    <DataTable
      :columns="eventColumn"
      :data="eventList"
      :total="eventTotal"
      :pageSizes="[10, 20, 50, 100]"
      :pageSize="listPayload.pageSize"
      :pageNum="listPayload.pageNum"
      @update:page-size="onPageSizeChange"
      @update:page-num="onPageNumChange"
      height="70vh"
      layout="total,sizes,prev, pager, next ,jumper"
    >
      <template #disposeType="{ row }">
        <el-tag :type="getTagType(row.disposeType)">{{ EventStatus[row.disposeType] }}</el-tag>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from '@/components/renderer/DataTable.vue'
import { eventColumn, DrawerInjectKey } from '../utils/consts'
import { fetchList, listPayload, EventType, EventStatus } from '@/views/eventCenter/utils'
import { fetchBindingLocationOptions } from '@/views/deviceManage/utils'
import type { EventRes } from '@/views/eventCenter/types'

const deviceData = inject(DrawerInjectKey)!

const eventList = ref<EventRes[]>([])
const eventTotal = ref(0)

const options = ref<ARC.Options[]>([])
const defaultTimeRange: [Date, Date] = [
  new Date(2000, 1, 1, 12, 0, 0),
  new Date(2000, 2, 1, 8, 0, 0)
] // '12:00:00', '08:00:00'

function doFetchList() {
  fetchList<EventRes>('eventCenter').then((res) => {
    if (!res?.list) return
    // @ts-ignore
    eventList.value = res.list.map((item) => ({
      ...item,
      levelType: EventType[item.levelType]
      //   disposeType: EventStatus[item.disposeType]
    }))
    eventTotal.value = res.raw.total
  })
}

function onDateClear() {
  listPayload.value.timeRange = ''
  doFetchList()
}

function onPageSizeChange(size: number) {
  listPayload.value.pageSize = size
  doFetchList()
}

function onPageNumChange(num: number) {
  listPayload.value.pageNum = num
  doFetchList()
}

function getTagType(status: number): 'success' | 'info' | 'warning' | 'danger' | 'primary' {
  const typeMap: Record<number, 'success' | 'info' | 'warning' | 'danger' | 'primary'> = {
    1: 'warning', // 未处理 - 警告色
    2: 'success', // 已处理 - 成功色
    3: 'info', // 已确认 - 信息色
    4: 'info' // 已忽略 - 信息色
  }
  return typeMap[status] || 'info'
}

watch(
  listPayload,
  () => {
    doFetchList()
  },
  { deep: true }
)

onMounted(() => {
  listPayload.value.keyword = deviceData.value?.deviceName || ''
  listPayload.value.pageSize = 20

  doFetchList()
  fetchBindingLocationOptions().then((res) => {
    if (!res) return
    options.value = res.options
  })
})

onUnmounted(() => {
  listPayload.value.pageNum = 1
  listPayload.value.pageSize = 9
  listPayload.value.keyword = ''
})
</script>

<style scoped lang="scss">
.filter-container {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;

  :deep(.el-date-picker) {
    width: 100%;
  }

  :deep(.el-select) {
    width: 100%;
  }
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}
</style>
