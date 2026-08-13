<template>
  <BaseContainer
    ref="containerRef"
    title="预警中心"
    v-model:box="listPayload.box"
    v-model:tab="listPayload.tab"
    v-model:tag="listPayload.tag"
    :tabs="tabItems"
    :boxes="boxItems"
    :tags="eventCenterTag"
  >
    <TableHeadBar class="table-header" :total="eventListTotal">
      <template #right>
        <div class="flex-box items-center">
          <el-button
            v-if="!is.batch"
            :loading="is.btnLoading"
            :disabled="is.batch"
            size="small"
            @click="forceReload"
          >
            刷新
          </el-button>
          <el-checkbox
            v-if="is.batch"
            style="margin-right: 10px"
            v-model="is.checkAll"
            @change="onCheckAllClick"
            label="全选"
          />
          <span v-if="is.batch" class="mr10 ml10">
            <el-button type="success" plain size="small" @click="onBatBtnClick('settle')"
              >设为已处置</el-button
            >
            <el-button type="danger" plain size="small" @click="onBatBtnClick('delete')"
              >删除已选</el-button
            >
          </span>
          <el-button class="mr10" size="small" @click="handleBatchOperation">
            {{ is.batch ? '取消批量' : '批量操作' }}
          </el-button>
        </div>
        <span class="table-label">时间:</span>
        <el-date-picker
          class="table-date"
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
        <span class="table-label">点位:</span>
        <el-select
          class="table-select"
          v-model="listPayload.location"
          placeholder="请选择点位"
          clearable
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <span class="table-label">监测设备:</span>
        <el-input
          class="table-search"
          v-model="listPayload.keyword"
          suffix-icon="i-ep-search"
          placeholder="请输入监测设备名称"
        />
      </template>
    </TableHeadBar>
    <el-row v-loading="is.loading" :gutter="24" v-if="eventList.length !== 0">
      <!-- 'micro-swing': is.batch, -->
      <el-col
        class="card-col"
        :class="{ 'selected-card': item.isSelected }"
        :span="6"
        v-for="item in eventList"
        :key="item.id"
      >
        <EventCard :data="item" @click="onCardClick(item)" />
      </el-col>
    </el-row>
    <empty v-else />
    <div class="table-footer">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :page-sizes="[12, 24, 36]"
        :total="eventListTotal"
        v-model:current-page="listPayload.pageNum"
        v-model:page-size="listPayload.pageSize"
      />
      <!-- hide-on-single-page -->
    </div>

    <EventDetailDialog
      v-model:visible="detailDialog.visible"
      :data="detailDialog.data"
      @refresh="handleRefresh"
      @stateChange="handleStateChange"
    />
  </BaseContainer>
  <!-- <BaseContainer title="设备预警统计" style="max-height: 50vh; overflow-y: hidden">
    <template #header>
      <h2 class="divider-title">今日统计</h2>
    </template>
    <DataTable :columns="devicesColumn" :data="devicesTableData" stripe />
  </BaseContainer> -->
</template>

