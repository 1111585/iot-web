<template>
  <div class="iot-chart">
    <div class="chart-container" :data-title="title">
      <!-- 第一行：模式标签组（左） + 导出（右）；高度固定 -->
      <div class="chart-controls">
        <div class="mode-tabs">
          <button class="control-btn" :class="{ active: timeRange === 'realtime' }" @click="switchRange('realtime')">实时</button>
          <button class="control-btn" :class="{ active: timeRange === 'query' }" @click="switchRange('query')">查询</button>
        </div>
        <el-button class="export-btn" type="primary" plain icon="i-ep-download" size="small" @click="onExport">导出</el-button>
      </div>
      <!-- 第二行：查询条件（仅查询模式显示；实时模式整行留空，以保持高度不跳动） -->
      <div class="chart-toolbar">
        <template v-if="timeRange === 'query'">
          <el-button-group class="quick-group">
            <el-button
              v-for="item in quickRanges"
              :key="item.value"
              size="small"
              plain
              @click="onQuickRange(item.value)"
            >
              {{ item.label }}
            </el-button>
          </el-button-group>
          <div class="query-datetime">
            <el-date-picker
              v-model="queryRange"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm"
              format="YYYY-MM-DD HH:mm"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :default-time="queryDefaultTime"
              :disabled-date="disableFuture"
              unlink-panels
              size="small"
              style="width: 100%"
              @change="fetchQuery"
            />
          </div>
          <div class="field-group">
            <span class="field-label">采样间隔</span>
            <el-select v-model="queryInterval" size="small" style="width: 96px; flex: none" @change="fetchQuery">
              <el-option label="5分钟" value="5min" />
              <el-option label="1小时" value="1h" />
              <el-option label="1天" value="1d" />
            </el-select>
          </div>
          <div class="field-group">
            <span class="field-label">显示方式</span>
            <el-select v-model="valueType" size="small" style="width: 96px; flex: none" @change="redraw">
              <el-option label="平均值" value="avg" />
              <el-option label="最大值" value="max" />
            </el-select>
          </div>
        </template>
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
import { ElMessage } from 'element-plus'
import { Line } from '@antv/g2plot'
import { exportCtRecords, exportCtSamples, fetchCtRecords, fetchCtSamples } from '../utils'

interface Props {
  title?: string
  deviceId?: string
}
const props = withDefaults(defineProps<Props>(), { title: '三相电流趋势图', deviceId: '' })

type TimeRange = 'realtime' | 'query'
type QuickRange = 'today' | '3d' | '7d' | '30d'
/** 曲线取值：avg=区间平均值（默认），max=区间最大值 */
type ValueType = 'avg' | 'max'

const tempLineChart = ref<Line | null>(null)
const timeRange = ref<TimeRange>('realtime')
const isEmpty = ref(true)
const latest = ref({ A: '-', B: '-', C: '-', O: '-' })
let pollingTimer: ReturnType<typeof setInterval> | null = null

// 查询模式：任意时间段（精确到分）+ 间隔（5分钟 / 1小时 / 1天），默认 5 分钟档
const queryRange = ref<[string, string] | null>(null)
const queryInterval = ref<'5min' | '1h' | '1d'>('5min')

// 曲线取值方式：平均值 / 最大值（最大值=窗口内瞬时峰值；实时档本身就是原始采样，故禁用）
const valueType = ref<ValueType>('avg')

// 最近一次查询结果，用于切换 平均值/最大值 时直接重绘（不重复请求）
const lastRaw = ref<any[]>([])
const lastAxis = ref<{ mask: string; min: number; max: number } | null>(null)

// datetimerange 的默认时刻：开始 00:00、结束 23:59（即「当天全天」）
const queryDefaultTime: [Date, Date] = [
  new Date(2000, 0, 1, 0, 0, 0),
  new Date(2000, 0, 1, 23, 59, 0)
]

// 快捷时间范围
const quickRanges: { label: string; value: QuickRange }[] = [
  { label: '今天', value: 'today' },
  { label: '近3天', value: '3d' },
  { label: '近7天', value: '7d' },
  { label: '近30天', value: '30d' }
]

const MS_DAY = 86400000

const pad2 = (n: number) => String(Math.floor(n)).padStart(2, '0')
const disableFuture = (date: Date) => date > new Date()
const formatDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
const formatDateTime = (d: Date) => `${formatDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`

