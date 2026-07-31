<template>
  <form-dialog title="账号详情" height="500px" width="800px" @close="close" v-model="detailVisible">
    <template #content>
      <el-table :data="state.accountData?.list" style="width: 100%">
        <el-table-column
          prop="account"
          label="账号"
          min-width="150"
          align="center"
        ></el-table-column>
        <el-table-column label="类型" min-width="100" align="center">
          <template #default="props">
            <span>{{ props.row.accountType == 1 ? '账号' : '手机' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="props">
            <el-tag :type="baseTagType(props.row.status)">
              {{ AccountStatus[props.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" align="center">
          <template #default="scope">
            <div v-if="+scope.row.status !== AccountStatus['注销']">
              <el-button
                type="primary"
                text
                size="default"
                @click="handleUpdatePwd(scope.row)"
                icon="i-ep-edit"
              >
                修改密码
              </el-button>
              <el-button
                type="primary"
                text
                size="default"
                @click="handleUpdateAccount(scope.row)"
                icon="i-ep-edit"
              >
                修改信息
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- <ElForm size="default" ref="accountFromRef" label-width="90px" v-loading="loading">
        <el-row>
          <el-col :span="24">
            <ElFormItem label="账号：">
              <span>{{ state.accountData?.account || '-' }}</span>
            </ElFormItem>
          </el-col>
          <el-col :span="24">
            <ElFormItem label="类型：">
              <span>{{ state.accountData?.accountType == 1 ? '账号' : '手机' }}</span>
            </ElFormItem>
          </el-col>
          <el-col :span="24">
            <ElFormItem label="状态：">
              <span>{{ state.accountData?.status == 1101 ? '启用' : '禁用' }}</span>
            </ElFormItem>
          </el-col>
        </el-row>
      </ElForm> -->
    </template>
    <template #footer>
      <!-- <el-button type="primary" @click="handleUpdatePwd" :loading="saveLoading">修改密码</el-button> -->
      <el-button @click="close">取消</el-button>
    </template>
  </form-dialog>
  <UpdatePwd
    v-if="visible"
    title="修改密码"
    :objId="state.currentAccount.accountId"
    :isEdit="isEdit"
    v-model="visible"
    :userInfo="state.currentAccount"
  ></UpdatePwd>
</template>
<script setup lang="ts">
import { useDetailForm, useListWithForm } from '@/composable/listWithFormSup'
import { type FormInstance } from 'element-plus'
import { request } from '@/util/request'
import empApi from '@/apis/emp'
import { useGet } from '@/composable/requestSup'
import { validatePwd } from '@/util/validate'
import UpdatePwd from './updatePwd.vue'
import { AccountStatus } from '@/enums'
import { baseTagType } from '@/util/styles'
import { checkPermPrompt } from '@/views/sys/utils'

const accountFromRef = ref<FormInstance>()
const props = defineProps<{
  title: string
  isEdit?: boolean
  objId?: string
  modelValue: boolean
  userInfo: any
}>()
const detailVisible = ref(props.modelValue) //数据源
const saveLoading = ref(false)
const loading = ref(false)
const { visible, isEdit, objId, useOpsAdd, useOpsUpdate } = useListWithForm()
const emit = defineEmits(['update:modelValue', 'onRefresh', 'click-update'])
const { combTitle, refreshList } = useDetailForm(props.title, props.isEdit, emit)

const state = reactive({
  accountData: {
    account: '',
    accountId: '',
    accountType: '',
    status: ''
  } as any,
  currentAccount: {
    account: '',
    accountId: '',
    accountType: '',
    status: ''
  } as any
})

onMounted(() => {
  request.get(empApi.getOneByEmpId, { empId: props.userInfo.empId }).then((rep) => {
    state.accountData = rep.data
  })
})

const close = () => {
  detailVisible.value = false
  emit('update:modelValue', false)
}

const handleUpdatePwd = (row) => {
  checkPermPrompt()
    .then(() => {
      state.currentAccount = row
      visible.value = true
    })
    .catch(() => {})
}
const handleUpdateAccount = (row) => {
  state.currentAccount = row
  emit('click-update', row)
}
</script>
<style scoped lang="scss"></style>
