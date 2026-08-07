<template>
  <div class="iot-chart">
    <div class="chart-container" :data-title="title">
      <div class="chart-controls">
        <button class="control-btn" :class="{ active: timeRange === 'day' }" @click="switchTimeRange('day')">按天</button>
        <button class="control-btn" :class="{ active: timeRange === 'week' }" @click="switchTimeRange('week')">按周</button>
      </div>
      <div id="tempTrendChart" class="chart"></div>
      <div v-if="isEmpty" class="no-data-tip">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { Line } from '@antv/g2plot'
import { fetchTcRecords } from '../utils'

interface Props {
  title?: string
  deviceId?: string
}
const props = withDefaults(defineProps<Props>(), { title: '三相电流趋势图', deviceId: '' })

const tempLineChart = ref<Line | null>(null)
const timeRange = ref<'day' | 'week'>('week')
const chartData = ref<any[]>([])
const isEmpty = ref(true)

const switchTimeRange = (range: 'day' | 'week') => { timeRange.value = range; fetching() }

async function fetching() {
  if (!props.deviceId) return
  try {
    const days = timeRange.value === 'week' ? 7 : 1
    const result = await fetchTcRecords(props.deviceId, days)
    if (result?.raw && result.raw.length > 0) {
      isEmpty.value = false
      chartData.value = result.raw.flatMap((item: any) => {
        const ts = item.collectTime ? item.collectTime.substring(0, 16) : ''
        return [
          { date: ts, type: 'A相', value: item.currentA ?? 0 },
          { date: ts, type: 'B相', value: item.currentB ?? 0 },
          { date: ts, type: 'C相', value: item.currentC ?? 0 }
        ]
      })
    } else {
      isEmpty.value = true
      chartData.value = []
    }
    updateChart()
  } catch (e) {
    console.error('获取TC趋势数据失败:', e)
  }
}

function initChart() {
  const el = document.getElementById('tempTrendChart')
  if (!el || chartData.value.length === 0) return
  if (tempLineChart.value) tempLineChart.value.destroy()
  tempLineChart.value = new Line(el, {
    data: chartData.value, xField: 'date', yField: 'value', seriesField: 'type',
    smooth: true, yAxis: { min: 0 },
    legend: { position: 'bottom' },
    color: ['#F56C6C', '#67C23A', '#409EFF'],
    point: { size: 3 }
  })
  tempLineChart.value.render()
}

function updateChart() {
  if (tempLineChart.value) tempLineChart.value.destroy()
  initChart()
}

onMounted(async () => { await fetching(); initChart() })
onUnmounted(() => { if (tempLineChart.value) tempLineChart.value.destroy() })
</script>

<style lang="scss" scoped>
.iot-chart { .chart-container { .chart-controls { text-align: right; margin-bottom: 10px;
  .control-btn { padding: 4px 16px; border: 1px solid #dcdfe6; background: #fff; cursor: pointer;
    &:first-child { border-radius: 4px 0 0 4px; } &:last-child { border-radius: 0 4px 4px 0; }
    &.active { background: #409eff; color: #fff; border-color: #409eff; } } }
  .chart { width: 100%; height: 400px; } .no-data-tip { text-align: center; color: #999; padding: 100px 0; } } }
</style>