// 解析 'YYYY-MM-DD HH:mm' / 'YYYY-MM-DD'（无时区标记时按本地时间解析）
const parseDT = (s: string) => new Date(s.trim().replace(' ', 'T')).getTime()

// 档位时间跨度校验：5 分钟档最多 3 天，1 天档最多 366 天
const checkIntervalRange = (start: string, end: string): boolean => {
  const spanMs = parseDT(end) - parseDT(start)
  if (spanMs <= 0) {
    ElMessage.error('结束时间必须晚于开始时间')
    return false
  }
  if (queryInterval.value === '5min' && spanMs > 3 * MS_DAY) {
    ElMessage.error('选择 5 分钟间隔时，查询时间范围最多 3 天')
    return false
  }
  if (queryInterval.value === '1d' && spanMs > 366 * MS_DAY) {
    ElMessage.error('选择 1 天间隔时，查询时间范围最多 366 天')
    return false
  }
  return true
}

const noteText = computed(() => {
  if (timeRange.value === 'realtime') return '实时显示每次采样'
  const suffix = valueType.value === 'max' ? '最大值' : '平均值'
  if (queryInterval.value === '5min') return `每 5 分钟一条，取区间${suffix}`
  if (queryInterval.value === '1d') return `每天一条，取区间${suffix}`
  return `每小时一条，取区间${suffix}`
})

const RT_WINDOW_MS = 60_000 // 实时滚动窗口 60 秒

function formatTime(ts: any, range: TimeRange): string {
  let d: Date
  const ms = Number(ts)
  if (ms && ms > 0) { d = new Date(ms) } else { d = new Date(ts) }
  if (isNaN(d.getTime())) return ''
  const hh = pad2(d.getHours()), mm = pad2(d.getMinutes()), ss = pad2(d.getSeconds())
  const MM = pad2(d.getMonth() + 1), DD = pad2(d.getDate())
  if (range === 'realtime') return `${hh}:${mm}:${ss}`
  if (range === 'query') {
    if (queryInterval.value === '5min') return `${MM}-${DD} ${hh}:${mm}`
    if (queryInterval.value === '1d') return `${MM}-${DD}`
    return `${MM}-${DD} ${hh}:00`
  }
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

async function switchRange(range: TimeRange) {
  if (timeRange.value === range) return
  timeRange.value = range
  stopPolling()
  destroyChart()
  isEmpty.value = true
  if (range === 'realtime') {
    await fetchRealtime()
    startPolling()
  } else {
    // 默认查询「今天 00:00 ~ 今天 23:59」
    if (!queryRange.value) {
      const now = new Date()
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0)
      queryRange.value = [formatDateTime(dayStart), formatDateTime(dayEnd)]
    }
    await fetchQuery()
  }
}

// 按当前「平均值/最大值」把后端返回的原始行摊平成曲线数据
function toFlat(raw: any[], range: TimeRange): any[] {
  const useMax = valueType.value === 'max'
  const flat: any[] = []
  for (const item of raw || []) {
    const ms = Number(item.collectTime)
    const label = formatTime(item.collectTime, range)
    const a = (useMax ? item.maxCurrentA : item.currentA) ?? 0
    const b = (useMax ? item.maxCurrentB : item.currentB) ?? 0
    const c = (useMax ? item.maxCurrentC : item.currentC) ?? 0
    const o = (useMax ? item.maxCurrentO : item.currentO) ?? 0
    flat.push(
      { ts: ms, date: label, type: 'A相', value: a },
      { ts: ms, date: label, type: 'B相', value: b },
      { ts: ms, date: label, type: 'C相', value: c },
      { ts: ms, date: label, type: 'O相', value: o }
    )
  }
  return flat
}

// 缓存原始结果 + 坐标轴参数，然后绘制
function renderHistory(raw: any[], axis: { mask: string; min: number; max: number }) {
  lastRaw.value = raw || []
  lastAxis.value = axis
  renderHistoryChart(toFlat(lastRaw.value, 'query'), axis)
}

// 切换 平均值/最大值：用已缓存数据重绘，不重新请求接口
function redraw() {
  if (timeRange.value !== 'query' || !lastAxis.value) return
  renderHistoryChart(toFlat(lastRaw.value, 'query'), lastAxis.value)
}

