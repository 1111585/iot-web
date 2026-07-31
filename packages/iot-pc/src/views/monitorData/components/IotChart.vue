<template>
  <div class="iot-chart">
    <div class="chart-container" :data-title="title">
      <div class="chart-controls">
        <button
          class="control-btn"
          :class="{ active: timeRange === 'day' }"
          @click="switchTimeRange('day')"
        >
          按天
        </button>
        <button
          class="control-btn"
          :class="{ active: timeRange === 'week' }"
          @click="switchTimeRange('week')"
        >
          按周
        </button>
      </div>
      <div id="tempTrendChart" class="chart"></div>
      <!-- 没有数据时显示空状态 -->
      <div v-if="chartData.length === 0" class="no-data-tip">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, defineProps, watch, computed } from 'vue'
import { Line } from '@antv/g2plot'
import { fetchIotSevenDays, fetchIotOneDay } from '../utils'

interface Props {
  // 图表标题
  title?: string
  // 图表数据
  data?: any[]
  // 设备名称
  deviceName?: string
  deviceId?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '温度趋势图',
  data: () => [],
  deviceName: '',
  deviceId: ''
})

// 图表实例
const tempLineChart = ref<Line | null>(null)

// 时间范围：day - 按天（24小时），week - 按周（7天）
const timeRange = ref<'day' | 'week'>('week')

// 切换时间范围
const switchTimeRange = (range: 'day' | 'week') => {
  timeRange.value = range
  updateChart()
}

// 默认数据 - 当没有传入数据时使用
const defaultData = [
  // { date: '2025/5/4', type: '温度1', value: 2.4 },
  // { date: '2025/5/4', type: '温度2', value: 2.0 },
  // { date: '2025/5/5', type: '温度1', value: 4.3 },
  // { date: '2025/5/5', type: '温度2', value: 2.0 },
  // { date: '2025/5/6', type: '温度1', value: 1.8 },
  // { date: '2025/5/6', type: '温度2', value: 3.0 },
  // { date: '2025/5/7', type: '温度1', value: 2.8 },
  // { date: '2025/5/7', type: '温度2', value: 5.0 },
  // { date: '2025/5/8', type: '温度1', value: 2.2 },
  // { date: '2025/5/8', type: '温度2', value: 3.0 },
  // { date: '2025/5/9', type: '温度1', value: 2.1 },
  // { date: '2025/5/9', type: '温度2', value: 3.7 },
  // { date: '2025/5/10', type: '温度1', value: 1.8 },
  // { date: '2025/5/10', type: '温度2', value: 5.0 }
]

// 生成设备的历史温度数据
const generateDeviceData = () => {
  if (!props.deviceName) return defaultData
  if (timeRange.value === 'week') {
    // 生成过去7天的日期
    return generateDataForRange(7, 'day')
  } else {
    // 生成过去24小时的数据
    return generateDataForRange(24, 'hour')
  }
}

// 根据指定范围生成数据
const generateDataForRange = (count: number, unit: 'day' | 'hour') => {
  // 生成日期数组
  const dates: string[] = []
  const now = new Date()

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now)

    if (unit === 'day') {
      date.setDate(now.getDate() - i)
      dates.push(date.toISOString().split('T')[0].replace(/-/g, '/'))
    } else {
      date.setHours(now.getHours() - i)
      // 对于小时视图，使用日期+小时格式
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '/')
      const hourStr = date.getHours().toString().padStart(2, '0')
      dates.push(`${dateStr} ${hourStr}:00`)
    }
  }

  // 使用设备名称作为随机种子，确保同一设备每次生成的数据相同
  const seed = props.deviceName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  // 生成温度数据
  const result: { date: string; type: string; value: number }[] = []

  // 为每个温度点生成初始值和变化趋势
  const trends: number[] = [0.1, -0.15, 0.05, -0.1, 0.2]
  const initialValues: number[] = [3.0, 2.8, 3.5, 4.5, 1.6]

  // 为每个日期生成温度数据
  dates.forEach((date, dateIndex) => {
    // 为每个日期生成5个温度点
    for (let i = 1; i <= 5; i++) {
      // 根据初始值和趋势计算基础值
      const baseValue = initialValues[i - 1] + trends[i - 1] * dateIndex

      // 添加随机波动
      const seedValue = seed + i * 100 + dateIndex
      const randomFactor =
        (Math.sin(seedValue) * 10000 - Math.floor(Math.sin(seedValue) * 10000)) * 0.6 - 0.3

      // 计算最终值并保留一位小数
      const value = parseFloat((baseValue + randomFactor).toFixed(1))

      result.push({
        date,
        type: `温度${i}`,
        value
      })
    }
  })

  return result
}

