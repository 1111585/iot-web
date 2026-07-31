<template>
  <div class="chart-container">
    <!-- 标题区域使用el-tabs -->
    <div class="chart-header">
      <el-tabs v-model="activeTab" class="chart-tabs">
        <el-tab-pane label="预警事件统计看板" name="statistics"></el-tab-pane>
        <el-tab-pane label="预警事件趋势统计" name="trend"></el-tab-pane>
        <el-tab-pane label="温度趋势统计" name="temp"> </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 筛选条件区域 -->
    <div v-if="activeTab !== 'temp'" class="filter-area">
      <div class="filter-row">
        <!-- <div class="filter-item">
          <span class="filter-label">设备智能监测报警：</span>
          <el-input v-model="deviceId" placeholder="请输入设备编号或名称" clearable></el-input>
        </div> -->
        <div class="filter-item">
          <span class="filter-label">双光源预警报警：</span>
          <el-select v-model="dualLightAlarm" placeholder="请选择预警类型" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option
              v-for="item in senseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">区域：</span>
          <el-select v-model="region" placeholder="请选择区域" clearable>
            <el-option label="全部区域" value=""></el-option>
            <el-option
              v-for="item in locationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">处理状态：</span>
          <el-select v-model="chartQuery.disposeType" placeholder="请选择处理状态" clearable>
            <el-option label="初次预警(未处理)" :value="1"></el-option>
            <el-option label="已处理" :value="2"></el-option>
            <el-option label="已确认" :value="3"></el-option>
            <el-option label="已忽略" :value="4"></el-option>
          </el-select>
        </div>
      </div>
    </div>

    <div v-else class="filter-area">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">选择设备：</span>
          <el-select
            v-model="tempLineQuery.deviceIds"
            placeholder="请选择设备"
            multiple
            clearable
            collapse-tags
            @change="handleTempTimeChange"
            style="width: 275px"
          >
            <el-option
              v-for="item in senseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
        <div v-if="activeTab === 'temp'" style="margin-left: auto">
          <el-button type="primary" plain icon="i-ep-download" @click="onExport">导出</el-button>
        </div>
      </div>
    </div>

    <!-- 时间间隔选择和日期选择器 -->
    <div class="time-selection">
      <!-- 预警事件统计的时间选择 -->
      <template v-if="activeTab !== 'temp'">
        <div class="time-interval-select">
          <span class="interval-label">时间间隔：</span>
          <el-select
            v-model="timeInterval"
            @change="handleTimeIntervalChange"
            clearable
            placeholder="请选择时间间隔"
            style="width: 140px"
          >
            <el-option label="1小时" value="1h"></el-option>
            <el-option label="2小时" value="2h"></el-option>
            <el-option label="1天" value="1d"></el-option>
            <el-option label="2天" value="2d"></el-option>
            <el-option label="1周" value="1w"></el-option>
            <el-option label="2周" value="2w"></el-option>
            <el-option label="1月" value="1m"></el-option>
            <el-option label="2月" value="2m"></el-option>
          </el-select>
        </div>
        <div class="date-picker">
          <el-date-picker
            v-model="datePicker"
            type="month"
            format="YYYY-MM"
            value-format="YYYY-MM"
            placeholder="选择月份"
            style="width: 140px; margin-left: 10px"
            @change="handleDateChange"
          ></el-date-picker>
        </div>
      </template>

      <!-- 温度趋势统计的时间选择 -->
      <template v-if="activeTab === 'temp'">
        <div class="time-interval-select">
          <span class="interval-label">时间间隔：</span>
          <!-- TODO @change="handleTempTimeChange" -->
          <el-select
            v-model="tempLineQuery.intervalType"
            placeholder="选择时间间隔"
            style="width: 120px"
            @change="handleIntervalChange"
          >
            <el-option label="1小时" value="1"></el-option>
            <el-option label="2小时" value="2"></el-option>
            <el-option label="4小时" value="3"></el-option>
            <el-option label="1天" value="4"></el-option>
            <el-option label="1周" value="5"></el-option>
          </el-select>
        </div>
        <div class="date-picker">
          <el-date-picker
            v-model="tempDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY/MM/DD"
            style="width: 280px"
            :disabledDate="disableFutureDate"
            @change="handleTempTimeChange"
          ></el-date-picker>
        </div>
      </template>
    </div>

    <!-- 图表区域 -->
    <div class="chart-area-wrapper">
      <div v-if="isLoading" class="loading-overlay">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
      </div>
      <div ref="chartRef" class="chart-area"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from '@antv/g2plot'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import {
  calculateTempTimeRange,
  getAxisRange,
  mapTempCurveData,
  type TempDataPoint
} from '@/views/eventCenter/utils/tempChart'
import { request } from '@/util/request'
import { chartApi } from '@/apis/chart'
import { fetchBindingLocationOptions, fetchTempCurve } from '@/views/deviceManage/utils'
import { fetchOptions } from '@/views/monitorCenter/utils'

