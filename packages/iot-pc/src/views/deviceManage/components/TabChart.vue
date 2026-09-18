<template>
  <div class="tab-chart">
    <div class="chart-header" v-if="props.type === 'temp'">
      <el-button-group class="quick-group">
        <el-button
          v-for="item in quickRanges"
          :key="item.value"
          size="small"
          plain
          style="padding: 0 10px"
          @click="onQuickRange(item.value)"
        >
          {{ item.label }}
        </el-button>
      </el-button-group>
      <div class="query-datetime">
        <el-date-picker
          v-model="selectedDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          size="small"
          style="width: 100%"
          :disabledDate="disableFutureDate"
          @change="handleTimeChange"
        />
      </div>
      <div class="field-group">
        <span class="field-label">采样间隔</span>
        <el-select
          v-model="tempLineQuery.intervalType"
          size="small"
          style="width: 96px; flex: none"
          @change="handleIntervalChange"
        >
          <el-option
            v-for="item in intervalOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <el-button
        class="export-btn"
        type="primary"
        plain
        icon="i-ep-download"
        size="small"
        @click="onExport"
      >
        导出
      </el-button>
    </div>
    <section v-if="props.type === 'temp'" class="chart-container">
      <div v-if="isLoading" class="loading-overlay">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
      </div>
      <div id="tempChart" class="chart"></div>
    </section>
    <section v-if="props.type === 'device'" class="chart-container">
      <div v-if="isLoading" class="loading-overlay">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
      </div>
      <div id="deviceChart" class="chart"></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, inject, reactive, watch } from 'vue'
import { Line } from '@antv/g2plot'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { request } from '@/util/request'
import { chartApi } from '@/apis/chart'
import {
  calculateTempTimeRange,
  getAxisRange,
  mapTempCurveData
} from '@/views/eventCenter/utils/tempChart'
import { fetchSenseDeviceSevenDays, fetchTempCurve, injectKeys } from '../utils'

interface Props {
  // 图表类型
  type: 'temp' | 'device'
}

const props = defineProps<Props>()

const data = inject(injectKeys.data)

const tempLineQuery = reactive({
  deviceIds: data?.deviceId, // 设备id, 多个以 , 拼接
  startDate: '', // 开始时间
  endDate: '', // 结束时间
  intervalType: '1d' // 时间间隔（5min:5分钟，1h:1小时，1d:1天）
})

// 时间间隔选项（与 CT 电流曲线统一为三档）
const intervalOptions = [
  { label: '5分钟', value: '5min' },
  { label: '1小时', value: '1h' },
  { label: '1天', value: '1d' }
]

type QuickRange = 'today' | '3d' | '7d' | '30d'
const MS_DAY = 86400000

// 快捷时间范围（与 CT 一致）
const quickRanges: { label: string; value: QuickRange }[] = [
  { label: '今天', value: 'today' },
  { label: '近3天', value: '3d' },
  { label: '近7天', value: '7d' },
  { label: '近30天', value: '30d' }
]

// 图表实例
const tempLineChart = ref<Line | null>(null)
const deviceLineChart = ref<Line | null>(null)

// 时间范围选项
const selectedDate = ref<Date | undefined>(undefined)
const selectedDateRange = ref<[Date, Date] | undefined>(undefined)

// 禁用未来日期
const disableFutureDate = (date: Date) => {
  return date > new Date()
}

// 格式化日期为 yyyy-MM-dd
const formatDateOnly = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 加载状态
const isLoading = ref(false)

type DataPoint = { date: string; type: string; value: number }

// 共用温度时间范围计算
const calculateTimeRange = (intervalType: string, referenceDate = new Date()) =>
  calculateTempTimeRange(intervalType, referenceDate)

const tempData = ref<DataPoint[]>([])

const deviceData = ref<DataPoint[]>([])

