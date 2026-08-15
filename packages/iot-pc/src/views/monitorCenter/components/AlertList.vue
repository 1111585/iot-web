<template>
  <div class="alert-list">
    <div class="alert-list__toolbar">
      <div class="alert-list__toolbar-left">
        <div class="status-tabs">
          <span
            v-for="tab in statusTabs"
            :key="tab.value"
            class="status-tab"
            :class="{ 'is-active': activeStatus === tab.value }"
            @click="activeStatus = tab.value"
          >
            {{ tab.label }}
          </span>
        </div>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          clearable
          style="width: 280px"
        />
      </div>
      <el-button type="danger" plain size="small" @click="onBatchDelete">批量删除</el-button>
    </div>

    <ul class="list">
      <li
        class="list-item"
        v-for="item in filteredList"
        :key="item.warningInformationId"
        @click="onTitleClick(item)"
      >
        <!-- 上部分 -->
        <div class="flex-box">
          <div class="list-item__left link">{{ item.title }}</div>
          <div class="list-item__right">
            <span class="list-item__time">{{ formatDate(item.time, 'yyyy年MM月dd日 hh:mm') }}</span>
          </div>
        </div>
        <!-- 下部分 -->
        <div class="flex-box">
          <div class="list-item__left list-item__desc">{{ item.descrition }}</div>
          <div class="list-item__right" :class="statusClass[String(item.status)]">
            {{ Status[String(item.status)] }}
          </div>
        </div>
      </li>
    </ul>

    <EventDetailDialog
      v-model:visible="isShow.eventDialog"
      :data="eventData"
      :key="forceKey"
      @refresh="onRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import EventDetailDialog from '@/views/eventCenter/components/EventDetailDialog.vue';
import { formatDate } from '@/util'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import { notifyDeviceListRefresh } from '@/utils/deviceListRefresh'
import type { AlertItem } from '../types'

interface Props {
  list: AlertItem[]
}

const props = defineProps<Props>()
const emits = defineEmits(['refresh'])

// 状态筛选标签
const statusTabs = [
  { label: '全部', value: '' },
  { label: '未处理', value: '1' },
  { label: '已确认', value: '3' },
  { label: '已处理', value: '2' },
  { label: '已忽略', value: '4' }
]
const activeStatus = ref('')
// 日期范围筛选 [开始日期, 结束日期]
const dateRange = ref<string[] | null>(null)

const filteredList = computed(() => {
  let list = props.list

  if (activeStatus.value !== '') {
    list = list.filter((item) => String(item.status) === activeStatus.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    list = list.filter((item) => {
      const dateStr = String(item.time || '').slice(0, 10)
      return dateStr >= start && dateStr <= end
    })
  }

  return list
})

function onRefresh() {
  isShow.eventDialog = false
  emits('refresh')
}

async function onBatchDelete() {
  const ids = filteredList.value
    .map((item) => Number(item.warningInformationId))
    .filter((id) => !Number.isNaN(id))

  if (ids.length === 0) {
    ElMessage.warning('当前筛选下没有可删除的告警')
    return
  }

  const label = statusTabs.find((tab) => tab.value === activeStatus.value)?.label || '全部'
  const parts = [`【${label}】`]
  if (dateRange.value && dateRange.value.length === 2) {
    parts.push(`${dateRange.value[0]} 至 ${dateRange.value[1]}`)
  }
  const description = parts.join(' + ')

  try {
    await ElMessageBox.confirm(`当前选择为${description}，是否批量删除？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  try {
    const { code } = await request.postJson(deviceApi.deleteEvents, ids)
    if (code === 100) {
      ElMessage.success('删除成功')
      emits('refresh')
      notifyDeviceListRefresh()
    }
  } catch (error) {
    console.error(error)
  }
}

// 处置状态 1:初次预警(未处理)、2:已处理、3:已确认、4:已忽略
const Status: Record<string, string> = {
  '1': '未处理',
  '2': '已处理',
  '3': '已确认',
  '4': '已忽略'
}

const statusClass: Record<string, string> = {
  '1': 'danger',
  '2': 'success',
  '3': 'info',
  '4': 'info'
}

const forceKey = ref(0)

const isShow = reactive({
  eventDialog: false
})

const eventData = ref()

function onTitleClick(item: AlertItem) {
  console.log('[告警记录]', item)
  isShow.eventDialog = true

  eventData.value = {
    ...item,
    id: item.warningInformationId,
    senseDevice: item.equipmentName,
    senseDeviceId: item.equipmentId,
    typeRaw: item.levelType
  }

  forceKey.value++
}
</script>

<style lang="scss" scoped>
.alert-list {
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &__toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.status-tabs {
  display: flex;
  align-items: center;
  gap: 6px;

  .status-tab {
    padding: 4px 12px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s;

    &:hover {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }

    &.is-active {
      color: #fff;
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }
  }
}

.list {
  list-style: none;

  &-item {
    font-size: 14px;
    padding: 14px;
    border-bottom: 1px solid #e5e5e5;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
    &__left {
      flex: 2;
      margin-bottom: 10px;
    }
    &__right {
      flex: 1;
      display: flex;
      justify-content: flex-end;
    }
    &__device {
      width: max-content;
    }
    &__time {
      display: inline-block;
      min-width: 150px;
      margin-left: 14px;
      color: var(--el-text-color-secondary);
    }
    &__desc {
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
