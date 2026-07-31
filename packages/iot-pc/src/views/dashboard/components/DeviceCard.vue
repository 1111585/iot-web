<template>
  <div class="device-card">
    <!-- 上部分：标题区域 -->
    <div class="device-card__header">
      <div class="device-card__title">
        <div class="device-status-indicator" :class="device.online ? 'online' : 'offline'"></div>
        <span class="device-name">{{ device.name }}</span>
      </div>
    </div>

    <!-- 下部分：内容区域 -->
    <div class="device-card__content">
      <div class="device-card__menu-grid">
        <div class="menu-item" @click="onMenu('video')" title="实时视频">
          <div>
            <svg-icon icon-class="video_fill" />
          </div>
        </div>
        <div class="menu-item" @click="onMenu('event')" title="预警列表">
          <div>
            <svg-icon icon-class="list" />
          </div>
        </div>
        <div class="menu-item" @click="onMenu('trend')" title="趋势统计">
          <div>
            <svg-icon icon-class="line_chart" />
          </div>
        </div>
        <div class="menu-item" @click="onMenu('netInfo')" title="网络地址">
          <div>
            <svg-icon icon-class="service" />
          </div>
        </div>
      </div>

      <div class="device-card__temps">
        <div
          v-for="index in tempCounts"
          :key="index"
          class="temp-item"
          :class="{ placeholder: index > device.zones.length }"
        >
          <span
            v-if="index <= device.zones.length"
            class="temp-label"
            :title="device.zones[index - 1].name"
          >
            <span v-if="device.zones[index - 1].rank === 1">全局：</span>
            <span v-else> {{ device.zones[index - 1].name }}： </span>
          </span>
          <span v-else class="temp-label">--</span>
          <span
            v-if="index <= device.zones.length"
            class="temp-value"
            :style="{ color: device.zones[index - 1].color }"
          >
            {{ formatTemp(device.zones[index - 1].maxTemp) }}
          </span>
          <span v-else class="temp-value">--</span>
        </div>
      </div>

      <div v-if="device.warnCounts > 0" class="zone-badge">
        {{ device.warnCounts < 99 ? device.warnCounts : '99' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DevicesRender } from '../types'

const props = defineProps<{
  device: DevicesRender
  tempCounts: number
  formatTemp: (temp: number | undefined) => string
}>()

const emit = defineEmits<{
  (e: 'menu-click', type: 'video' | 'event' | 'trend' | 'netInfo', device: DevicesRender): void
}>()

const onMenu = (type: 'video' | 'event' | 'trend' | 'netInfo') => {
  emit('menu-click', type, props.device)
}
</script>

<style scoped lang="scss">
.device-card {
  --card-w: 260px;
  --card-h: 220px;
  --card-padding: 12px;
  --section-gap: 12px;
  --menu-icon: 20px;
  --menu-size: 32px;
  --text-sm: 13px;
  --text-md: 14px;

  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--card-w);
  height: var(--card-h);
  padding: var(--card-padding);
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #e8f4f8 0%, #f0f9fc 100%);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--section-gap);
    padding: 6px 0 14px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  &__content {
    display: flex;
    gap: 10px;
    flex: 1;
    transition: all 0.3s ease;
  }

  &__menu-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    align-items: center;
    justify-items: center;
  }

  &__temps {
    flex: 1;
    width: 52%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
}

.device-status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;

  &.online {
    background-color: #67c23a;
    box-shadow: 0 0 6px rgba(103, 194, 58, 0.6);
  }

  &.offline {
    background-color: #f56c6c;
    box-shadow: 0 0 6px rgba(245, 108, 108, 0.6);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: clamp(52px, 9vw, 58px);
  gap: 2px;
  padding: clamp(4px, 1vw, 6px);
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  background: rgba(64, 158, 255, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: var(--text-sm);
  color: #333;

  &:hover {
    background: rgba(64, 158, 255, 0.15);
    transform: translateX(4px);
  }

  > div {
    width: var(--menu-size);
    height: var(--menu-size);
    border-radius: 50%;
    background: rgba(64, 158, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  &:hover > div {
    background: rgba(64, 158, 255, 0.2);
  }

  svg {
    width: var(--menu-icon);
    height: var(--menu-icon);
    flex-shrink: 0;
    color: #409eff;
  }
}

.device-name {
  font-size: var(--text-md);
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.temp-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(7px, 1.2vw, 9px) clamp(6px, 1vw, 7px);
  border: 1px solid #d4e6f1;
  border-radius: 4px;
  font-size: clamp(13px, 1.5vw, 14px);

  &.placeholder {
    background-color: #f5f7fa;
    border-color: #e8eef5;
  }
}

.temp-label {
  color: #666;
  font-weight: 500;
  min-width: 16px;
  max-width: 48px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .placeholder & {
    color: #bbb;
  }
}

.temp-value {
  color: #409eff;
  font-weight: 600;

  .placeholder & {
    color: #ccc;
  }
}

.zone-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f56c6c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(245, 108, 108, 0.4);
}
</style>
