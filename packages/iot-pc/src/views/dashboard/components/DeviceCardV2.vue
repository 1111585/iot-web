<template>
  <div class="device-card-v2" :class="{ 'is-offline': !device.online }">
    <!-- 顶部：状态点与名称 -->
    <div class="card-header">
      <div class="status-dot" :class="device.online ? 'online' : 'offline'"></div>
      <span class="device-name" :title="device.name">{{ device.name }}</span>
      <!-- 右上角角标 -->
      <div v-if="device.warnCounts > 0" class="warn-badge">
        {{ device.warnCounts > 99 ? '99+' : device.warnCounts }}
      </div>
    </div>

    <div class="card-body">
      <!-- 左侧：功能按钮 -->
      <div class="side-menu">
        <div v-if="!device.isLegacy" class="menu-btn" @click="onMenu('video')" title="实时视频">
          <svg-icon icon-class="video_fill" size="18px" />
        </div>
        <div class="menu-btn" @click="onMenu('event')" title="预警列表">
          <svg-icon icon-class="list" size="18px" />
        </div>
        <div class="menu-btn" @click="onMenu('temp')" title="温度曲线">
          <svg-icon icon-class="line_chart" size="18px" />
        </div>
        <div class="menu-btn" @click="onMenu('netInfo')" title="设备信息">
          <svg-icon icon-class="info2" size="18px" />
        </div>
      </div>

      <!-- 右侧：传感器数据展示 -->
      <div class="sensor-content">
        <!-- 电弧闪络提示 -->
        <div
          v-if="!device.isLegacy"
          class="arc-flash-row"
          :title="device.hasArcFlash ? '存在电弧闪络' : '无电弧闪络'"
        >
          <span class="label">闪络</span>
          <div class="arc-flash-indicator">
            <div class="line"></div>
            <svg-icon
              icon-class="flash"
              class="flash-icon"
              :class="{ active: device.hasArcFlash, inactive: !device.hasArcFlash }"
            />
          </div>
        </div>

        <!-- 温度/湿度进度条列表 -->
        <div class="progress-list">
          <div
            v-for="(zone, index) in displayZones"
            :key="zone.id || index"
            class="progress-row"
            :title="`区域${zone.name}, 阈值1: ${getThresholds(zone).one}, 阈值2: ${getThresholds(zone).two}`"
          >
            <span class="row-label" :title="zone.name">{{ zone.name }}</span>
            <div class="progress-container">
              <div class="progress-bar" :style="getProgressStyle(zone)"></div>
              <!-- 阈值刻度线 -->
              <div
                class="threshold-mark level-1"
                :style="{ left: getThresholdPos(getThresholds(zone).one) }"
              ></div>
              <div
                class="threshold-mark level-2"
                :style="{ left: getThresholdPos(getThresholds(zone).two) }"
              ></div>
            </div>
            <span class="row-value" :style="{ color: zone.color }">
              {{ formatTemp(zone.maxTemp) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DevicesRender } from '../types'

interface DeviceV2 extends DevicesRender {
  hasArcFlash?: boolean // 是否有闪络状态
  isLegacy?: boolean // 是否是传统设备（无摄像头、闪络）
}

const props = defineProps<{
  device: DeviceV2
  tempCounts: number
  formatTemp: (temp: number | undefined) => string
}>()

const emit = defineEmits<{
  (
    e: 'menu-click',
    type: 'video' | 'event' | 'trend' | 'netInfo' | 'temp',
    device: DevicesRender
  ): void
}>()

const displayZones = computed(() => {
  return props.device.zones.slice(0, props.tempCounts)
})

const MAX_TEMP = 150

const getThresholds = (zone: DeviceV2['zones'][number]) => ({
  one: zone.oneTemp ?? 40,
  two: zone.twoTemp ?? 70
})

const getProgressStyle = (zone: DeviceV2['zones'][number]) => {
  const { one, two } = getThresholds(zone)
  const temp = zone.maxTemp
  const percentage = Math.min((temp / MAX_TEMP) * 100, 100)
  let bgColor = '#67c23a' // 默认绿色

  if (temp >= two) {
    bgColor = '#fe3246' // 二级报警红色
  } else if (temp >= one) {
    bgColor = '#ff9900' // 一级报警橙色
  }

  return {
    width: `${percentage}%`,
    backgroundColor: bgColor
  }
}

const getThresholdPos = (threshold: number) => {
  return `${(threshold / MAX_TEMP) * 100}%`
}

const onMenu = (type: 'video' | 'event' | 'trend' | 'netInfo' | 'temp') => {
  emit('menu-click', type, props.device)
}
</script>

<style scoped lang="scss">
.device-card-v2 {
  --card-w: 260px;
  --card-h: 225px;
  --card-padding: 12px;
  --section-gap: 12px;
  --menu-icon: 20px;
  --menu-size: 32px;
  --text-sm: 13px;
  --text-md: 14px;

  position: relative;
  width: var(--card-w);
  height: var(--card-h);
  background: #f0f7f9;
  border-radius: 8px;
  padding: var(--card-padding);
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  // border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: visible;
  box-sizing: border-box;

  // &.is-offline {
  //   opacity: 0.7;
  //   filter: grayscale(0.5);
  // }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: var(--section-gap);
  border-bottom: 1px solid #e1e8eb;
  margin-bottom: var(--section-gap);

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    &.online {
      background: #67c23a;
      box-shadow: 0 0 4px #67c23a;
    }
    &.offline {
      background: #f56c6c;
      box-shadow: 0 0 4px #f56c6c;
    }
  }

  .device-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .warn-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    background: #ff5722;
    color: #fff;
    min-width: 22px;
    height: 22px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    padding: 0 6px;
    box-shadow: 0 2px 4px rgba(255, 87, 34, 0.3);
    z-index: 10;
  }
}

