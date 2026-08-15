<template>
  <el-container>
    <el-aside width="250px" style="margin-right: -10px">
      <AsideTree type="detect" />
    </el-aside>
    <el-main>
      <BaseContainer
        ref="containerRef"
        :title="pageTitle"
        v-model:box="listPayload.box"
        v-model:tab="listPayload.tab"
        v-model:tag="listPayload.tag"
        :boxes="boxItems"
        :tags="tagItems"
      >
        <!-- :tabs="tabItems" -->
        <template #operation>
          <DeviceAddBtn type="detect" />
        </template>
        <TableHeadBar v-model:keyword="listPayload.keyword" :total="tableData.total" />
        <DataTable
          :columns="columns"
          :data="tableData.list"
          row-key="id"
          :loading="tableData.loading"
        >
          <template #name="{ row }">
            <span class="link" @click="onTitleClick(row)">{{ row.name }}</span>
          </template>
          <template #status="{ row }">
            <!-- <el-switch v-model="row.status" /> -->
            <DeviceToggleSwitcher v-model="row.status" :id="row.id" type="detect" />
          </template>
          <!-- TODO -->
          <template #detectContent="{ row }">
            <span>{{ DetectContent[row.detectContent] || '超温、电弧闪络' }}</span>
          </template>
          <template #operation="{ row }">
            <TableOperator :row="row" :actions="actions" @refresh="handleRefresh" />
          </template>
        </DataTable>
        <DeviceAddDialog @confirm="onDialogConfirm">
          <CustomForm
            class="custom-form"
            ref="formRef"
            :form="formData"
            :form-fields="formFields"
            :rules="formRules"
            :is-show-footer-btn="false"
            @submit="onFormSubmit"
          >
            <template #location>
              <el-select v-model="formData.location">
                <el-option
                  v-for="item in locationList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
            <template #deviceType>
              <el-select v-model="formData.deviceType">
                <el-option
                  v-for="item in deviceTypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </CustomForm>
        </DeviceAddDialog>
        <DetailDialog ref="dialogRef" :key="forceKey" @close="onDetailDialogClose">
          <DeviceDetail page="detect" :data="saveData" />
        </DetailDialog>
      </BaseContainer>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import DataTable from '@/components/renderer/DataTable.vue'
import TableHeadBar from '@/components/form/TableHeadBar.vue'
import TableOperator from '@/components/form/TableOperator.vue'
import CustomForm from '@/components/form/CustomForm.vue'
import DeviceToggleSwitcher from '@/components/form/DeviceToggleSwitcher.vue'
import DeviceAddDialog from '../components/DeviceAddDialog.vue'
import AsideTree from '../components/AsideTree.vue'
import DetailDialog from '../detail/DetailDialog.vue'
import DeviceDetail from '../detail/DeviceDetail.vue'
import DeviceAddBtn from '@/views/deviceManage/components/DeviceAddBtn.vue'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import { DetectContent } from '@/enums'
import { deviceListRefreshSignal } from '@/utils/deviceListRefresh'
import {
  detectDeviceColumn as columns,
  detectDeviceForm as formFields,
  detectDeviceFormRules as formRules,
  detectDeviceTag as tagItems,
  detectDeviceBoxItems as boxItems,
  tabItems,
  addDialog,
  tableActions,
  fetchList,
  fetchCounts,
  listPayload,
  locationList,
  useDeviceTypeList,
  useDialog,
  fetchDeviceTypeFromDict
} from '../utils'
import type { DetectDeviceRes } from '../types'

type TableData = Omit<ARC.ExtractProps<typeof columns>, 'operation'>
type FormData = ARC.ExtractProps<typeof formFields>

useDeviceTypeList(addDialog)
const route = useRoute()
const pageTitle = route.meta.title as string

const actions = tableActions['detectDevice']

const forceKey = ref(0)
const formRef = ref<InstanceType<typeof CustomForm>>()
const containerRef = ref<InstanceType<typeof BaseContainer>>()
const dialogRef = ref<InstanceType<typeof DetailDialog>>()

