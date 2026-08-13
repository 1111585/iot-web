<template>
  <div class="ct-card" :class="{ 'is-offline': device.onlineState !== 1 }">
    <div class="card-header">
      <div class="status-dot" :class="device.onlineState === 1 ? 'online' : 'offline'"></div>
      <span class="device-name" :title="device.deviceName">{{ device.deviceName }}</span>
      <div v-if="device.warnCounts > 0" class="warn-badge">
        {{ device.warnCounts > 99 ? '99+' : device.warnCounts }}
      </div>
    </div>
    <div class="card-body">
      <div class="side-menu">
        <div class="menu-btn" @click="$emit('chart', device)" title="趋势图">
          <svg-icon icon-class="line_chart" size="18px" />
        </div>
        <div class="menu-btn" @click="$emit('config', device)" title="设置">
          <svg-icon icon-class="info2" size="18px" />
        </div>
      </div>
      <div class="sensor-content">
        <div class="progress-list">
          <div
            v-for="p in phases" :key="p.label" class="progress-row"
            :title="p.label + ': ' + p.value.toFixed(3) + 'A' + (p.threshold ? ', 阈值: ' + p.threshold + 'A' : '')"
          >
            <span class="row-label">{{ p.label }}</span>
            <div class="progress-container">
              <div class="progress-bar" :style="p.barStyle"></div>
              <div v-if="p.threshold && p.range > 0" class="threshold-mark"
                :style="{ left: (p.threshold / p.range * 100) + '%' }"></div>
            </div>
            <span class="row-value" :style="{ color: p.overThreshold ? '#F56C6C' : '#67c23a' }">
              {{ p.value.toFixed(3) }}A
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="card-footer">
      <span class="footer-ip">{{ device.ip }}</span>
      <span class="footer-time">{{ timeDisplay }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CtDeviceRes } from '../types'

const props = defineProps<{
  device: CtDeviceRes
}>()

defineEmits<{
  (e: 'chart', device: CtDeviceRes): void
  (e: 'config', device: CtDeviceRes): void
}>()

const phases = computed(() => {
  const range = props.device.currentRange || 100
  const pc = ['#E6A23C', '#67C23A', '#F56C6C', '#409EFF']
  return [
    { label: 'A相', color: pc[0], value: props.device.currentA || 0, threshold: props.device.alarmAMax, range },
    { label: 'B相', color: pc[1], value: props.device.currentB || 0, threshold: props.device.alarmBMax, range },
    { label: 'C相', color: pc[2], value: props.device.currentC || 0, threshold: props.device.alarmCMax, range },
    { label: 'O相', color: pc[3], value: props.device.currentO || 0, threshold: props.device.alarmOMax, range }
  ].map(p => {
    const overThreshold = p.threshold != null && p.threshold > 0 && p.value > p.threshold
    const percent = Math.min((p.value / p.range) * 100, 100)
    const bgColor = overThreshold ? '#F56C6C' : '#67C23A'
    return { ...p, percent, overThreshold, barStyle: { width: percent + '%', backgroundColor: bgColor } }
  })
})

const timeDisplay = computed(() => {
  const t = props.device.lastCollectTime
  if (!t) return '暂无数据'
  const d = new Date(t)
  const mm = (d.getMonth() + 1).toString().padStart(2, '0')
  const dd = d.getDate().toString().padStart(2, '0')
  const hh = d.getHours().toString().padStart(2, '0')
  const mi = d.getMinutes().toString().padStart(2, '0')
  const fps = props.device.currentFps != null ? props.device.currentFps.toFixed(1) : '0.0'
  return `${mm}-${dd} ${hh}:${mi} | FPS ${fps}`
})
</script>

<style scoped lang="scss">
.ct-card {
  --card-w: 260px;
  --card-h: 185px;
  --card-padding: 12px;
  --section-gap: 12px;
  --menu-size: 32px;

  position: relative;
  width: var(--card-w);
  min-height: var(--card-h); height: auto;
  background: #f0f7f9;
  border-radius: 8px;
  padding: var(--card-padding);
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  overflow: visible;
  box-sizing: border-box;

  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  &.is-offline { opacity: 0.7; }
}

.card-header {
  display: flex; align-items: center; gap: 8px;
  padding-bottom: var(--section-gap);
  border-bottom: 1px solid #cdd9e2;
  margin-bottom: 8px;

  .status-dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    &.online { background: #67c23a; box-shadow: 0 0 4px #67c23a; }
    &.offline { background: #f56c6c; box-shadow: 0 0 4px #f56c6c; }
  }

  .device-name {
    font-size: 14px; font-weight: 600; color: #333; flex: 1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .warn-badge {
    position: absolute; top: -10px; right: -10px;
    background: #ff5722; color: #fff;
    min-width: 22px; height: 22px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; padding: 0 6px;
    box-shadow: 0 2px 4px rgba(255,87,34,0.3);
    z-index: 10;
  }
}

.card-body {
  display: flex; flex: 1; gap: 12px;
}

.side-menu {
  display: flex; flex-direction: column; gap: 12px;
  padding-right: 12px; border-right: 1px solid #cdd9e2;

  .menu-btn {
    width: var(--menu-size); height: var(--menu-size); border-radius: 6px;
    background: #d5e5f0;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s;
    &:hover { background: #c5dae8; transform: scale(1.05); }
  }
}

.sensor-content { flex: 1; min-width: 0; }
.progress-list { display: flex; flex-direction: column; gap: 10px; }
.progress-row { display: flex; align-items: center; gap: 8px; }
.row-label { font-size: 13px; width: 28px; flex-shrink: 0; color: #666; }
.progress-container { flex: 1; height: 14px; background: rgba(0,0,0,0.06); border-radius: 7px; position: relative; overflow: visible; }
.progress-bar { height: 100%; border-radius: 7px; transition: width 0.3s, background-color 0.3s; }
.threshold-mark { position: absolute; top: -2px; width: 2px; height: 18px; background: #e6a23c; z-index: 1; border-radius: 1px; }
.row-value { font-size: 13px; width: 50px; text-align: right; flex-shrink: 0; font-weight: 500; }

.card-footer { border-top: 1px solid #cdd9e2; padding-top: 8px; margin-top: auto; display: flex; justify-content: space-between; }
.footer-ip { font-size: 11px; color: #8a9aa8; }
.footer-time { font-size: 11px; color: #8a9aa8; }
</style>