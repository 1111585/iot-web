<template>
  <div class="iot-chart">
    <div class="chart-container" :data-title="title">
      <div class="chart-controls">
        <button class="control-btn" :class="{ active: timeRange === 'realtime' }" @click="switchRange('realtime')">实时</button>
        <button class="control-btn" :class="{ active: timeRange === 'day' }" @click="switchRange('day')">过去一天</button>
        <button class="control-btn" :class="{ active: timeRange === 'week' }" @click="switchRange('week')">过去一周</button>
      </div>
      <div id="tempTrendChart" class="chart">
        <div v-if="!isEmpty && timeRange === 'realtime'" class="anchor-values">
          <span style="color:#E6A23C">A {{ latest.A }}</span>
          <span style="color:#67C23A">B {{ latest.B }}</span>
          <span style="color:#F56C6C">C {{ latest.C }}</span>
          <span style="color:#409EFF">O {{ latest.O }}</span>
        </div>
        <div v-if="!isEmpty" class="chart-note">{{ noteText }}</div>
      </div>
      <div v-if="isEmpty" class="no-data-tip">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Line } from '@antv/g2plot'
import { fetchCtRecords, fetchCtSamples } from '../utils'

interface Props {
  title?: string
  deviceId?: string
}
const props = withDefaults(defineProps<Props>(), { title: '三相电流趋势图', deviceId: '' })

const tempLineChart = ref<Line | null>(null)
const timeRange = ref<'realtime' | 'day' | 'week'>('realtime')
const isEmpty = ref(true)
const latest = ref({ A: '-', B: '-', C: '-', O: '-' })
let pollingTimer: ReturnType<typeof setInterval> | null = null

const noteText = computed(() => {
  if (timeRange.value === 'realtime') return '实时显示每次采样'
  if (timeRange.value === 'day') return '每 10 分钟一条，取区间平均值'
  return '每小时一条，取区间平均值'
})

const RT_WINDOW_MS = 60_000 // 实时滚动窗口 60 秒

function formatTime(ts: any, range: 'realtime' | 'day' | 'week'): string {
  let d: Date
  const ms = Number(ts)
  if (ms && ms > 0) { d = new Date(ms) } else { d = new Date(ts) }
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(Math.floor(n)).padStart(2, '0')
  const hh = pad(d.getHours()), mm = pad(d.getMinutes()), ss = pad(d.getSeconds())
  const MM = pad(d.getMonth() + 1), DD = pad(d.getDate())
  if (range === 'realtime') return `${hh}:${mm}:${ss}`
  if (range === 'day') return `${hh}:${mm}`
  return `${MM}-${DD} ${hh}:00`
}

function stopPolling() {
  if (pollingTimer != null) { clearInterval(pollingTimer); pollingTimer = null }
}

function destroyChart() {
  if (tempLineChart.value) { tempLineChart.value.destroy(); tempLineChart.value = null }
}

// ---------- 实时模式（changeData，不销毁重建） ----------

function buildRealtimeData(raw: any[]): any[] {
  const now = Date.now()
  const cutoff = now - RT_WINDOW_MS
  const result: any[] = []
  let lastA = 0, lastB = 0, lastC = 0, lastO = 0, lastTs = 0
  for (const item of raw) {
    const ms = Number(item.timestamp)
    if (!ms || ms < cutoff) continue
    if (ms >= lastTs) { lastA = item.currentA ?? 0; lastB = item.currentB ?? 0; lastC = item.currentC ?? 0; lastO = item.currentO ?? 0; lastTs = ms }
    const label = formatTime(item.timestamp, 'realtime')
    result.push(
      { ts: ms, date: label, type: 'A相', value: item.currentA ?? 0 },
      { ts: ms, date: label, type: 'B相', value: item.currentB ?? 0 },
      { ts: ms, date: label, type: 'C相', value: item.currentC ?? 0 },
      { ts: ms, date: label, type: 'O相', value: item.currentO ?? 0 }
    )
  }
  latest.value = { A: lastA.toFixed(3) + 'A', B: lastB.toFixed(3) + 'A', C: lastC.toFixed(3) + 'A', O: lastO.toFixed(3) + 'A' }
  return result
}

function anchorLine(now: number) {
  return { type: 'line' as any, start: [now, 'min'] as any, end: [now, 'max'] as any, style: { stroke: '#333', lineWidth: 1 } }
}

function initRealtimeChart(data: any[]) {
  destroyChart()
  isEmpty.value = data.length === 0
  if (data.length === 0) return
  const el = document.getElementById('tempTrendChart')
  if (!el) return
  const now = Date.now()
  tempLineChart.value = new Line(el, {
    data,
    xField: 'ts', yField: 'value', seriesField: 'type',
    smooth: true, yAxis: { min: 0 },
    legend: { position: 'bottom' },
    color: ['#E6A23C', '#67C23A', '#F56C6C', '#409EFF'],
    point: { size: 0 },
    animation: false,
    xAxis: { type: 'time', mask: 'HH:mm:ss', nice: false, min: now - RT_WINDOW_MS, max: now },
    annotations: [anchorLine(now)]
  })
  tempLineChart.value.render()
}