// API返回的数据结构
interface ChartItem {
  hour: string // 时间
  name: string // 事件名称
  num: number // 数量
}

interface ChartRes {
  arcFlashWarning: ChartItem[] // 电弧闪烁
  temperatureOneWarning: ChartItem[] // 超温事件一级
  temperatureTwoWarning: ChartItem[] // 超温事件二级
}

// 图表查询参数
const chartQuery = reactive({
  disposeType: '', // 处置状态 1:初次预警(未处理)、2:已处理、3:已确认，4:已忽略
  levelType: '', // 事件类型 1:电弧闪烁、2:超温事件一级、3:超温事件二级
  monitoringDeviceId: '', // 监测设备ID
  sensingDeviceId: '', // 感知设备ID
  owningPointId: '', // 所属点位ID
  startTime: '', // 开始时间
  endTime: '' // 结束时间
})

// 温度相关的响应式变量
// 目前逻辑：startDate和intervalType只能一个有值
const tempLineQuery = reactive({
  deviceIds: [] as string[], // 设备id, 多个以 , 拼接
  startDate: '', // 开始时间
  endDate: '', // 结束时间
  intervalType: '4' // 时间间隔（1:1小时，2:2小时，3:4小时，4:1天，5:1周）
})

// 筛选条件
const deviceId = ref('')
const dualLightAlarm = ref('')
const region = ref('')
const locationOptions = ref<ARC.Options[]>([]) // 区域选项
const senseOptions = ref<ARC.Options[]>([]) // 双光源预警选项
const timeInterval = ref('1m')
const datePicker = ref('')
const activeTab = ref<string | number>('temp') // 默认选中预警事件趋势统计页签

const tempSelectedDate = ref<Date | undefined>(undefined)
const tempDateRange = ref<[Date, Date] | undefined>(undefined)
const isLoading = ref(false)

// 禁用未来日期
const disableFutureDate = (date: Date) => {
  return date > new Date()
}

watch(
  () => tempLineQuery.intervalType,
  (newVal) => {
    if (activeTab.value === 'temp' && newVal) {
      tempLineQuery.startDate = ''
      tempSelectedDate.value = undefined
    }
  }
)

// 图表数据和引用
const chartRef = ref<HTMLElement | null>(null)
const chartData = ref<any[]>([])
const legendItems = ref<string[]>([])
let lineChart: Line | null = null

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

// 根据索引获取颜色
const getColorByIndex = (index: number) => {
  // 既然已经动态生成，这里可以保留一个备用逻辑或直接废弃
  return `hsl(${(index * 137.5) % 360}, 70%, 45%)`
}

// 处理时间间隔选择变化
const handleTimeIntervalChange = () => {
  updateTimeRange(timeInterval.value)
  fetchChartData()
}

// 更新时间范围
const updateTimeRange = (interval: string) => {
  const now = new Date()
  let endDate: Date
  let startDate: Date

  // 小时级别的筛选使用当前时间作为结束时间
  if (interval === '1h' || interval === '2h') {
    endDate = new Date(now) // 使用当前时间作为结束时间
    startDate = new Date(now) // 从当前时间往前计算

    if (interval === '1h') {
      startDate.setHours(startDate.getHours() - 1)
    } else {
      // '2h'
      startDate.setHours(startDate.getHours() - 2)
    }
  } else {
    // 其他时间间隔使用当天结束时间和当天开始时间
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)

    switch (interval) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1)
        break
      case '2d':
        startDate.setDate(startDate.getDate() - 2)
        break
      case '1w':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '2w':
        startDate.setDate(startDate.getDate() - 14)
        break
      case '1m':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case '2m':
        startDate.setMonth(startDate.getMonth() - 2)
        break
      default:
        startDate.setMonth(startDate.getMonth() - 1) // 默认为1个月
    }
  }

  chartQuery.startTime = formatDate(startDate)
  chartQuery.endTime = formatDate(endDate)
}

