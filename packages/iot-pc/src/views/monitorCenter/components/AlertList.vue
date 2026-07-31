<template>
  <ul class="list">
    <li class="list-item" v-for="item in list" :key="item.title">
      <!-- 上部分 -->
      <div class="flex-box">
        <div class="list-item__left link" @click="onTitleClick(item)">{{ item.title }}</div>
        <div class="list-item__right">
          <span class="list-item__device">{{ item.device }}</span>
          <span class="list-item__time">{{ formatDate(item.time, 'yyyy年MM月dd日 hh:mm') }}</span>
        </div>
      </div>
      <!-- 下部分 -->
      <div class="flex-box">
        <div class="list-item__left list-item__desc">{{ item.descrition }}</div>
        <div class="list-item__right" :class="item.status == 0 ? 'success' : 'danger'">
          {{ Status[item.status] }}
        </div>
      </div>
    </li>
  </ul>
  <EventDetailDialog v-model:visible="isShow.eventDialog" :data="eventData" :key="forceKey" />
</template>

<script setup lang="ts">
import EventDetailDialog from '@/views/eventCenter/components/EventDetailDialog.vue';
import { formatDate } from '@/util'
import type { AlertItem } from '../types'

interface Props {
  list: AlertItem[]
}

const props = defineProps<Props>()

enum Status {
  '已处理' = 0,
  '告警中' = 1
}

const forceKey = ref(0)

const isShow = reactive({
  eventDialog: false
})

const eventData = ref()

function onTitleClick(item: AlertItem) {
  console.log('[告警记录]', item)
  isShow.eventDialog = true

  eventData.value = {
    ...item,
    id: item.warningInformationId,
    senseDevice: item.equipmentName,
    senseDeviceId: item.equipmentId,
    typeRaw: item.levelType
  }

  forceKey.value++
}
</script>

<style lang="scss" scoped>
.list {
  list-style: none;

  &-item {
    font-size: 14px;
    padding: 14px;
    border-bottom: 1px solid #e5e5e5;
    &:hover {
      background-color: #f5f5f5;
    }
    &__left {
      flex: 2;
      margin-bottom: 10px;
    }
    &__right {
      flex: 1;
      display: flex;
      justify-content: flex-end;
    }
    &__device {
      width: max-content;
    }
    &__time {
      display: inline-block;
      min-width: 150px;
      margin-left: 14px;
      color: var(--el-text-color-secondary);
    }
    &__desc {
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