function updateRealtimeChart(raw: any[]) {
  const data = buildRealtimeData(raw)
  isEmpty.value = data.length === 0
  if (!tempLineChart.value) { initRealtimeChart(data); return }
  if (data.length === 0) return
  const now = Date.now()
  tempLineChart.value.changeData(data)
  tempLineChart.value.update({
    xAxis: { nice: false, min: now - RT_WINDOW_MS, max: now },
    annotations: [anchorLine(now)]
  })
}

async function fetchRealtime() {
  if (!props.deviceId) return
  try {
    const result = await fetchCtSamples(props.deviceId)
    const raw = result?.raw || []
    if (!tempLineChart.value) {
      initRealtimeChart(buildRealtimeData(raw))
    } else {
      updateRealtimeChart(raw)
    }
  } catch (e) { console.error('获取CT实时采样数据失败:', e) }
}

function startPolling() {
  stopPolling()
  pollingTimer = setInterval(() => { fetchRealtime() }, 2000)
}

// ---------- 历史模式（一次性加载） ----------

async function switchRange(range: 'realtime' | 'day' | 'week') {
  timeRange.value = range
  stopPolling()
  destroyChart()
  isEmpty.value = true
  if (range === 'realtime') {
    await fetchRealtime()
    startPolling()
  } else {
    await fetchHistory(range)
  }
}

async function fetchHistory(range: 'day' | 'week') {
  if (!props.deviceId) return
  try {
    const days = range === 'week' ? 7 : 1
    const maxPoints = range === 'day' ? 144 : 0
    const result = await fetchCtRecords(props.deviceId, days, maxPoints)
    const flat: any[] = []
    if (result?.raw) {
      for (const item of result.raw) {
        const ms = Number(item.collectTime)
        const label = formatTime(item.collectTime, range)
        flat.push(
          { ts: ms, date: label, type: 'A相', value: item.currentA ?? 0 },
          { ts: ms, date: label, type: 'B相', value: item.currentB ?? 0 },
          { ts: ms, date: label, type: 'C相', value: item.currentC ?? 0 },
          { ts: ms, date: label, type: 'O相', value: item.currentO ?? 0 }
        )
      }
    }
    renderHistoryChart(flat, range)
  } catch (e) { console.error('获取CT历史趋势数据失败:', e) }
}

function renderHistoryChart(data: any[], range: 'day' | 'week') {
  destroyChart()
  isEmpty.value = data.length === 0
  if (data.length === 0) return
  const el = document.getElementById('tempTrendChart')
  if (!el) return
  const now = Date.now()
  const spanMs = range === 'week' ? 7 * 24 * 3600 * 1000 : 24 * 3600 * 1000
  tempLineChart.value = new Line(el, {
    data,
    xField: 'ts', yField: 'value', seriesField: 'type',
    smooth: true, yAxis: { min: 0 },
    legend: { position: 'bottom' },
    color: ['#E6A23C', '#67C23A', '#F56C6C', '#409EFF'],
    point: { size: 3 },
    xAxis: {
      type: 'time',
      mask: range === 'week' ? 'M-D HH:00' : 'M-D HH:mm',
      nice: false,
      min: now - spanMs,
      max: now
    }
  })
  tempLineChart.value.render()
}

onMounted(async () => {
  await fetchRealtime()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
  destroyChart()
})
</script>

<style lang="scss" scoped>
.iot-chart { .chart-container { .chart-controls { text-align: right; margin-bottom: 10px;
  .control-btn { padding: 4px 16px; border: 1px solid #dcdfe6; background: #fff; cursor: pointer;
    &:first-child { border-radius: 4px 0 0 4px; }
    &:last-child { border-radius: 0 4px 4px 0; }
    &.active { background: #409eff; color: #fff; border-color: #409eff; } } }
  .chart { width: 100%; height: 400px; position: relative; }
  .anchor-values { position: absolute; right: 8px; top: 8px; z-index: 10;
    display: flex; flex-direction: column; gap: 2px;
    border: 1px solid #333; border-radius: 4px; padding: 4px 8px;
    background: rgba(255, 255, 255, 0.75); 
    font-size: 12px; font-family: monospace; line-height: 1.4;
    pointer-events: none; }
  .chart-note { position: absolute; right: 8px; bottom: 6px; z-index: 10;
    font-size: 12px; color: #999; pointer-events: none; }
  .no-data-tip { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #999; } } }
</style>