async function fetchQuery() {
  if (!props.deviceId) return
  if (!queryRange.value || queryRange.value.length !== 2 || !queryRange.value[0] || !queryRange.value[1]) {
    ElMessage.warning('请选择查询时间段')
    return
  }
  const [start, end] = queryRange.value
  const startMs = parseDT(start)
  const endMs = parseDT(end)
  if (!checkIntervalRange(start, end)) return
  try {
    const result = await fetchCtRecords(props.deviceId, 0, 0, queryInterval.value, start, end)
    const mask = queryInterval.value === '5min' ? 'M-D HH:mm'
               : queryInterval.value === '1d' ? 'M-D'
               : 'M-D HH:00'
    renderHistory(result?.raw || [], { mask, min: startMs, max: endMs })
  } catch (e) { console.error('获取CT查询数据失败:', e) }
}

// 快捷时间段：写入时间范围后立即查询；5 分钟档超出 3 天时自动回落到 1 小时档
const onQuickRange = (value: QuickRange) => {
  const now = new Date()
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0)
  if (value !== 'today') {
    const days = value === '3d' ? 3 : value === '7d' ? 7 : 30
    start = new Date(start.getTime() - (days - 1) * MS_DAY)
  }
  queryRange.value = [formatDateTime(start), formatDateTime(end)]
  if (queryInterval.value === '5min' && parseDT(queryRange.value[1]) - parseDT(queryRange.value[0]) > 3 * MS_DAY) {
    queryInterval.value = '1h'
  }
  // 从「实时」点快捷时间时，自动切到「查询」模式
  if (timeRange.value !== 'query') {
    switchRange('query')
  } else {
    fetchQuery()
  }
}

const onExport = async () => {
  if (!props.deviceId) return
  // 实时档：导出内存里最近 60s 的高频原始采样
  if (timeRange.value === 'realtime') {
    try {
      await exportCtSamples(props.deviceId)
    } catch (e) { console.error('导出CT实时采样失败:', e) }
    return
  }
  if (!queryRange.value?.[0] || !queryRange.value?.[1]) {
    ElMessage.warning('请先选择查询时间段')
    return
  }
  if (!checkIntervalRange(queryRange.value[0], queryRange.value[1])) return
  try {
    await exportCtRecords({
      deviceId: props.deviceId,
      intervalType: queryInterval.value,
      startDate: queryRange.value[0],
      endDate: queryRange.value[1]
    })
  } catch (e) { console.error('导出CT数据失败:', e) }
}

function renderHistoryChart(data: any[], opts: { mask: string; min: number; max: number }) {
  destroyChart()
  isEmpty.value = data.length === 0
  if (data.length === 0) return
  const el = document.getElementById('tempTrendChart')
  if (!el) return
  tempLineChart.value = new Line(el, {
    data,
    xField: 'ts', yField: 'value', seriesField: 'type',
    smooth: true, yAxis: { min: 0 },
    legend: { position: 'bottom' },
    color: ['#E6A23C', '#67C23A', '#F56C6C', '#409EFF'],
    point: { size: 3 },
    xAxis: {
      type: 'time',
      mask: opts.mask,
      nice: false,
      min: opts.min,
      max: opts.max
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
.iot-chart { .chart-container {
  // 第一行：模式标签组（左） + 导出（右），高度固定
  .chart-controls { display: flex; align-items: center; margin-bottom: 8px; min-height: 28px;
    .mode-tabs { display: flex;
      .control-btn { padding: 4px 16px; border: 1px solid #dcdfe6; background: #fff; cursor: pointer;
        &:first-child { border-radius: 4px 0 0 4px; }
        &:last-child { border-radius: 0 4px 4px 0; }
        &.active { background: #409eff; color: #fff; border-color: #409eff; } } }
    .export-btn { margin-left: auto; flex: none; } }
  // 第二行：查询条件。仅查询模式显示，实时模式整行留空，高度不跳动
  .chart-toolbar { display: flex; align-items: center; gap: 8px;
    margin-bottom: 10px; min-height: 28px;
    .quick-group { flex: none; }
    .query-datetime { width: 320px; flex: none; }
    // 带名称的控件组：名称紧贴控件，避免被 flex gap 拉开
    .field-group { display: flex; align-items: center; gap: 6px; flex: none;
      .field-label { font-size: 12px; color: #606266; white-space: nowrap; } } }
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