const saveData = computed(() => dialogRef.value?.data)
const deviceTypeList = ref<ARC.Options[]>([])

const formData: FormData = reactive({
  deviceName: '',
  deviceId: '',
  deviceCode: '',
  location: '',
  deviceType: '', // 默认选中可见光
  description: '',
  detectContent: [],
  image: ''
})
const tableData = reactive({
  list: [] as TableData[],
  total: 0,
  loading: false
})

const dialog = useDialog('detect', formData)

function onTitleClick(row: TableData) {
  dialogRef.value?.open('监测设备详情', row)
}

function onDialogConfirm() {
  formRef.value?.confirm()
}

function onDetailDialogClose() {
  forceKey.value++
}

async function onFormSubmit() {
  try {
    const urls = {
      add: deviceApi.addDetectDevice,
      edit: deviceApi.editDetectDevice
    }
    const msgs = {
      add: '添加成功',
      edit: '修改成功'
    }

    const url = urls[addDialog.type]
    const msg = msgs[addDialog.type]

    const monitoringEquipmentId = addDialog.data?.id

    const detectContent = Object.values(formData.detectContent).join('、')
    const locationName = locationList.value.find((item) => item.value === formData.location)?.label

    await request.postJson(url, {
      sensingDeviceName: '', //感知设备名称
      deviceType: '', //设备类型
      pictureId: '',
      pictureName: '',
      departmentName: '', //部门名称
      departmentId: '', //部门ID
      sensingDeviceId: '', //感知设备ID
      ...dialog.saveData.value,
      equipmentId: formData.deviceId, //设备ID
      equipmentName: formData.deviceName,
      equipmentCoding: formData.deviceCode, //设备编码
      deviceTypeId: formData.deviceType, //设备类型ID
      bindingPosition: locationName, //绑定位置
      bindingPositionId: formData.location, //绑定位置ID
      picturePath: JSON.stringify(formData.image),
      description: formData.description, //描述
      monitoringEquipmentId: monitoringEquipmentId, //监测设备主键ID
      monitoringContent: detectContent
    })

    ElMessage.success(msg)
    addDialog.visible = false
    main()
  } catch (error) {
    console.log(error)
  }
}

function handleRefresh() {
  main()
}

function handleList() {
  tableData.loading = true
  fetchList<DetectDeviceRes>('detect')
    .then((data) => {
      if (!data) return console.log('[监测设备]没有数据！')
      tableData.total = data.raw.total
      tableData.list = data.list.map((item) => ({
        id: item.monitoringEquipmentId,
        name: item.equipmentName,
        alarm: item.existWarning, //当前是否存在告警（0否、1是）
        deviceId: item.equipmentId,
        addDate: item.addTime,
        location: item.bindingPosition,
        detectContent: item.monitoringContent, // (1电弧闪烁、2超温)
        status: item.enable, //是否启用（0禁用、1启用）
        senseName: item.sensingDeviceName
      }))
    })
    .finally(() => {
      tableData.loading = false
    })
}

function handleCounts() {
  fetchCounts('detect', listPayload.value.tab).then((data) => {
    data && containerRef.value?.updateBoxItems(boxItems.value, data)
  })
}

function main() {
  handleList()
  handleCounts()
}

watch(listPayload, main, { deep: true })

// 处置/删除告警成功后主动刷新设备列表红点
watch(deviceListRefreshSignal, main)

watch(
  () => addDialog.visible,
  (flag) => {
    if (!flag) return
    fetchDeviceTypeFromDict().then((res) => {
      if (!res) return
      deviceTypeList.value = res.options
    })
  }
)

onMounted(() => {
  listPayload.value.box = 'total'
  listPayload.value.detectDeviceId = ''
  listPayload.value.treeNodeName = ''
  main()
})
</script>

<style lang="scss" scoped src="../styles.scss"></style>