// 格式化日期
const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 日期选择器变更处理
const handleDateChange = () => {
  if (datePicker.value) {
    const [year, month] = datePicker.value.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    chartQuery.startTime = formatDate(startDate)
    chartQuery.endTime = formatDate(endDate)
    fetchChartData()
  }
}

// 温度时间变更处理
const handleTempTimeChange = async () => {
  if (tempDateRange.value && tempDateRange.value.length === 2) {
    // 日期范围模式
    const [startDate, endDate] = tempDateRange.value
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
  } else if (tempSelectedDate.value) {
    // 单日期模式（保留向后兼容）
    const timeRange = calculateTempTimeRange(tempLineQuery.intervalType, tempSelectedDate.value)
    tempLineQuery.startDate = timeRange.startDate
    tempLineQuery.endDate = timeRange.endDate
  } else {
    tempLineQuery.startDate = ''
    tempLineQuery.endDate = ''
  }

  await fetchTempChartData()
}

const handleIntervalChange = async () => {
  // 表单绑定不需要清空，只处理数据逻辑
  await fetchTempChartData()
}

// 获取温度图表数据
const fetchTempChartData = async () => {
  isLoading.value = true
  try {
    // 处理 deviceIds：如果是数组，转换为逗号分隔的字符串
    const query = {
      ...tempLineQuery,
      deviceIds: Array.isArray(tempLineQuery.deviceIds)
        ? tempLineQuery.deviceIds.join(',')
        : tempLineQuery.deviceIds
    }
    const result = await fetchTempCurve(query)
    const dataFormat = result?.raw

    if (dataFormat && Array.isArray(dataFormat) && dataFormat.length > 0) {
      const mappedData = mapTempCurveData(dataFormat)
      chartData.value = mappedData
      renderTempChart(mappedData, tempLineQuery.intervalType)
    } else {
      chartData.value = []
      renderEmptyChart()
    }
  } catch (error) {
    ElMessage.error('获取温度数据失败')
    console.error('获取温度数据失败:', error)
    chartData.value = []
    renderEmptyChart()
  } finally {
    isLoading.value = false
  }
}

