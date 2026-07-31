<template>
  <div class="tab-chart">
    <div class="chart-header" v-if="props.type === 'temp'">
      <el-select
        v-model="tempLineQuery.intervalType"
        placeholder="选择时间间隔"
        style="width: 120px"
        size="small"
        @change="handleIntervalChange"
      >
        <el-option
          v-for="item in intervalOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-date-picker
        v-model="selectedDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY/MM/DD"
        size="small"
        style="width: 280px; margin-left: 10px"
        :disabledDate="disableFutureDate"
        @change="handleTimeChange"
      />
    </div>
    <section v-if="props.type === 'temp'" class="chart-container" data-title="温度曲线">
      <div v-if="isLoading" class="loading-overlay">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
      </div>
      <div id="tempChart" class="chart"></div>
    </section>
    <section v-if="props.type === 'device'" class="chart-container" data-title="设备态势图">
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
import { onMounted, onUnmounted, ref, inject, reactive, computed, watch } from 'vue'
import { Line } from '@antv/g2plot'
import { Loading } from '@element-plus/icons-vue'
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
  intervalType: '4' // 时间间隔（1:1小时，2:2小时，3:4小时，4:1天，5:1周）
})

// 时间间隔选项
const intervalOptions = [
  { label: '1小时', value: '1' },
  { label: '2小时', value: '2' },
  { label: '4小时', value: '3' },
  { label: '1天', value: '4' },
  { label: '1周', value: '5' }
]

const showPoints = computed(() => tempLineQuery.intervalType !== '5')

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

// 加载状态
const isLoading = ref(false)

type DataPoint = { date: string; type: string; value: number }

// 共用温度时间范围计算
const calculateTimeRange = (intervalType: string, referenceDate = new Date()) =>
  calculateTempTimeRange(intervalType, referenceDate)

const tempData = ref<DataPoint[]>([])

const deviceData = ref<DataPoint[]>([])

const handleIntervalChange = () => {
  // 表单绑定不需要清空，只处理数据逻辑
  fetching()
}

// 处理时间切换
const handleTimeChange = () => {
  if (selectedDateRange.value && selectedDateRange.value.length === 2) {
    // 日期范围模式
    const [startDate, endDate] = selectedDateRange.value
    const formatDateOnly = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    tempLineQuery.startDate = formatDateOnly(startDate)
    tempLineQuery.endDate = formatDateOnly(endDate)
    // 默认选中1天间隔
    tempLineQuery.intervalType = '4'
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

// 动态生成颜色（基于字符串哈希，保证同一名称颜色固定且清晰）
const getColorByType = (type: string) => {
  let hash = 0
  for (let i = 0; i < type.length; i++) {
    hash = type.charCodeAt(i) + ((hash << 5) - hash)
  }
  // 使用 HSL 确保颜色可见性
  // Hue: 0-360 (由 hash 决定)
  // Saturation: 70% (保持鲜艳)
  // Lightness: 45% (避免太亮看不清，或太暗)
  const h = Math.abs(hash % 360)
  return `hsl(${h}, 70%, 45%)`
}

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
      }
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
    color: ({ type }) => getColorByType(type),
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

      const result = await fetchTempCurve(query)
      const dataFormat = result?.raw

      if (dataFormat && dataFormat.length > 0) {
        // 数据映射：TempCurveDataRes[] -> DataPoint[]
        const mappedData = mapTempCurveData(dataFormat)

        tempData.value = mappedData
        console.log('tempData.value', tempData.value)
        if (tempLineChart.value) {
          // 获取新数据后重新计算Y轴范围
          const axisRange = getAxisRange(mappedData)
          tempLineChart.value.update({
            data: mappedData,
            yAxis: axisRange
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
  // 设置默认时间范围为过去一周
  const today = new Date()
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  selectedDateRange.value = [oneWeekAgo, today]
  const formatDateOnly = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  tempLineQuery.startDate = formatDateOnly(oneWeekAgo)
  tempLineQuery.endDate = formatDateOnly(today)
  tempLineQuery.intervalType = '4' // 默认1天间隔

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

  .chart-header {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
  }

  .chart-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    &::before {
      content: attr(data-title);
      position: absolute;
      top: 10px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 16px;
      font-weight: bold;
    }
  }

  .chart {
    width: 100%;
    height: 400px;
    margin-top: 40px;
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