// API 数据
const weekData = ref<any[]>([])
const dayData = ref<any[]>([])

// 格式化API数据为图表所需格式
const formatApiData = (data: any[], timeUnit: 'day' | 'hour' = 'day') => {
  if (!data || data.length === 0) return []

  return data.flatMap((item) => {
    const result: { date: string; type: string; value: number }[] = []

    // 处理日期格式 - 使用crtime而不是date
    const date =
      timeUnit === 'day'
        ? item.crtime.split(' ')[0].replace(/-/g, '/')
        : `${item.crtime.split(' ')[0].replace(/-/g, '/')} ${item.crtime.split(' ')[1].substring(0, 5)}`

    // 处理温度数据点
    for (let i = 1; i <= 5; i++) {
      if (item[`temp${i}`] !== undefined) {
        result.push({
          date,
          type: `温度${i}`,
          value:
            typeof item[`temp${i}`] === 'string' ? parseFloat(item[`temp${i}`]) : item[`temp${i}`]
        })
      }
    }

    return result
  })
}

// 计算实际使用的数据
const chartData = computed(() => {
  // 1. 如果传入了props.data，优先使用
  if (props.data && props.data.length > 0) {
    return props.data
  }

  // 2. 根据当前时间范围使用对应的API数据
  if (timeRange.value === 'week' && weekData.value.length > 0) {
    return formatApiData(weekData.value, 'day')
  } else if (timeRange.value === 'day' && dayData.value.length > 0) {
    return formatApiData(dayData.value, 'hour')
  }

  // 3. 如果没有API数据，返回空数组，显示暂无数据
  return []
})

// 初始化温度曲线图
const initTempChart = () => {
  const container = document.getElementById('tempTrendChart')
  if (!container) return

  tempLineChart.value = new Line(container, {
    data: chartData.value,
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
      // 移除固定的min和max，让图表自动计算合适的范围
      // 或者可以设置一个更大的范围
      min: 0,
      // 不设置max，让图表自动计算最大值
      // 如果需要固定范围，可以设置一个足够大的值，如：max: 50
    },
    legend: {
      position: 'bottom'
    },
    color: ['#FF9800', '#FFD600', '#4CAF50', '#2196F3', '#9C27B0'],
    point: {
      size: 3
    },
    animation: {
      appear: {
        animation: 'fade-in'
      }
    }
  })

  tempLineChart.value.render()
}

// 更新图表数据
const updateChart = () => {
  if (!tempLineChart.value) return

  // 销毁旧图表
  tempLineChart.value.destroy()

  // 重新初始化图表
  initTempChart()
}

// 监听数据变化
watch(
  () => props.data,
  () => {
    if (tempLineChart.value) {
      updateChart()
    }
  },
  { deep: true }
)

// 监听设备名称或ID变化
watch(
  [() => props.deviceName, () => props.deviceId],
  async () => {
    if (props.deviceId) {
      await fetching()
    }
    if (tempLineChart.value) {
      updateChart()
    }
  },
  { immediate: false }
)

// 监听标题变化
watch(
  () => props.title,
  () => {
    // 标题变化时不需要重新渲染图表，只需更新DOM
  },
  { immediate: true }
)

async function fetching() {
  if (!props.deviceId) return

  try {
    // 获取按天数据
    const dayResult = await fetchIotOneDay(props.deviceId)
    if (dayResult?.raw) {
      dayData.value = dayResult.raw
    }

    // 获取按周数据
    const weekResult = await fetchIotSevenDays(props.deviceId)
    if (weekResult?.raw) {
      weekData.value = weekResult.raw
    }

    // 更新图表
    if (tempLineChart.value) {
      updateChart()
    }
  } catch (error) {
    console.error('获取IoT数据失败:', error)
  }
}
onMounted(async () => {
  if (props.deviceId) {
    await fetching()
  }
  initTempChart()
})

onUnmounted(() => {
  // 销毁图表实例，避免内存泄漏
  if (tempLineChart.value) {
    tempLineChart.value.destroy()
  }
})
</script>

<style lang="scss" scoped>
.iot-chart {
  width: 100%;
  height: 100%;

  .chart-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
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

  .chart-controls {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 5px;
    z-index: 10;
  }

  .control-btn {
    padding: 4px 8px;
    border: 1px solid #e0e0e0;
    background-color: #f5f5f5;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;

    &.active {
      background-color: #2196f3;
      color: white;
      border-color: #2196f3;
    }

    &:hover {
      border-color: #2196f3;
    }
  }

  .chart {
    width: 100%;
    height: 400px;
    margin-top: 40px;
  }
  
  .no-data-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    color: #999;
    background-color: rgba(245, 245, 245, 0.8);
    padding: 10px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
</style>