const handleIntervalChange = () => {
  // 以日期选择器的值为准；未选择时段时默认查询今天
  if (!tempLineQuery.startDate || !tempLineQuery.endDate) {
    const today = formatDateOnly(new Date())
    tempLineQuery.startDate = today
    tempLineQuery.endDate = today
  }
  fetching()
}

// 快捷时间段：与 CT 一致，5 分钟档超出 3 天时自动回落到 1 小时
const onQuickRange = (value: QuickRange) => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (value !== 'today') {
    const days = value === '3d' ? 3 : value === '7d' ? 7 : 30
    start.setDate(start.getDate() - (days - 1))
  }
  selectedDateRange.value = [start, end]
  tempLineQuery.startDate = formatDateOnly(start)
  tempLineQuery.endDate = formatDateOnly(end)
  if (tempLineQuery.intervalType === '5min' && end.getTime() - start.getTime() > 2 * MS_DAY) {
    tempLineQuery.intervalType = '1h'
  }
  fetching()
}

// 导出温度曲线：时间区间/间隔与当前查询保持一致
const onExport = () => {
  const params: Record<string, string> = { deviceIds: String(tempLineQuery.deviceIds ?? '') }
  if (tempLineQuery.startDate) params.startDate = tempLineQuery.startDate
  if (tempLineQuery.endDate) params.endDate = tempLineQuery.endDate
  if (tempLineQuery.intervalType) params.intervalType = tempLineQuery.intervalType
  try {
    request.downloadStream(chartApi.device.sense.exportTempCurveData, undefined, params, 'GET')
  } catch (error) {
    console.error('导出温度曲线失败', error)
  }
}

// 处理时间切换
const handleTimeChange = () => {
  if (selectedDateRange.value && selectedDateRange.value.length === 2) {
    // 日期范围模式
    const [startDate, endDate] = selectedDateRange.value
    tempLineQuery.startDate = formatDateOnly(startDate)
    tempLineQuery.endDate = formatDateOnly(endDate)
    // 5 分钟档最多 3 天，超出范围时自动回落到"1小时"间隔
    const spanDays =
      (new Date(`${tempLineQuery.endDate}T00:00:00`).getTime() -
        new Date(`${tempLineQuery.startDate}T00:00:00`).getTime()) /
      86400000
    if (tempLineQuery.intervalType === '5min' && spanDays > 2) {
      tempLineQuery.intervalType = '1h'
    }
  } else if (selectedDate.value) {
    // 单日期模式（保留向后兼容）
    const timeRange = calculateTimeRange(tempLineQuery.intervalType, selectedDate.value)
    tempLineQuery.startDate = timeRange.startDate
    tempLineQuery.endDate = timeRange.endDate
  } else {
    tempLineQuery.startDate = ''
    tempLineQuery.endDate = ''
  }

  fetching()
}

// 动态生成颜色（32 位安全哈希：原实现长字符串会因浮点精度丢失导致色相集中，全是紫色调）
const getColorByType = (type: string) => {
  let hash = 0
  for (let i = 0; i < type.length; i++) {
    hash = (Math.imul(hash, 31) + type.charCodeAt(i)) | 0
  }
  const h = Math.abs(hash % 360)
  return `hsl(${h}, 70%, 45%)`
}

// 温度曲线配色：不同区域用不同色相；同一区域的「平均值/最大值」同色相、浅/深两档，区分度更好
const TEMP_HUES = [210, 30, 150, 0, 270, 180, 60, 320, 240, 100, 15, 195]
const tempColorMap = ref<Record<string, string>>({})

const buildTempColorMap = (list: DataPoint[]) => {
  const zones: string[] = []
  list.forEach((item) => {
    const zone = item.type.replace(/-(平均值|最大值|最小温度|最大温度)$/, '')
    if (zone && !zones.includes(zone)) zones.push(zone)
  })
  const map: Record<string, string> = {}
  zones.forEach((zone, index) => {
    const hue = TEMP_HUES[index % TEMP_HUES.length]
    map[`${zone}-平均值`] = `hsl(${hue}, 80%, 58%)`
    map[`${zone}-最大值`] = `hsl(${hue}, 95%, 34%)`
  })
  tempColorMap.value = map
}