.card-body {
  display: flex;
  flex: 1;
  gap: clamp(10px, 1.4vw, 12px);
}

.side-menu {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.4vw, 12px);
  padding-right: clamp(10px, 1.4vw, 12px);
  border-right: 1px solid #e1e8eb;

  .menu-btn {
    width: var(--menu-size);
    height: var(--menu-size);
    border-radius: 6px;
    background: #e1f0ff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #40a0ff8f;
      // .svg-icon {
      //   color: #fff !important;
      // }
    }

    .svg-icon {
      font-size: var(--menu-icon);
      color: #409eff;
    }
  }
}

.sensor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1.2vw, 8px);
}

.arc-flash-row {
  display: flex;
  align-items: center;
  gap: clamp(6px, 1.2vw, 10px);
  margin-bottom: clamp(8px, 1.4vw, 12px);

  &:hover {
    cursor: help;
  }

  .label {
    font-size: 14px;
    color: #666;
  }

  .arc-flash-indicator {
    flex: 1;
    display: flex;
    align-items: center;
    gap: clamp(6px, 1.2vw, 8px);

    .line {
      flex: 0.85;
      height: 1px;
      background: #ccc;
    }

    .flash-icon {
      font-size: 20px;
      color: #e0e0e0;
      &.active {
        color: #ff9900;
        filter: drop-shadow(0 0 3px #ff9900);
        animation: blink 1s infinite;
      }
      &.inactive {
        color: #bfbfbf;
      }
    }
  }
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 2vw, 16px);
}

.progress-row {
  display: flex;
  align-items: center;
  gap: clamp(6px, 1.6vw, 8px);

  &:hover {
    cursor: help;
  }

  .row-label {
    width: 28px;
    font-size: 14px;
    color: #666;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .progress-container {
    flex: 1;
    height: 18px;
    background: #e4e7ed;
    border-radius: 4px;
    position: relative;
    overflow: hidden;

    .progress-bar {
      height: 100%;
      border-radius: 4px;
      transition:
        width 0.4s ease,
        background-color 0.3s;
    }

    .threshold-mark {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: rgba(0, 0, 0, 0.2);
      z-index: 2;

      &::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -1px;
        width: 3px;
        height: 3px;
        border-radius: 50%;
      }

      &.level-1 {
        background: #ff9900;
      }
      &.level-2 {
        background: #fe3246;
      }
    }
  }

  .row-value {
    width: 35px;
    font-size: 13px;
    font-weight: 600;
    text-align: left;
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
