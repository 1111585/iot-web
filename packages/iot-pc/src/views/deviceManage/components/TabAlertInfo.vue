<template>
  <div class="tab-alert">
    <AlertList
      v-if="alertList && alertList.length !== 0"
      :list="alertList"
      @refresh="onRefresh"
    />
    <empty v-else />
  </div>
</template>

<script setup lang="ts">
import AlertList from '@/views/monitorCenter/components/AlertList.vue'
import { normalizeAlerts } from '@/views/monitorCenter/utils/alerts'
import { shareDeviceDetail } from '../utils/store'
import { refreshDeviceDetail } from '../utils/fetch'

const alertList = computed(() => {
  if (!shareDeviceDetail.value?.disposeInfoList) return []
  return normalizeAlerts(shareDeviceDetail.value.disposeInfoList)
})

function onRefresh() {
  refreshDeviceDetail()
}
</script>

<style lang="scss" scoped>
.list {
  list-style: none;

  &-item {
    font-size: 14px;
    padding: 14px 0;
    border-bottom: 1px solid #e5e5e5;
    &__left {
      flex: 2;
      margin-bottom: 10px;
    }
    &__right {
      flex: 1;
      text-align: right;
    }
    &__time {
      margin-left: 14px;
      color: var(--el-text-color-secondary);
    }
    &__desc {
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