const getTempColor = (type: string) => tempColorMap.value[type] ?? '#909399'

// 初始化温度曲线图
const initTempChart = () => {
  if (props.type !== 'temp') return

  const container = document.getElementById('tempChart')
  if (!container) return

  tempLineChart.value = new Line(container, {
    data: tempData.value,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    xAxis: {
      title: {
        text: ''
      },
      // 5 分钟档点位较密，标签自动隐藏避免重叠
      label: { autoHide: true, autoRotate: false }
    },
    yAxis: {
      // 根据实际数据动态设置Y轴范围
      ...getAxisRange(tempData.value)
    },
    tooltip: {
      showCrosshairs: true,
      shared: true,
      formatter: (datum) => {
        return {
          name: datum.type,
          value: `${parseFloat(datum.value.toFixed(2))}°C`,
          title: datum.date
        }
      }
    },
    legend: {
      position: 'bottom',
      itemHeight: 16
    },
    color: ({ type }) => getTempColor(type),
    // point: {
    //   size: showPoints.value ? 3 : 0,
    //   shape: 'circle',
    //   style: {
    //     fill: 'white',
    //     stroke: '#FF9800',
    //     lineWidth: 1
    //   }
    // },
    lineStyle: {
      lineWidth: 3 // 增加线条宽度
    },
    animation: {
      appear: {
        animation: 'fade-in',
        duration: 1500 // 增加动画持续时间
      }
    },
    // 确保即使只有一个点也能显示
    connectNulls: true
  })

  tempLineChart.value.render()
}

// 初始化设备态势图
const initDeviceChart = () => {
  if (props.type !== 'device') return

  const container = document.getElementById('deviceChart')
  if (!container) return

  deviceLineChart.value = new Line(container, {
    data: deviceData.value,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    xAxis: {
      title: {
        text: ''
      }
    },
    yAxis: {
      ...getAxisRange(deviceData.value)
    },
    legend: {
      position: 'bottom'
    },
    color: ({ type }) => getColorByType(type),
    point: {
      size: 3,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#1976D2',
        lineWidth: 1
      }
    },
    lineStyle: {
      lineWidth: 3
    },
    animation: {
      appear: {
        animation: 'fade-in',
        duration: 1500
      }
    },
    connectNulls: true
  })

  deviceLineChart.value.render()
}

