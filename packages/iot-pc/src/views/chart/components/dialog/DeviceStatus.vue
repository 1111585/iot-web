<template>
  <el-dialog destroy-on-close draggable>
    <el-container>
      <el-header>
        <div class="header-left">
          <div v-for="item in badges" :key="item.name" :class="item.isactive ? 'active' : ''">
            <el-badge :content="item.badge">
              <span>{{ item.name }}</span>
              <span>{{ item.count }}</span>
            </el-badge>
          </div>
        </div>
        <div class="header-right">
          <el-input v-model.trim="listQuery.deviceName" placeholder="请输入关键词" />
          <el-button icon="i-ep-search" @click="onSearch">搜索</el-button>
        </div>
      </el-header>
      <el-main>
        <DataTable :columns="columns" :data="list" />
      </el-main>
      <el-footer></el-footer>
    </el-container>
  </el-dialog>
</template>

<script setup lang="ts">
import DataTable from '@/components/renderer/DataTable.vue'
import { deviceStatusColumn as columns, onError } from '@/views/chart/utils'
import { request } from '@/util/request'
import { chartApi } from '@/apis/chart'

import type { DialogProps } from 'element-plus'
import type { DeviceStatusRes } from '@/views/chart/types'

interface Props extends /* @vue-ignore */ Partial<DialogProps> {}
interface List extends ARC.ExtractProps<typeof columns> {
  [key: string]: any
}

const props = defineProps<Props>()

const is = reactive({
  loading: false
})
const listQuery = reactive({
  pageNum: 1,
  pageSize: 20,
  type: 3,   // 统计设备类型 （1.接入设备 2.运行正常 3.设备告警 4.设备离线 5.设备异常）
  startTime: '',
  endTime: '',
  deviceName: '',
  deviceType: '',
  warningType: '',
  disposeType: '',
})
const list = ref<DeviceStatusRes[]>([])

async function fetchList() {
  is.loading = true
  try {
    const { data } = await request.get<any, ARC.RecordsRes<DeviceStatusRes>>(chartApi.iot.getDeviceStatus, listQuery)
    if (data.records) {
      list.value = data.records
    }

  } catch (error) {
    onError(error)
  } finally {
    is.loading = false
  }
}


function onSearch() {}

const badges = ref([
  { name: '接入设备', count: 2, badge: 1, isactive: true },
  { name: '运行正常', count: 3, badge: 2, isactive: false },
  { name: '设备告警', count: 4, badge: 3, isactive: false },
  { name: '设备离线', count: 5, badge: 4, isactive: false },
  { name: '设备异常', count: 6, badge: 5, isactive: false }
])

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.header {
  &-left {
    display: flex;
    align-items: center;
  }
  &-right {
    margin-left: auto;
  }
}
</style>
