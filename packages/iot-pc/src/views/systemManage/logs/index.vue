<template>
  <BaseContainer title="系统日志" class="logs">
    <TableHeadBar
      v-model:keyword="paylaod.keyword"
      :total="columnDataTotal"
      placeholder="请输入操作行为"
    >
      <template #right>
        <el-select v-model="paylaod.keyword" placeholder="事件分类" style="width: 120px">
          <el-option
            v-for="item in logActionOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <div class="custom-style">
          <el-segmented v-model="paylaod.sort" :options="logSortOptions" />
        </div>
        <el-date-picker
          v-model="paylaod.time"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width: 240px"
          @clear="paylaod.time = []"
        />
        <el-select v-model="paylaod.zt" placeholder="状态" clearable style="width: 100px">
          <el-option
            v-for="item in logStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <el-tag :type="item.value === LogStatus['成功'] ? 'success' : 'danger'">
              {{ item.label }}
            </el-tag>
          </el-option>
        </el-select>
        <el-select
          v-model="paylaod.eventType"
          placeholder="事件类型"
          clearable
          style="width: 160px"
        >
          <el-option
            v-for="item in logTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input
          v-model="paylaod.keyword"
          placeholder="请输入操作行为"
          suffix-icon="i-ep-search"
          style="width: 160px"
        />
      </template>
    </TableHeadBar>
    <DataTable
      v-model:page-num="paylaod.pageNum"
      :total="columnDataTotal"
      :columns="columns"
      :data="columnData"
      stripe
    >
      <template #result="{ row }">
        <el-tag :type="row.result === 'FIAL' ? 'danger' : 'success'">
          {{ row.result === 'FIAL' ? '失败' : '成功' }}
        </el-tag>
      </template>
      <template #eventType="{ row }">
        {{ LogType[row.eventType] }}
      </template>
    </DataTable>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import DataTable from '@/components/renderer/DataTable.vue'
import TableHeadBar from '@/components/form/TableHeadBar.vue'
import { request } from '@/util/request'
import { sysApi } from '@/apis/sys'
import { formatDate } from '@/util'
import { LogType, LogStatus } from '@/enums'

const logTypeOptions = [
  {
    label: '系统级事件',
    value: LogType['系统级事件']
  },
  {
    label: '业务级事件',
    value: LogType['业务级事件']
  }
]

const logStatusOptions = [
  {
    label: '成功',
    value: LogStatus['成功']
  },
  {
    label: '失败',
    value: LogStatus['失败']
  }
]

const logActionOptions = [
  {
    label: '全部',
    value: ''
  },
  {
    label: '新增',
    value: '新增'
  },
  {
    label: '修改',
    value: '修改'
  },
  {
    label: '删除',
    value: '删除'
  },
  {
    label: '注销',
    value: '注销'
  },
  {
    label: '授权',
    value: '授权'
  }
]

const logSortOptions = [
  {
    label: '升序',
    value: 2
  },
  {
    label: '降序',
    value: 1
  }
]

const paylaod = reactive({
  pageNum: 1,
  pageSize: 20,
  keyword: '',
  eventType: '',
  time: [],
  zt: '', // 这里传的值是 LogStatus，不过返回的不是对应的值，而是 1101/1102
  sort: 1
})

const columns = [
  {
    prop: 'id',
    label: 'ID',
    hide: true
  },
  {
    prop: 'name',
    label: '操作行为',
    fixed: 'left',
    width: '140'
  },
  {
    prop: 'opMethod',
    label: '请求方法',
    width: '100'
  },
  {
    prop: 'result',
    label: '状态',
    slot: 'result',
    width: '100'
  },
  {
    prop: 'eventType',
    label: '事件类型',
    slot: 'eventType',
    width: '100'
  },
  {
    prop: 'ip',
    label: 'IP地址',
    width: '150'
  },
  {
    prop: 'location',
    label: '位置',
    width: '150'
  },
  {
    prop: 'userName',
    label: '用户',
    width: '150'
  },
  {
    prop: 'browser',
    label: '浏览器',
    width: '150'
  },
  {
    prop: 'os',
    label: '操作系统',
    width: '180'
  },
  {
    prop: 'createTime',
    label: '时间',
    sortable: true,
    width: '150'
  }
]
const columnData = ref<LogRes[]>([])
const columnDataTotal = ref(0)

async function fetchList() {
  try {
    const pl = {
      ...paylaod,
      startTime: paylaod.time[0] ? formatDate(paylaod.time[0], 'yyyy-MM-dd hh:mm') : '',
      endTime: paylaod.time[1] ? formatDate(paylaod.time[1], 'yyyy-MM-dd hh:mm') : ''
    }
    const { time, ...params } = pl
    const { data } = await request.get<any, ARC.ListRes<LogRes>>(sysApi.getLogs, params)
    columnData.value = data.list
    columnDataTotal.value = data.total
  } catch (error) {
    onError(error)
  }
}

const onError = (error: any) => console.log('出错了', error?.message)

watch(paylaod, fetchList, { deep: true })

onMounted(() => {
  fetchList()
})

onErrorCaptured((error: any) => {
  onError(error)
  return true
})

interface LogRes {
  id: string
  name: string
  opType: number
  funcType: number
  opMethod: string
  result: string
  ip: string
  location: string
  userName: string
  entName: string
  reqUrl: string
  reqParams: string
  repData: string
  repTime: string
  browser: string
  os: string
  className: string
  createTime: string
  state: number
}
</script>

<style scoped lang="scss">
.logs {
  &:deep(.head-bar-right) {
    gap: 4px;
  }
}

.custom-style {
  display: flex;
  .el-segmented {
    --el-segmented-item-selected-color: var(--el-text-color-primary);
    --el-segmented-item-selected-bg-color: var(--el-color-primary-light-2);
    --el-segmented-item-selected-color: #ffffff;
    --el-border-radius-base: 6px;

    color: var(--el-text-color-primary);
  }
}
</style>
