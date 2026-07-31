<template>
  <el-card class="card" shadow="hover" @click="$emit('click', data)">
    <div class="card-main">
      <div class="card-main-left">
        <div class="card-field">
          <span>事件类型：</span>
          <span>{{ data.type }}</span>
          <el-tag class="ml10" type="success" v-if="data.handleStatus == 1">新</el-tag>
        </div>
        <div class="card-field">
          <span>监测设备：</span>
          <span>{{ data.detectDevice || '-' }}</span>
          <span></span>
        </div>
        <div class="card-field">
          <span>感知设备：</span>
          <span>{{ data.senseDevice || '-' }}</span>
          <span></span>
        </div>
        <div class="card-field">
          <span>预警时间：</span>
          <span>{{ data.date || '-' }}</span>
          <span v-if="data.dateContinute" class="date-continute">{{ data.dateContinute }}</span>
        </div>
        <div class="card-field">
          <span>所属点位：</span>
          <span>{{ data.areaPoint || '-' }}</span>
          <span></span>
        </div>
      </div>
      <div class="card-main-right">
        <div class="card-tag" :style="{ color: statusColor[data.disposeType] }">
          <!-- v-if="data.handleStatus != 1" -->
          {{ EventStatus[data.disposeType] }}
        </div>
        <el-image class="card-img" loading="lazy" :src="data.image" fit="cover" />
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
// import { EventStatus } from '@/enums'
import { EventStatus } from '../utils/consts'
import type { EventData } from '../types'
interface Props {
  data: EventData
}
interface Emits {
  (e: 'click', data: EventData): void
}

defineProps<Props>()
defineEmits<Emits>()

// 对应 EventStatus
const statusColor = {
  1: '#ff4d4f',
  2: '#20c57e',
  3: '#f9b43b',
  4: '#ff4d4f'
}
</script>

<style lang="scss" scoped>
.card {
  position: relative;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow:
    2px 2px 4px rgba(156, 156, 156, 0.1),
    -2px -2px 4px rgba(156, 156, 156, 0.1);
  cursor: pointer;
}

.card-main {
  display: flex;
  align-items: center;
  &-left {
    flex: 2;
  }
  &-right {
    flex: 1;
  }
}

.card-field {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: rgb(90, 90, 90);
  & > span:nth-child(1) {
    min-width: 70px;
  }
  & > span:nth-child(2) {
    max-width: 170px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.card-img {
  width: 30%;
  height: auto;
  aspect-ratio: 6 / 7;
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
}
.card-tag {
  position: absolute;
  right: 14px;
  top: 14px;
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  background-color: #fff;
  z-index: 99;
}

.date-continute {
  margin-left: 10px;
  color: var(--el-color-warning);
}
</style>