// 获取图表数据
const fetchChartData = async () => {
  // 如果是温度趋势统计，调用温度数据获取函数
  if (activeTab.value === 'temp') {
    await fetchTempChartData()
    return
  }

  try {
    // 根据当前激活的标签页选择不同的API端点
    const apiEndpoint =
      activeTab.value === 'statistics' ? chartApi.event.getChartBord : chartApi.event.getChart

    console.log('当前标签页:', activeTab.value, '使用接口:', apiEndpoint)

    // 创建查询参数，只包含非空值
    const queryParams = Object.entries(chartQuery).reduce(
      (acc, [key, value]) => {
        // 只添加非空值，对于开始和结束时间，只有在存在值时才添加
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, any>
    )

    const { data } = await request.get<any, ChartRes>(apiEndpoint, queryParams)
    console.log('接口返回数据:', data)

    if (data) {
      // 合并三种类型的警告数据，保留原始name值
      const allWarnings = [
        ...data.arcFlashWarning,
        ...data.temperatureOneWarning,
        ...data.temperatureTwoWarning
      ]

      // 按时间顺序对数据进行排序
      allWarnings.sort((a, b) => {
        const dateA = new Date(a.hour).getTime()
        const dateB = new Date(b.hour).getTime()
        return dateA - dateB
      })

      if (allWarnings.length > 0) {
        // 提取唯一的事件名称用于图例
        const uniqueNames = [...new Set(allWarnings.map((item) => item.name))]
        legendItems.value = uniqueNames
        console.log('图例项目:', legendItems.value)

        chartData.value = allWarnings
        renderChart()
      } else {
        // 如果没有数据，显示暂无数据提示
        chartData.value = []
        renderEmptyChart()
      }
    } else {
      console.warn('接口返回的数据格式不正确:', data)
      ElMessage.warning('接口返回数据格式不正确')
      chartData.value = []
      renderEmptyChart()
    }
  } catch (error) {
    ElMessage.error('获取图表数据失败')
    console.error('获取图表数据失败:', error)
    chartData.value = []
    renderEmptyChart()
  }
}

// 渲染图表
const renderChart = () => {
  if (!chartRef.value) return

  if (lineChart) {
    lineChart.destroy()
  }

  // 对原始数据进行预处理
  // 1. 将数据按类型分组
  const dataByType = {}
  chartData.value.forEach((item) => {
    if (!dataByType[item.name]) {
      dataByType[item.name] = []
    }
    // 直接使用原始时间格式，不再拆分日期和时间
    dataByType[item.name].push({
      ...item,
      // 保留完整的时间信息用于X轴显示
      timeLabel: item.hour
    })
  })

  // 2. 将数据转换为图表可用格式
  const processedData: Array<{
    timeLabel: string
    type: string
    value: number
  }> = []

  Object.keys(dataByType).forEach((type) => {
    dataByType[type].forEach((item) => {
      processedData.push({
        timeLabel: item.timeLabel, // 使用完整时间作为X轴
        type: item.name,
        value: item.num
      })
    })
  })

  // 按时间排序
  processedData.sort((a, b) => new Date(a.timeLabel).getTime() - new Date(b.timeLabel).getTime())

  lineChart = new Line(chartRef.value, {
    data: processedData,
    xField: 'timeLabel', // 使用完整时间作为X轴
    yField: 'value', // 使用value作为Y轴
    seriesField: 'type', // 按类型分组
    smooth: true, // 开启平滑曲线，使线条更平滑
    connectNulls: false, // 不连接空值点
    appendPadding: [10, 0, 0, 0],
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1000
      }
    },
    legend: {
      position: 'top-right'
    },
    color: ({ type }) => getColorByType(type),
    xAxis: {
      type: 'timeCat', // 使用时间分类轴，更适合离散时间点
      tickCount: 8, // 控制刻度数量，避免过密
      label: {
        autoRotate: true,
        autoHide: false,
        autoEllipsis: true,
        formatter: (text) => {
          // 检查是否有小时信息
          const hasTime = text.includes(' ')
          if (hasTime) {
            // 如果有小时信息，处理带有时间的格式
            const [datePart, timePart] = text.split(' ')
            const [year, month, day] = datePart.split('-')
            return `${month}-${day} ${timePart}`
          } else if (text.includes('-')) {
            // 如果是日期格式，处理仅有日期的格式
            const parts = text.split('-')
            if (parts.length >= 3) {
              return `${parts[1]}-${parts[2]}` // 显示月-日
            } else if (parts.length === 2) {
              return text // 如果已经是月-年格式，直接返回
            }
          }
          return text // 其他情况直接返回原文本
        }
      }
    },
    yAxis: {
      label: {
        formatter: (v) => `${v}`
      },
      nice: true,
      grid: {
        line: {
          style: {
            stroke: '#eee',
            lineDash: [4, 4]
          }
        }
      }
    },
    tooltip: {
      showCrosshairs: true,
      shared: true,
      formatter: (datum) => {
        return {
          name: datum.type,
          value: datum.value,
          title: datum.timeLabel // 使用原始时间作为提示标题
        }
      }
    },
    state: {
      active: {
        style: {
          visible: true,
          r: 5,
          lineWidth: 2,
          stroke: '#fff',
          fill: 'transparent'
        }
      }
    },
    interactions: [{ type: 'element-active' }, { type: 'legend-highlight' }]
  })

  lineChart.render()
}

// 渲染温度图表
const renderTempChart = (data: TempDataPoint[], intervalType?: string) => {
  if (!chartRef.value) return

  // 按日期排序
  const sortedData = [...data].sort((a, b) => {
    const timeA = new Date(a.date.replace(' ', 'T')).getTime()
    const timeB = new Date(b.date.replace(' ', 'T')).getTime()
    return timeA - timeB
  })

  const axisRange = getAxisRange(sortedData)

  // 销毁旧图表
  if (lineChart) {
    lineChart.destroy()
    lineChart = null
  }

  // 创建新图表
  lineChart = new Line(chartRef.value, {
    data: sortedData,
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
      ...axisRange
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
      position: 'top',
      itemHeight: 16
    },
    color: ({ type }) => getColorByType(type),
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

  lineChart.render()
}

// 渲染空数据图表，显示“暂无数据”提示
const renderEmptyChart = () => {
  if (!chartRef.value) return

  if (lineChart) {
    lineChart.destroy()
    lineChart = null
  }

  // 创建一个空图表
  lineChart = new Line(chartRef.value, {
    data: [],
    xField: 'hour',
    yField: 'num',
    seriesField: 'name',
    appendPadding: [0, 0, 0, 0],
    legend: false,
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: false
      }
    },
    yAxis: {
      min: 0,
      max: 100
    },
    // 添加暂无数据的文本注释
    annotations: [
      {
        type: 'text',
        position: ['50%', '50%'],
        content: '暂无数据',
        style: {
          fill: '#999',
          fontSize: 20,
          textAlign: 'center',
          fontWeight: 'bold'
        }
      }
    ]
  })

  lineChart.render()
}

