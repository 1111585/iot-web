<template>
  <BaseContainer title="位置管理" v-model:tab="listPayload.tab" :tabs="areaTabs">
    <template #operation>
      <el-button type="primary" icon="i-ep-plus" @click="onAddClick()">添加</el-button>
    </template>
    <TableHeadBar v-model:keyword="listPayload.keyword" :total="tableTotal" />
    <DataTable v-if="listPayload.tab === 'park'" :columns="parkColumns" :data="parkColumnData">
      <template #operation="{ row }">
        <TableOperator
          :row="{ ...row, type: 'park' }"
          :actions="baseActions"
          @refresh="handleRefresh"
        />
      </template>
    </DataTable>
    <DataTable
      v-else-if="listPayload.tab === 'building'"
      :columns="buildingColumns"
      :data="buildingColumnData"
    >
      <template #operation="{ row }">
        <TableOperator
          :row="{ ...row, type: 'building' }"
          :actions="baseActions"
          @refresh="handleRefresh"
        />
      </template>
    </DataTable>
    <DataTable
      v-else-if="listPayload.tab === 'room'"
      :columns="roomColumns"
      :data="roomColumnData"
      :loading="is.loading"
    >
      <template #operation="{ row }">
        <TableOperator
          :row="{ ...row, type: 'room' }"
          :actions="baseActions"
          @refresh="handleRefresh"
        />
      </template>
    </DataTable>
    <DataTable
      v-else-if="listPayload.tab === 'point'"
      :columns="pointColumns"
      :data="pointColumnData"
      :loading="is.loading"
    >
      <template #operation="{ row }">
        <TableOperator
          :row="{ ...row, type: 'point' }"
          :actions="pointActions"
          @refresh="handleRefresh"
        />
      </template>
    </DataTable>
    <el-dialog
      class="dialog"
      v-model="areaAddDialog.visible"
      :title="dialogTitle"
      :width="dialogWidth"
      draggable
      destroy-on-close
    >
      <!-- 所属点位的表单 -->
      <DetectPointForm
        v-if="listPayload.tab === 'point'"
        ref="detectPointFormRef"
        @refresh="handleRefresh"
      />
      <!-- 所属园区、所属楼宇、所属室内的表单 -->
      <el-form v-else class="mt10" ref="formRef" :model="formData" :rules="formRules">
        <el-form-item prop="name" label="名称">
          <el-input v-model="formData.name" placeholder="请输入名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="areaAddDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="onDialogConfirm()">确定</el-button>
      </template>
    </el-dialog>
  </BaseContainer>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import TableHeadBar from '@/components/form/TableHeadBar.vue'
import DataTable from '@/components/renderer/DataTable.vue'
import TableOperator from '@/components/form/TableOperator.vue'
import DetectPointForm from './components/DetectPointForm.vue'
import user from '@/store/user'
import { validateAsync } from '@/util'
import { request } from '@/util/request'
import { addDialog as pointAddDialog } from '@/views/systemManage/utils'
import {
  areaTabs,
  listPayload,
  dialogTitles,
  submitUrls,
  submitPayloads,
  editUrls,
  parkColumns,
  buildingColumns,
  roomColumns,
  pointColumns,
  fetchList,
  fetchDetail,
  baseActions,
  pointActions,
  addDialog as areaAddDialog
} from './utils'
import type { ParkRes, BuildingRes, RoomRes } from './types'
import type { DetectPointRes } from '../types'

const userInfo = computed(() => user().userInfo)

const parkColumnData = ref()
const buildingColumnData = ref()
const roomColumnData = ref()
const pointColumnData = ref()
const tableTotal = ref(0)

const formRef = ref<FormInstance>()
const detectPointFormRef = ref()

const dialogTitle = computed(() => {
  return dialogTitles[listPayload.value.tab]
})
const dialogWidth = computed(() => {
  return listPayload.value.tab === 'point' ? '750px' : '500px'
})

const is = reactive({
  loading: false
})

const formData = reactive({
  name: '',
  entId: userInfo.value?.entId
})
const formRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
}

function onAddClick() {
  areaAddDialog.value.show('add')
  pointAddDialog.type = 'add'
}

function onDialogConfirm() {
  const type = listPayload.value.tab
  switch (type) {
    case 'point':
      detectPointFormRef.value?.confirm()
      break
    default:
      handleFormSubmit()
      break
  }
}

async function handleFormSubmit() {
  try {
    await validateAsync(formRef.value)

    const isEdit = pointAddDialog.type !== 'add'
    const submitType = areaAddDialog.value.data.type
    const submitKeys = {
      park: 'parkId',
      building: 'buildingId',
      room: 'localCityId'
    }
    // 编辑或新增
    const url = isEdit ? editUrls[listPayload.value.tab] : submitUrls[listPayload.value.tab]
    const payload = {
      ...areaAddDialog.value.data,
      ...submitPayloads(listPayload.value.tab, formData),
      entId: formData.entId,
      [submitKeys[submitType]]: areaAddDialog.value.data[submitKeys[submitType]]
    }

    await request.postJson(url, payload)
    success()
    main()
  } catch (error) {
    console.log(error)
  }
}

function handleRefresh() {
  areaAddDialog.value.visible = false
  main()
}

function success(msg = '保存成功') {
  areaAddDialog.value.visible = false
  formRef.value?.resetFields()
  ElMessage.success(msg)
}

function handleList() {
  is.loading = true
  const type = listPayload.value.tab

  fetchList<ARC.AnyObj>(type)
    .then((res) => {
      if (!res) return
      tableTotal.value = res.total

      switch (type) {
        case 'park':
          parkColumnData.value = (res.list as ParkRes[]).map((item) => ({
            id: item.parkId,
            name: item.parkName,
            createTime: item.createTime,
            createUser: item.createUser
          }))
          break
        case 'building':
          buildingColumnData.value = (res.list as BuildingRes[]).map((item) => ({
            id: item.buildingId,
            name: item.buildingName,
            createTime: item.createTime,
            createUser: item.createUser
          }))
          break
        case 'room':
          roomColumnData.value = (res.list as RoomRes[]).map((item) => ({
            id: item.localCityId,
            name: item.localCityName,
            createTime: item.createTime,
            createUser: item.createUser
          }))
          break
        case 'point':
          pointColumnData.value = (res.list as DetectPointRes[]).map((item) => ({
            id: item.pointId,
            name: item.pointName,
            park: item.affiliatedPark,
            building: item.buildingName,
            room: item.localCityName,
            createTime: item.addTime,
            createUser: item.addUser
          }))
          break
      }
    })
    .finally(() => {
      is.loading = false
    })
}
function main() {
  handleList()
}

watch(() => [listPayload.value.tab, listPayload.value.keyword], main)
watch(
  () => areaAddDialog.value.visible,
  (flag) => {
    if (!flag) {
      formRef.value?.resetFields()
      areaAddDialog.value.clear()
      return
    }
    const data = areaAddDialog.value.data
    const isEdit = areaAddDialog.value.type === 'edit'
    const type = listPayload.value.tab
    // 编辑 园区、楼宇、房间
    if (type !== 'point' && isEdit) {
      fetchDetail(type, data.id).then((res) => {
        areaAddDialog.value.data = { ...res?.raw, type }
        const item = res?.raw
        switch (type) {
          case 'park':
            formData.name = item.parkName
            break
          case 'building':
            formData.name = item.buildingName
            break
          case 'room':
            formData.name = item.localCityName
            break
        }
      })
    }
  }
)

onMounted(() => {
  main()
})
</script>

<style lang="scss" scoped>
.dialog {
  padding: 20px;
}
</style>
