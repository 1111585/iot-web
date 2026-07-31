<template>
  <BaseContainer :title="pageTitle">
    <template #operation>
      <el-button type="primary" icon="i-ep-plus" @click="useDialog.show('add')">添加</el-button>
    </template>
    <TableHeadBar v-model:keyword="listQuery.keyword" :total="total" />
    <DataTable v-model:page-num="listQuery.pageNum" :total="total" :columns="column" :data="list">
      <template #status="{ row }">
        <el-tag :type="+row.status === 1 ? 'success' : 'danger'">
          {{ +row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>
      <template #opt="{ row }">
        <el-button link type="primary" @click="useDialog.show('edit', row)">编辑</el-button>
        <el-button link type="danger" @click="deleteItem(row.accessId)">删除</el-button>
      </template>
    </DataTable>
    <el-dialog
      v-model="useDialog.visible"
      :title="useDialog.title"
      draggable
      destroy-on-close
      width="678px"
      class="user-access-dialog"
      @close="useDialog.close()"
    >
      <div class="pl20 pr40 pt20">
        <CustomForm
          ref="formRef"
          label-width="140px"
          :form="form"
          :formFields="formFields"
          :rules="rules"
          :is-show-footer-btn="false"
        >
          <template #userId>
            <el-select v-model="form.userId" placeholder="请选择用户" style="width: 220px">
              <el-option
                v-for="item in empList"
                :key="item.empId"
                :label="item.nickname"
                :value="item.empId"
              />
            </el-select>
          </template>
        </CustomForm>
      </div>
      <template #footer>
        <el-button @click="useDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="useDialog.onConfirm()">确定</el-button>
      </template>
    </el-dialog>
  </BaseContainer>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import DataTable from '@/components/renderer/DataTable.vue'
import TableHeadBar from '@/components/form/TableHeadBar.vue'
import CustomForm from '@/components/form/CustomForm.vue'
import { useGet } from '@/composable/requestSup'
import { request } from '@/util/request'
import { sysApi } from '@/apis/sys'
import empApi from '@/apis/emp'
import { formatDate } from '@/util'
import { validateIpv4 } from '@/util/validate'
import type { UserAccessRes } from '@/views/sys/types'

type DT = ARC.DialogType

const route = useRoute()
const pageTitle = route.meta.title as string

const is = reactive({
  loading: false
})

const listQuery = reactive({
  keyword: '',
  pageSize: 20,
  pageNum: 1
})
watch(listQuery, () => fetchList())

const list = ref<UserAccessRes[]>([])
const total = ref(0)
const currentItem = ref<UserAccessRes>()

const formRef = ref<InstanceType<typeof CustomForm>>()
const form = reactive({
  userId: '',
  startTime: '',
  endTime: '',
  ipAddresses: '',
  status: 1 //状态（1:启用，2:禁用）
})
const rules = reactive({
  userId: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
  startTime: [
    { required: false, message: '请输入限制开始时间', trigger: 'blur' },
    { validator: validateStartTime, trigger: ['blur', 'change'] }
  ],
  endTime: [
    { required: false, message: '请输入限制结束时间', trigger: 'blur' },
    { validator: validateEndTime, trigger: ['blur', 'change'] }
  ],
  ipAddresses: [
    { required: false, message: '请输入限制访问的IP地址', trigger: 'blur' },
    { validator: validateIpAddresses, trigger: ['blur', 'change'] }
  ],
  status: [{ required: true, message: '请输入状态', trigger: 'blur' }]
})

const useDialog = reactive({
  visible: false,
  type: 'add' as DT,
  title: '',
  accessId: '',
  show(type: DT, row?: UserAccessRes) {
    const titles = {
      add: '添加用户访问限制',
      edit: '编辑用户访问限制'
    }

    this.visible = true
    this.type = type
    this.title = titles[type]

    row && (currentItem.value = row)
    if (type === 'edit' && row?.accessId) {
      this.accessId = row.accessId
      fetchDetail(row.accessId)
    }
    fetchEmpList()
  },
  async onConfirm() {
    try {
      is.loading = true
      await formRef.value?.validate()
      await submitForm()

      useDialog.close()
    } catch (error) {
      console.log(error)
    } finally {
      is.loading = false
    }
  },
  close() {
    this.visible = false
    formRef.value?.resetFields()
    currentItem.value = undefined
    this.accessId = ''
  }
})

async function submitForm() {
  try {
    const reqUrl = useDialog.type === 'edit' ? sysApi.userAcc.update : sysApi.userAcc.create
    const reqData = {
      ...form,
      startTime: formatDate(form.startTime, 'yyyy-MM-dd hh:mm'),
      endTime: formatDate(form.endTime, 'yyyy-MM-dd hh:mm')
    }
    if (useDialog.type === 'edit') {
      reqData.accessId = useDialog.accessId
    }
    const { code } = await request.postJson(reqUrl, reqData)
    if (code === 100) {
      ElMessage.success(useDialog.type === 'edit' ? '编辑成功' : '添加成功')
      fetchList()
    }
  } catch (error) {
    console.log(error)
  }
}

function deleteItem(id: string) {
  useGet(sysApi.userAcc.delete, { id }, '删除', '是否要删除该用户访问限制').then(() => fetchList())
}

async function fetchList() {
  try {
    const { data } = await request.get<any, ARC.ListRes<UserAccessRes>>(
      sysApi.userAcc.list,
      listQuery
    )
    list.value = data.list
    total.value = data.total
  } catch (error) {
    console.log(error)
  }
}

async function fetchDetail(id: string) {
  try {
    const { data } = await request.get<any, UserAccessRes>(sysApi.userAcc.getOne, { id })
    if (!data) return

    Object.keys(form).forEach((key) => {
      form[key] = data[key]
    })
  } catch (error) {
    console.log(error)
  }
}

const empList = ref<any[]>([])
const empTotal = ref(0)
const empQuery = reactive({
  keyword: '',
  pageSize: 20,
  pageNum: 1
})

async function fetchEmpList() {
  try {
    const { data } = await request.get<any, ARC.ListRes<UserAccessRes>>(empApi.empList, empQuery)
    empList.value = data.list
    empTotal.value = data.total
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  fetchList()
})

const formFields: ARC.FormField[] = reactive([
  {
    label: '用户ID',
    prop: 'userId',
    type: 'slot',
    slot: 'userId'
  },
  {
    label: '限制开始时间',
    prop: 'startTime',
    type: 'datepicker',
    attrs: {
      type: 'datetime'
    }
  },
  {
    label: '限制结束时间',
    prop: 'endTime',
    type: 'datepicker',
    attrs: {
      type: 'datetime'
    }
  },
  {
    label: '限制访问的IP地址',
    prop: 'ipAddresses',
    type: 'input'
  },
  {
    label: '状态',
    prop: 'status',
    type: 'radio-group',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 2 }
    ]
  }
])