<script setup lang="ts">
import 'animate.css'
import { onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import TableHeadBar from '@/components/form/TableHeadBar.vue'
import EventCard from './components/EventCard.vue'
import EventDetailDialog from './components/EventDetailDialog.vue'
import { devicesColumn, fetchWarningStatistics } from '../dashboard/utils'
import audioStore from '@/store/audio'

import {
  tabItems,
  eventCenterTag,
  fetchTags,
  fetchList,
  fetchCounts,
  EventType,
  listPayload,
  deleteEvents,
  settleEvents
} from './utils'
import { fetchBindingLocationOptions } from '@/views/deviceManage/utils'
import { StoreEventKey } from '@/consts'
import type { EventRes, EventData } from './types'

const { isBellEnabled } = audioStore()

const boxItems = ref([
  { name: '未处理', num: 0, type: 'success', value: '1', unit: '个' },
  { name: '已忽略', num: 0, type: 'info', value: '4', unit: '个' },
  { name: '已确认', num: 0, type: 'info', value: '3', unit: '个' },
  { name: '已处理', num: 0, type: 'info', value: '2', unit: '个' },
  { name: '总数', num: 0, type: 'info', value: 'total', unit: '个' }
])

const is = reactive({
  loading: false,
  batch: false,
  btnLoading: false,
  checkAll: false,
  dev: import.meta.env.DEV
})

const defaultTimeRange: [Date, Date] = [
  new Date(2000, 1, 1, 12, 0, 0),
  new Date(2000, 2, 1, 8, 0, 0)
] // '12:00:00', '08:00:00'

const containerRef = ref<InstanceType<typeof BaseContainer>>()

const eventListTotal = ref(0)
const eventList = ref<EventData[]>([]) // 渲染用
const eventListRaw = ref<EventRes[]>([]) // 原始数据
const options = ref<ARC.Options[]>([])

const detailDialog = reactive({
  visible: false,
  data: {} as EventData,
  show(data: EventData) {
    console.log('[预警中心]打开详情', data)
    detailDialog.data = data
    detailDialog.visible = true
  },
  clear() {
    console.log('[预警中心]清空数据')
    detailDialog.data = {} as EventData
  }
})

function onCardClick(item: EventData) {
  if (is.batch) {
    console.log('[预警中心]批量操作模式下，不响应单个卡片点击')
    item.isSelected = !item.isSelected
    return
  }
  detailDialog.show(item)
}

function onDateClear() {
  listPayload.value.timeRange = ''
  main()
}

function handleRefresh() {
  detailDialog.visible = false
  main()
}

function handleStateChange(event: { action: 'prev' | 'next' }) {
  const { action } = event
  const currentId = detailDialog.data.id
  const currentIndex = eventList.value.findIndex((item) => item.id === currentId)

  if (currentIndex === -1) return

  let targetIndex: number

  if (action === 'prev') {
    // 上一条，如果当前是第一条则循环到最后一条
    targetIndex = currentIndex === 0 ? eventList.value.length - 1 : currentIndex - 1
  } else {
    // 下一条，如果当前是最后一条则循环到第一条
    targetIndex = currentIndex === eventList.value.length - 1 ? 0 : currentIndex + 1
  }

  // 显示目标事件详情
  detailDialog.show(eventList.value[targetIndex])
}

// 错误计数器和状态标志（组件内部使用）
const errorCount = ref(0)
const isPaused = ref(false)
const MAX_ERROR_COUNT = 5

// 重置错误计数器的方法
function resetErrorCount() {
  errorCount.value = 0
  isPaused.value = false
}

function handleRing(data?: any) {
  if (is.dev) return
  if (is.batch) return console.log('[预警中心]批量操作模式下，不响应刷新')
  const STORE_KEY = StoreEventKey

  // 如果没有传入数据，则获取数据
  if (!data) {
    // 如果已暂停（错误次数达到上限），则不执行
    if (isPaused.value) {
      console.log(`[预警中心]已暂停预警检查，当前错误次数: ${errorCount.value}/${MAX_ERROR_COUNT}`)
      return
    }

    is.btnLoading = true
    fetchCounts('eventCenter')
      .then((fetchedData: any) => {
        // 成功后重置错误计数
        errorCount.value = 0
        isPaused.value = false
        handleRing(fetchedData)
        is.btnLoading = false
      })
      .catch((error) => {
        // 检查是否为50x错误
        const is50xError = error?.response?.status >= 500 && error?.response?.status < 600

        if (is50xError) {
          errorCount.value++
          console.log(`[预警中心]服务器错误，当前错误次数: ${errorCount.value}/${MAX_ERROR_COUNT}`)

          // 如果错误次数达到上限，暂停执行
          if (errorCount.value >= MAX_ERROR_COUNT) {
            isPaused.value = true
            console.log('[预警中心]错误次数达到上限，暂停预警检查')
          }
        }

        is.btnLoading = false
      })
    return
  }

  if (!data) {
    is.btnLoading = false
    return
  }

  const lastUndisposedNum = localStorage.getItem(STORE_KEY) || '0'
  const currentUndisposedNum = data.undisposedNum.toString()

  // 更新localStorage中的值，无论是否有新事件
  localStorage.setItem(STORE_KEY, currentUndisposedNum)

  if (parseInt(currentUndisposedNum) > parseInt(lastUndisposedNum)) {
    console.log('[预警中心]检测到新的未处理事件，播放提示音')
    if (isBellEnabled) {
      const audio = new Audio('/sounds/event-ring.mp3')
      audio.play().catch((err) => {
        console.error('[预警中心]播放提示音失败:', err)
      })
    }

    handleCount(data)
    handleList()
      .then(() => {
        const theLatestItem = eventList.value[0]
        if (theLatestItem) {
          detailDialog.show(theLatestItem)
        }
      })
      .finally(() => {
        is.btnLoading = false
      })
  }
}

// 处理统计
function handleCount(data: any) {
  if (!data) return console.log('[预警中心]没有统计数据')
  boxItems.value.forEach((item) => {
    switch (item.name) {
      case data.undisposedName:
        item.num = data.undisposedNum
        break
      case data.ignoredName:
        item.num = data.ignoredNum
        break
      case data.processedName:
        item.num = data.processedNum
        break
      case data.confirmedName:
        item.num = data.confirmedNum
        break
      case '总数':
        if (listPayload.value.tab === '0') {
          item.num = data.undisposedNum + data.ignoredNum + data.processedNum + data.confirmedNum
        } else {
          item.num = data.num
        }
    }
  })
}

function handleList(): Promise<void> {
  return new Promise((resolve, reject) => {
    is.loading = true
    fetchList<EventRes>('eventCenter')
      .then((res) => {
        if (!res) return
        eventListRaw.value = res.list
        eventListTotal.value = res.raw.total
        eventList.value = res.list.map((item) => ({
          id: item.warningId,
          type: EventType[item.levelType],
          typeRaw: item.levelType,
          detectDevice: item.monitoringDevice,
          senseDevice: item.sensingDevice,
          senseDeviceId: item.sensingDeviceId,
          date: item.warningTime,
          dateContinute: item.warningTimeDetail,
          areaPoint: item.owningPoint, // 所属点位
          disposeType: item.disposeType,
          handleStatus: item.handleStatus,
          image: item.picturePath,
          tag: 'normal',
          deployControlId: item.deployControlId,
          isSelected: false
        }))
        resolve()
      })
      .finally(() => {
        is.loading = false
      })
  })
}

// 更新未处理事件计数并刷新数据
function updateCountsAndRefresh() {
  is.btnLoading = true
  fetchCounts('eventCenter')
    .then((data) => {
      if (data) {
        const STORE_KEY = 'eventCenter_undisposedNum'
        // @ts-ignore
        localStorage.setItem(STORE_KEY, data.undisposedNum.toString())
        handleCount(data)
      }
      handleList()
    })
    .finally(() => {
      is.btnLoading = false
    })
}

function handleBatchOperation() {
  is.batch = !is.batch
  console.log('[预警中心]批量操作模式:', is.batch ? '开启' : '关闭')

  // 重置所有卡片的选择状态
  if (!is.batch) {
    eventList.value.forEach((item) => {
      item.isSelected = false
      is.checkAll = false
    })
  }
}

type Bat = 'settle' | 'delete'
function onBatBtnClick(type: Bat) {
  const selectedItems = eventList.value.filter((item) => item.isSelected)
  if (selectedItems.length === 0) {
    ElMessage.warning('请选择要' + (type === 'settle' ? '设为已处置' : '删除') + '的预警')
    return
  }

  if (type === 'delete') {
    handleDeleteSelected(selectedItems)
  } else {
    handleSettleSelected(selectedItems)
  }
}

function onCheckAllClick() {
  eventList.value.forEach((item) => {
    item.isSelected = is.checkAll
  })
}

function handleDeleteSelected(selectedItems: EventData[]) {
  if (selectedItems.length === 0) {
    ElMessage.warning('请选择要删除的预警')
    return
  }

  ElMessageBox.confirm('确定要删除选中的预警吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      console.log('[预警中心]删除已选', selectedItems)

      const ids = selectedItems.map((item) => item.id)
      const { code } = await deleteEvents(ids)
      if (code === 100) {
        ElMessage.success('删除成功')
        is.batch = false
        is.checkAll = false
        // 删除成功后更新数据并同步localStorage
        updateCountsAndRefresh()
      }
    })
    .catch(() => console.log('取消删除'))
}