async function fetching() {
  isLoading.value = true
  try {
    if (props.type === 'temp') {
      // 如果没有选择时间，传递空字符串
      let startDate = ''
      let endDate = ''

      if (selectedDateRange.value && selectedDateRange.value.length === 2) {
        // 日期范围模式
        const [start, end] = selectedDateRange.value
        const formatDateOnly = (date: Date) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }
        startDate = formatDateOnly(start)
        endDate = formatDateOnly(end)
      } else if (selectedDate.value) {
        // 单日期模式（保留向后兼容）
        const timeRange = calculateTimeRange(tempLineQuery.intervalType, selectedDate.value)
        startDate = timeRange.startDate
        endDate = timeRange.endDate
      }

      const query = {
        ...tempLineQuery,
        startDate,
        endDate
      }

      // 5 分钟档后端限制最多 3 天，超限提前提示，避免直接抛出"获取数据失败"
      if (tempLineQuery.intervalType === '5min' && startDate && endDate) {
        const spanDays =
          (new Date(`${endDate}T00:00:00`).getTime() - new Date(`${startDate}T00:00:00`).getTime()) /
          86400000
        if (spanDays > 2) {
          ElMessage.error('选择 5 分钟间隔时，查询时间范围最多 3 天')
          tempData.value = []
          tempLineChart.value?.update({ data: [], yAxis: { min: 0, max: 100 } })
          return
        }
      }

      const result = await fetchTempCurve(query)
      const dataFormat = result?.raw

      if (dataFormat && dataFormat.length > 0) {
        // 数据映射：TempCurveDataRes[] -> DataPoint[]（图例只要「区域-平均值/最大值」，低值线用平均温度）
        const mappedData = mapTempCurveData(dataFormat, tempLineQuery.intervalType, {
          labelMode: 'zone',
          lowValueMode: 'avg'
        })

        tempData.value = mappedData
        buildTempColorMap(mappedData)
        if (tempLineChart.value) {
          // 获取新数据后重新计算Y轴范围
          const axisRange = getAxisRange(mappedData)
          tempLineChart.value.update({
            data: mappedData,
            yAxis: axisRange,
            color: ({ type }: any) => getTempColor(type)
          })
        }
      } else {
        // 返回空数组时清空数据
        tempData.value = []
        console.log('tempData.value', tempData.value)
        if (tempLineChart.value) {
          tempLineChart.value.update({
            data: [],
            yAxis: { min: 0, max: 100 }
          })
        }
      }
    } else if (props.type === 'device') {
      const { deviceData: dataFormat } = await fetchSenseDeviceSevenDays(data?.deviceId)
      if (dataFormat && dataFormat.length > 0) {
        deviceData.value = dataFormat
        console.log('deviceData.value', deviceData.value)
        if (deviceLineChart.value) {
          // 获取新数据后重新计算Y轴范围
          const axisRange = getAxisRange(dataFormat)
          deviceLineChart.value.update({
            data: dataFormat,
            yAxis: axisRange
          })
        }
      } else {
        // 返回空数组时清空数据
        deviceData.value = []
        console.log('deviceData.value', deviceData.value)
        if (deviceLineChart.value) {
          deviceLineChart.value.update({
            data: [],
            yAxis: { min: 0, max: 100 }
          })
        }
      }
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // 默认：今天 + 5 分钟采样间隔（与 CT 一致）
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  selectedDateRange.value = [todayStart, todayEnd]
  tempLineQuery.startDate = formatDateOnly(todayStart)
  tempLineQuery.endDate = formatDateOnly(todayEnd)
  tempLineQuery.intervalType = '5min' // 默认5分钟间隔

  await fetching()

  // 根据类型初始化对应的图表
  if (props.type === 'temp') {
    initTempChart()
    // 如果图表已经初始化，更新数据并重新渲染
    if (tempLineChart.value) {
      // tempLineChart.value.update({ data: tempData.value }) // update 会重置配置，changeData 更平滑
      tempLineChart.value.changeData(tempData.value)
    }
  } else if (props.type === 'device') {
    initDeviceChart()
    // 如果图表已经初始化，更新数据并重新渲染
    if (deviceLineChart.value) {
      // deviceLineChart.value.update({ data: deviceData.value })
      deviceLineChart.value.changeData(deviceData.value)
    }
  }
})

onUnmounted(() => {
  // 销毁图表实例，避免内存泄漏
  if (tempLineChart.value) {
    tempLineChart.value.destroy()
  }
  if (deviceLineChart.value) {
    deviceLineChart.value.destroy()
  }
})
</script>

<style lang="scss" scoped>
.tab-chart {
  width: 100%;
  height: 100%;
  position: relative;

  // 工具条：一行放置所有控件，导出靠最右
  .chart-header {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 28px;

    .quick-group {
      flex: none;
    }

    // 带名称的控件组：名称紧贴控件
    .field-group {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: none;

      .field-label {
        font-size: 12px;
        color: #606266;
        white-space: nowrap;
      }
    }

    // 宽度可缩：窄容器（dashboard 半宽）下优先压缩时间控件，避免挤掉导出
    .query-datetime {
      flex: 0 1 280px;
      min-width: 190px;
    }

    .export-btn {
      margin-left: auto;
      flex: none;
    }
  }

  .chart-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .chart {
    width: 100%;
    height: 400px;
    margin-top: 46px;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.9);
    z-index: 100;
    border-radius: 4px;

    .is-loading {
      font-size: 40px;
      color: #409eff;
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