// 监听筛选条件变化
watch([deviceId, dualLightAlarm, region], () => {
  chartQuery.monitoringDeviceId = deviceId.value
  chartQuery.sensingDeviceId = dualLightAlarm.value
  chartQuery.owningPointId = region.value
  fetchChartData()
})

// 监听处理状态变化
watch(
  () => chartQuery.disposeType,
  () => {
    fetchChartData()
  }
)

// 监听标签页切换
watch(activeTab, () => {
  console.log('标签页切换为:', activeTab.value)
  fetchChartData()
})

// 获取区域选项
const fetchLocationOptions = async () => {
  try {
    const result = await fetchBindingLocationOptions()
    if (result && result.options) {
      locationOptions.value = result.options
    }
  } catch (error) {
    console.error('获取区域选项失败', error)
  }
}

// 获取双光源预警选项
const fetchSenseOptions = async () => {
  try {
    // 使用 fetchOptions 函数获取感知设备选项，传入类型参数 3
    const result = await fetchOptions(3, 'v2')
    if (result && result.options && result.options.sense) {
      senseOptions.value = result.options.sense
    }
  } catch (error) {
    console.error('获取双光源预警选项失败', error)
  }
}

const onExport = async () => {
  try {
    request.downloadStream(
      chartApi.device.sense.exportTempCurveData,
      undefined,
      {
        ...tempLineQuery,
        deviceIds: tempLineQuery.deviceIds.join(',')
      },
      'GET'
    )
  } catch (error) {
    console.error('导出失败', error)
  }
}

// 监听标签页切换
watch(activeTab, () => {
  fetchChartData()
})

// 组件挂载时初始化
onMounted(async () => {
  await nextTick()
  console.log('onMounted: chartRef.value available:', !!chartRef.value)

  // 设置默认时间范围为过去一周
  const today = new Date()
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  tempDateRange.value = [oneWeekAgo, today]
  const formatDateOnly = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  tempLineQuery.startDate = formatDateOnly(oneWeekAgo)
  tempLineQuery.endDate = formatDateOnly(today)
  tempLineQuery.intervalType = '4' // 默认1天间隔

  updateTimeRange(timeInterval.value)
  fetchLocationOptions()
  fetchSenseOptions().then(() => {
    if (activeTab.value === 'temp') {
      tempLineQuery.deviceIds = [senseOptions.value[0].value as string]
    }
    fetchChartData()
  })
})
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  // height: calc(100vh - 120px); /* 使用视口高度减去头部和边距 */
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.chart-header {
  margin-bottom: 16px;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 1.5px;
  }

  :deep(.el-tabs__item) {
    font-size: 16px;
    height: 40px;
    line-height: 40px;
  }
}

.filter-area {
  margin-bottom: 16px;

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .filter-item {
    display: flex;
    align-items: center;
    margin-right: 16px;
    margin-bottom: 8px;

    &:last-child {
      margin-right: 0;
    }

    .filter-label {
      white-space: nowrap;
      margin-right: 8px;
      color: #606266;
      font-size: 14px;
    }

    .el-input,
    .el-select {
      width: 160px;
    }
  }
}

.time-selection {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 12px 0;

  .time-interval-select {
    display: flex;
    align-items: center;
    margin-right: 16px;

    .interval-label {
      margin-right: 8px;
      white-space: nowrap;
      color: #606266;
      font-size: 14px;
    }

    .el-select {
      width: 120px;
    }
  }

  .date-picker {
    display: flex;
    align-items: center;
    gap: 8px;

    .search-button {
      padding: 8px 12px;
    }
  }
}

.chart-area-wrapper {
  flex: 1;
  min-height: 500px;
  width: 100%;
  position: relative;
  background-color: #fff;
}

.chart-area {
  flex: 1;
  min-height: 500px; /* Increased minimum height */
  width: 100%;
  position: relative;
  background-color: #fff;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.el-button--primary:hover {
  color: var(--el-color-primary);
}
</style>
