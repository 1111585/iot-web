<template>
  <BaseContainer
    title="点位管理"
    v-model:box="listPayload.box"
    v-model:tab="tabBinding"
    :boxes="boxItems"
    :tabs="tabItems"
    :tags="tagItems"
  >
    <template #operation>
      <el-button type="primary" icon="i-ep-plus" @click="onAddBtnClick">点位添加</el-button>
    </template>
    <TableHeadBar v-model:keyword="listPayload.keyword" />
    <DataTable :columns="columns" :data="tableData">
      <template #status="{ row }">
        <el-switch v-model="row.status" />
      </template>
      <template #operation="{ row }">
        <TableOperator :row="row" :actions="actions" />
      </template>
    </DataTable>
    <el-dialog :title="addDialog.title" v-model="addDialog.visible" draggable>
      <CustomForm
        class="custom-form"
        ref="formRef"
        :form="formData"
        :form-fields="formFields"
        :rules="formRules"
        :is-show-footer-btn="false"
        @submit="onFormSubmit"
      >
        <template #areaName>
          <el-select v-model="formData.areaName">
            <el-option
              v-for="item in addOptions.areaName"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
        <template #buildingName>
          <el-select v-model="formData.buildingName">
            <el-option
              v-for="item in addOptions.buildingName"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
        <template #roomName>
          <el-select v-model="formData.roomName">
            <el-option
              v-for="item in addOptions.roomName"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </CustomForm>
      <template #footer>
        <el-button type="primary" @click="onDialogConfirm">确定</el-button>
        <el-button @click="addDialog.visible = false">取消</el-button>
      </template>
    </el-dialog>
  </BaseContainer>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import DataTable from '@/components/renderer/DataTable.vue'
import TableHeadBar from '@/components/form/TableHeadBar.vue'
import TableOperator from '@/components/form/TableOperator.vue'
import CustomForm from '@/components/form/CustomForm.vue'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import {
  detectPointColumn as columns,
  detectPointTag as tagItems,
  detectPointForm as formFields,
  detectPointFormRules as formRules,
  addDialog,
  tabItems,
  fetchList,
  fetchCounts,
  fetchAddOptions,
  listPayload,
  tableActions,
  fetchDetectPointDetail
} from '../utils'
import type { DetectDeviceRes } from '@/views/deviceManage/types'

type TableData = Omit<ARC.ExtractProps<typeof columns>, 'operation'>
type FormData = ARC.ExtractProps<typeof formFields>

const boxItems = ref([
  { name: '总数', alias: 'total', num: 0, type: 'info', value: '', unit: '个' },
  { name: '启用', num: 0, alias: 'enable', type: 'success', value: '1', unit: '个' },
  { name: '禁用', num: 0, alias: 'disable', type: 'danger', value: '0', unit: '个' }
])

const actions = tableActions['detectPoint']
const tabBinding = ref('0')
const tableData = ref<TableData[]>([])
const formData = ref<FormData>({
  areaName: '',
  roomName: '',
  pointName: '',
  buildingName: '',
  description: ''
})
const formRef = ref()

const addOptions = reactive({
  areaName: [] as ARC.Options[],
  roomName: [] as ARC.Options[],
  buildingName: [] as ARC.Options[]
})

function onAddBtnClick() {
  addDialog.showing('add', 'detectPoint')
}

function onDialogConfirm() {
  formRef.value?.confirm()
}

async function onFormSubmit(data: FormData) {
  try {
    // 下拉对应的名称
    const affiliatedPark = addOptions.areaName.find((item) => item.value === data.areaName)?.label
    const buildingName = addOptions.buildingName.find(
      (item) => item.value === data.buildingName
    )?.label
    const localCityName = addOptions.roomName.find((item) => item.value === data.roomName)?.label
    const pointId = addDialog.data?.id

    const urls = {
      add: deviceApi.addDetectPoint,
      edit: deviceApi.editDetectPoint
    }
    const msgs = {
      add: '添加成功',
      edit: '保存成功'
    }

    const url = urls[addDialog.type]
    const msg = msgs[addDialog.type]

    await request.postJson(url, {
      pointId: pointId,
      pointName: formData.value.pointName, //点位名称
      affiliatedPark: affiliatedPark, //所属园区
      affiliatedParkId: formData.value.areaName, //所属园区ID
      buildingName: buildingName, //楼宇名称
      buildingId: formData.value.buildingName, //楼宇ID
      localCityName: localCityName, //市内名称
      localCityId: formData.value.roomName, //市内ID
      description: formData.value.description, //描述
      departmentName: '本部门', //部门名称
      departmentId: '1' //部门ID
    })

    ElMessage.success(msg)
    addDialog.visible = false
    Object.keys(formData.value).forEach((key) => {
      formData.value[key] = ''
    })
    init()
  } catch (error) {
    console.log('error :>> ', error)
  }
}

function handleCounts() {
  fetchCounts(tabBinding.value).then((data) => {
    boxItems.value[1].num = data[0].num
    boxItems.value[2].num = data[1].num
    boxItems.value[0].num = boxItems.value[1].num + boxItems.value[2].num
  })
}
function handleList() {
  fetchList('detectPoint').then((res) => {
    if (res) {
      tableData.value = res
    }
  })
}

function init() {
  handleCounts()
  handleList()
}

watch(
  () => addDialog.visible,
  (val) => {
    fetchAddOptions().then((res) => {
      if (!res) return
      formFields.forEach((item) => {
        if (item.prop === 'areaName') {
          addOptions.areaName = res.areaOptions
        } else if (item.prop === 'buildingName') {
          addOptions.buildingName = res.buildingOptions
        } else if (item.prop === 'roomName') {
          addOptions.roomName = res.roomOptions
        }
      })
    })
    if (val && addDialog.type === 'edit') {
      fetchDetectPointDetail(addDialog.data?.id).then((res) => {
        if (!res) return
        formData.value.areaName = res.affiliatedParkId
        formData.value.roomName = res.localCityId
        formData.value.buildingName = res.buildingId
        formData.value.pointName = res.pointName
        formData.value.description = res.description
      })
    }
  }
)

watch(tabBinding, () => {
  handleCounts()
})

watch(listPayload, init, {
  deep: true
})

onMounted(() => {
  init()
})
</script>

<style lang="scss" scoped>
.custom-form {
  padding: 20px;
  &:deep(.el-form-item__content) {
    width: 100%;
    el-input {
      width: 100%;
    }
    .el-select {
      width: 100%;
    }
  }
}
</style>