function handleSettleSelected(selectedItems: EventData[]) {
  if (selectedItems.length === 0) {
    ElMessage.warning('请选择要设为已处置的预警')
    return
  }

  ElMessageBox.confirm('确定要设为已处置选中的预警吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      console.log('[预警中心]设为已处置已选', selectedItems)

      const ids = selectedItems.map((item) => item.id)
      const { code } = await settleEvents(ids, eventListRaw.value)
      if (code === 100) {
        ElMessage.success('设为已处置成功')
        is.batch = false
        is.checkAll = false
        // 处置成功后更新数据并同步localStorage
        updateCountsAndRefresh()
      }
    })
    .catch(() => console.log('取消设为已处置'))
}

function forceReload() {
  location.reload()
}

function main() {
  // 重置错误计数器，恢复预警检查
  resetErrorCount()

  handleList()
  fetchCounts('eventCenter').then((data) => {
    handleCount(data)
    // 将获取到的数据传递给handleRing
    handleRing(data)
  })

  is.batch = false
}

watch(listPayload, main, { deep: true, immediate: true })
watch(
  () => detailDialog.visible,
  (flag) => {
    if (flag) return
    detailDialog.clear()
    main()
  }
)

// const devicesTableData = ref()

onMounted(() => {
  listPayload.value.box = '1'
  listPayload.value.tag = ''
  main()
  fetchBindingLocationOptions().then((res) => {
    if (!res) return
    options.value = res.options
  })
  fetchTags().then((res) => {
    if (!res) return

    const data = res.raw as Record<number, string>
    const tagList = Object.keys(data).map((key) => ({
      value: key,
      title: data[key]
    }))
    // 确保 CT过流（levelType=4）标签始终存在（字典若未配置则兜底追加）
    if (!tagList.some((t) => t.value === '4')) {
      tagList.push({ value: '4', title: 'CT过流' })
    }
    tagList.unshift({ value: '0', title: '全部' })

    eventCenterTag.value = [
      {
        title: '预警',
        value: 'msgType',
        active: '0',
        list: tagList
      }
    ]
  })

  // fetchWarningStatistics().then((res) => {
  //   if (!res) return
  //   const rawData = res.raw
  //   devicesTableData.value = rawData.map((item) => ({
  //     date: item.date,
  //     arcFlashCount: item.arcFlashEventTotal,
  //     arcFlashResolvedCount: item.arcFlashEventProcessed,
  //     arcFlashUnresolvedCount: item.arcFlashEventUnprocessed,
  //     overTemperatureCount: item.overtempLevel1Total,
  //     overTemperatureResolvedCount: item.overtempLevel1Processed,
  //     overTemperatureUnresolvedCount: item.overtempLevel1Unprocessed,
  //     overTemperatureLevel2Count: item.overtempLevel2Total,
  //     overTemperatureLevel2ResolvedCount: item.overtempLevel2Processed,
  //     overTemperatureLevel2UnresolvedCount: item.overtempLevel2Unprocessed
  //   }))
  // })

  // 设置轮询定时器，每30秒检查一次是否有新的未处理事件
  const ringTimer = setInterval(() => {
    handleRing()
  }, 3000) // 3秒检查一次

  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(ringTimer)
  })
})
</script>

