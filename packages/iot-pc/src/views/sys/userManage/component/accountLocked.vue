<template>
  <el-drawer
    v-model="props.modelValue"
    title="锁定账号列表"
    size="50%"
    @close="emit('update:modelValue', false)"
  >
    <div class="p10">
      <DataTable :columns="column" :data="list">
        <template #accountType="scope">
          {{ scope.row.accountType == 1 ? '账号' : '手机' }}
        </template>
        <template #status="scope">
          <el-tag :type="baseTagType(scope.row.status)">
            {{ AccountStatus[scope.row.status] }}
          </el-tag>
        </template>
        <template #accountCycle="scope">
          {{ AccountCycle[scope.row.accountCycle] }}
        </template>
      </DataTable>
    </div>
    <template #footer>
      <el-button type="primary" @click="onExportClick">导出</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import DataTable from '@/components/renderer/DataTable.vue'
import empApi from '@/apis/emp'
import { baseTagType } from '@/util/styles'
import { request } from '@/util/request'
import { fetchLockAccountList } from '../../utils'
import { AccountStatus, AccountCycle } from '@/enums'
import type { AccountRes } from '../../types'
interface Props {
  modelValue: boolean
}
interface Emit {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const listQuery = reactive({
  status: AccountStatus['锁定'] as const,
  pageNum: 1,
  pageSize: 20
})
const list = ref<AccountRes[]>([])

function onExportClick() {
  request.downloadStream(empApi.exportLock, undefined, { ...listQuery, pageSize: 999 }, 'GET')
}

onMounted(() => {
  fetchLockAccountList<AccountRes>(listQuery).then((res) => {
    if (res.data?.list.length === 0) return
    list.value = res.data.list
  })
})

const column: ARC.Column[] = [
  {
    label: '账号',
    prop: 'account',
    fixed: 'left',
    align: 'center'
  },
  {
    label: '账号类型',
    prop: 'accountType',
    slot: 'accountType',
    align: 'center'
  },
  {
    label: '状态',
    prop: 'status',
    slot: 'status',
    align: 'center'
  },
  {
    label: '账号周期',
    prop: 'accountCycle',
    slot: 'accountCycle',
    align: 'center'
  },
  {
    label: '最后一次修改密码时间',
    prop: 'lastPasswordChangeTime',
    align: 'center'
  },
  {
    label: '添加时间',
    prop: 'createTime',
    align: 'center'
  },
  {
    label: '更新时间',
    prop: 'updateTime',
    align: 'center'
  }
]
</script>

<style scoped></style>