const column: ARC.Column[] = [
  {
    label: '用户ID',
    prop: 'userId'
  },
  {
    label: '限制开始时间',
    prop: 'startTime'
  },
  {
    label: '限制结束时间',
    prop: 'endTime'
  },
  {
    label: '限制访问的IP地址',
    prop: 'ipAddresses'
  },
  {
    label: '状态',
    prop: 'status',
    slot: 'status'
  },
  {
    label: '创建人',
    prop: 'createUser'
  },
  {
    label: '创建时间',
    prop: 'createTime'
  },
  {
    label: '操作',
    prop: 'opt',
    slot: 'opt'
  }
]

function validateStartTime(rule: any, value: any, callback: any) {
  if (value && form.endTime && new Date(value) > new Date(form.endTime)) {
    callback(new Error('开始时间不能晚于结束时间'))
  } else {
    callback()
  }
}

function validateEndTime(rule: any, value: any, callback: any) {
  if (value && form.startTime && new Date(value) < new Date(form.startTime)) {
    callback(new Error('结束时间不能早于开始时间'))
  } else {
    callback()
  }
}

function validateIpAddresses(rule: any, value: any, callback: any) {
  if (value && !validateIpv4(value)) {
    callback(new Error('IP地址格式不正确'))
  } else {
    callback()
  }
}
</script>

<style scoped lang="scss"></style>
