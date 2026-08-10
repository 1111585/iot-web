<template>
  <div class="alarm-chart">
    <div id="alarmTrendChart" class="chart" ref="chartRef"></div>
    <div v-if="isEmpty" class="no-data-tip">暂无告警明细数据</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Line } from '@antv/g2plot'
import { request } from '@/util/request'
import { chartApi } from '@/apis/chart'

interface Props {
  deviceId: string
  warningId: number
  threshold?: number | string
  triggerTime?: number
  triggerPhase?: string
}
const props = defineProps<Props>()

const chartRef = ref<HTMLElement | null>(null)
const isEmpty = ref(false)
let chart: Line | null = null

interface AlarmPoint {
  sampleTimestamp: number
  currentA: number
  currentB: number
  currentC: number
  currentO: number
}

async function fetchData(): Promise<AlarmPoint[]> {
  try {
    const { data } = await request.get<any, any[]>(chartApi.getAlarmDetail, {
      deviceId: props.deviceId,
      warningId: props.warningId
    })
    return (data || []).map((r: any) => ({
      sampleTimestamp: r.sample_timestamp,
      currentA: r.current_a ?? 0,
      currentB: r.current_b ?? 0,
      currentC: r.current_c ?? 0,
      currentO: r.current_o ?? 0
    }))
  } catch {
    return []
  }
}

function render(points: AlarmPoint[]) {
  if (!chartRef.value) return
  if (chart) { chart.destroy(); chart = null }

  if (!points || points.length === 0) { isEmpty.value = true; return }
  isEmpty.value = false

  const chartData = points.flatMap(p => {
    const d = new Date(Number(p.sampleTimestamp))
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    const ts = hh + ':' + mm + ':' + ss
    return [
      { time: ts, type: 'A相', value: p.currentA ?? 0 },
      { time: ts, type: 'B相', value: p.currentB ?? 0 },
      { time: ts, type: 'C相', value: p.currentC ?? 0 },
      { time: ts, type: 'O相', value: p.currentO ?? 0 }
    ]
  })

  const annotations: any[] = []

  // 阈值虚线
  const t = Number(props.threshold)
  if (!isNaN(t) && t > 0) {
    annotations.push({
      type: 'line',
      start: ['min', t], end: ['max', t],
      style: { stroke: '#e6a23c', lineWidth: 2, lineDash: [4, 4] },
      text: { content: '阈值 ' + t + 'A', position: 'end', style: { fill: '#e6a23c', fontSize: 11 } }
    })
  }

  // 触发点竖线
  const triggerMs = Number(props.triggerTime)
  if (!isNaN(triggerMs) && triggerMs > 0) {
    const d = new Date(triggerMs)
    const tt = String(d.getHours()).padStart(2, '0') + ':' +
               String(d.getMinutes()).padStart(2, '0') + ':' +
               String(d.getSeconds()).padStart(2, '0')
    annotations.push({
      type: 'line',
      start: [tt, 'min'], end: [tt, 'max'],
      style: { stroke: '#fe3246', lineWidth: 2, lineDash: [2, 2] },
      text: { content: '触发 ' + (props.triggerPhase || ''), position: 'start', style: { fill: '#fe3246', fontSize: 11 } }
    })
  }

  chart = new Line(chartRef.value, {
    data: chartData,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    color: ['#fe3246', '#4ecb73', '#2b8cff', '#fa8c16'],
    smooth: true,
    height: 280,
    padding: [30, 20, 40, 60],
    xAxis: { label: { autoRotate: true, style: { fontSize: 10 } } },
    yAxis: { title: { text: '电流(A)' }, min: 0 },
    legend: { position: 'top' },
    tooltip: { shared: true, showCrosshairs: true },
    annotations
  })
  chart.render()
}

onMounted(async () => {
  const data = await fetchData()
  render(data)
})

onUnmounted(() => { if (chart) chart.destroy() })
</script>

<style scoped lang="scss">
.alarm-chart {
  width: 100%;
  .chart { width: 100%; height: 280px; }
  .no-data-tip {
    height: 280px; display: flex; align-items: center; justify-content: center;
    color: #999; font-size: 14px;
  }
}
</style>