<style lang="scss" scoped>
.table-header {
  .el-button--danger:hover {
    color: var(--el-color-danger);
  }
  .el-button--primary:hover {
    color: var(--el-color-primary);
  }
  .el-button--success:hover {
    color: var(--el-color-success);
  }
}
.table-footer {
  display: flex;
  // justify-content: flex-end;
  align-items: center;
  padding-bottom: 20px;
}

.table-label {
  margin-right: 10px;
  color: #757575;
  font-size: 14px;
}

.table-date {
  width: 180px;
  margin-right: 10px;
}
.table-search {
  width: 180px;
}
.table-select {
  width: 150px;
  margin-right: 10px;
}

/* 自定义微弱摇摆动画 */
@keyframes microSwing {
  0% {
    transform: rotate3d(0, 0, 1, 0deg);
  }
  15% {
    transform: rotate3d(0, 0, 1, 1deg);
  }
  30% {
    transform: rotate3d(0, 0, 1, -1deg);
  }
  45% {
    transform: rotate3d(0, 0, 1, 0.7deg);
  }
  60% {
    transform: rotate3d(0, 0, 1, -0.7deg);
  }
  75% {
    transform: rotate3d(0, 0, 1, 0.5deg);
  }
  90% {
    transform: rotate3d(0, 0, 1, -0.5deg);
  }
  100% {
    transform: rotate3d(0, 0, 1, 0deg);
  }
}

.micro-swing {
  animation-name: microSwing;
  transform-origin: top center;
  animation-duration: 0.7s; /* 更快的动画速度 */
  animation-fill-mode: both;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out; /* 添加缓动函数使动画更丝滑 */
}

/* 选中卡片的样式 */
.selected-card {
  &:deep(.el-card) {
    background-color: rgba(64, 158, 255, 0.1) !important;
    border-color: var(--el-color-primary) !important;
  }
}

.divider-title {
  margin: 20px 0;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  background: linear-gradient(135deg, #f0f4ff 0%, #e6f2ff 100%);
  border-radius: 6px;
  border-left: 4px solid #497cfd;
  box-shadow: 0 2px 8px rgba(73, 124, 253, 0.1);
  letter-spacing: 0.5px;
}
</style>
