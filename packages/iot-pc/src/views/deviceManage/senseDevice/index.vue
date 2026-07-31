<template>
  <el-container>
    <el-aside width="250px" style="margin-right: -10px">
      <AsideTree type="sense" />
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
          <DeviceAddBtn type="sense" />
        </template>
        <TableHeadBar v-model:keyword="listPayload.keyword" :total="tableData.total" />
        <DataTable
          :columns="columns"
          :data="tableData.list"
          :loading="is.loading"
          :total="tableData.total"
          :page-size="listPayload.pageSize"
          :page-num="listPayload.pageNum"
          @update:page-num="onPageNumChange"
        >
          <template #name="{ row }">
            <span class="link" @click="onTitleClick(row)">{{ row.name }}</span>
          </template>
          <template #connectedness="{ row }">
            <ConnectednessDot ref="tourRefOne" :enabled="row.connectedness == 1" :key="row.name" />
          </template>
          <template #status="{ row }">
            <DeviceToggleSwitcher
              :status="row.status"
              :id="row.id"
              :key="row.id"
              type="sense"
              @refresh="main"
            />
          </template>
          <template #detectContent="{ row }">
            <span>{{ SenseAblity[row.detectContent] }}</span>
          </template>
          <template #operation="{ row }">
            <TableOperator :row="row" :actions="actions" @refresh="handleRefresh" />
          </template>
        </DataTable>
        <DeviceAddDialog @confirm="onDialogConfirm">
          <CustomForm
            class="custom-form"
            ref="formRef"
            :form-fields="formFields"
            :rules="formRules"
            :form="formData"
            :is-show-footer-btn="false"
            @submit="onFormSubmit"
          >
            <template #lan>
              <div class="flex-box">
                <el-input class="mr10" v-model="formData.lan" placeholder="请输入内网地址" />
                <ConnectionTestingButton
                  device-type="sense"
                  :target-url="formData.lan"
                  @get-result="getTestingResult"
                />
              </div>
            </template>
            <template #location>
              <!-- <el-select v-model="formData.location" filterable placeholder="请输入">
                <el-option
                  v-for="item in options.bindingLocation"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select> -->
              <el-input v-model="formData.location" placeholder="请输入" />
            </template>
            <template #aiBox>
              <el-select v-model="formData.aiBox">
                <el-option
                  v-for="item in options.aibox"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </CustomForm>
        </DeviceAddDialog>
        <DetailDialog ref="dialogRef" :key="forceKey" @close="onDetailDialogClose">
          <DeviceDetail page="sense" :data="saveData" />
        </DetailDialog>
        <el-tour v-model="isShow.tour" @close="onTourClose">
          <el-tour-step :target="tourRefOne?.$el" title="设备连通性">
            <div>点击此处可检查设备连通性</div>
            <el-checkbox
              class="mt10 ml10"
              v-model="dontShowThisTime"
              size="small"
              label="不再提示"
            />
          </el-tour-step>
        </el-tour>
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
import ConnectionTestingButton from '../components/ConnectionTestingButton.vue'
import ConnectednessDot from '@/components/form/ConnectednessDot.vue'
import DeviceAddDialog from '../components/DeviceAddDialog.vue'
import AsideTree from '../components/AsideTree.vue'
import DetailDialog from '../detail/DetailDialog.vue'
import DeviceDetail from '../detail/DeviceDetail.vue'
import DeviceAddBtn from '@/views/deviceManage/components/DeviceAddBtn.vue'
import { deviceApi } from '@/apis/device'
import { request } from '@/util/request'
import { SenseAblity } from '@/enums'
import { useConfigStore } from '@/store/config'
import {
  tabItems,
  addDialog,
  listPayload,
  tableActions,
  fetchVideoBaseInfo,
  fetchBindingLocationOptions,
  fetchList,
  fetchCounts,
  fetchAllAibox,
  senceDeviceTag as tagItems,
  senceDeviceColumn as columns,
  senceDeviceForm as formFields,
  senceDeviceFormRules as formRules,
  senseDeviceBoxItems as boxItems,
  useDialog
} from '../utils'
import type { SenseDeviceRes } from '../types'

type FormData = ARC.ExtractProps<typeof formFields> & { image: string }
type TableData = Omit<ARC.ExtractProps<typeof columns>, 'operation'>

const route = useRoute()
const configStore = useConfigStore()

const pageTitle = route.meta.title as string
const is = reactive({
  loading: false,
  firstOpen: true
})
const isShow = reactive({
  tour: false
})

const forceKey = ref(0)
const connectedness = ref(false)
const dontShowThisTime = ref(false)

const containerRef = ref<InstanceType<typeof BaseContainer>>()
const formRef = ref<InstanceType<typeof CustomForm>>()
const dialogRef = ref<InstanceType<typeof DetailDialog>>()
const tourRefOne = ref()

const saveData = computed(() => dialogRef.value?.data)
const formData: FormData = reactive({
  deviceName: '',
  deviceId: '',
  deviceCode: '',
  location: '',
  deviceType: '1', // 默认选中可见光
  description: '',
  lan: '',
  wan: '',
  image: '',
  aiBox: ''
})
const tableData = reactive({
  list: [] as TableData[],
  total: 0
})

const dialog = useDialog('sense', formData)

const actions = tableActions['senseDevice']

const options = reactive({
  bindingLocation: [] as ARC.Options[],
  aibox: [] as ARC.Options[]
})

function onDialogConfirm() {
  formRef.value?.confirm()
}

function onTitleClick(row: any) {
  dialogRef.value?.open('感知设备详情', row)
}

function onDetailDialogClose() {
  forceKey.value += 1
}

function onTourClose() {
  if (dontShowThisTime.value) {
    configStore.setElTourConfig('sense', false)
  }
}

function onPageNumChange(num: number) {
  listPayload.value.pageNum = num
  handleList()
}

async function onFormSubmit() {
  try {
    const urls = {
      add: deviceApi.addSenseDevice,
      edit: deviceApi.editSenseDevice
    }
    const msgs = {
      add: '添加成功',
      edit: '修改成功'
    }

    const url = urls[addDialog.type]
    const msg = msgs[addDialog.type]

    const sensingId = addDialog.data?.id
    const bindingPosition = options.bindingLocation.find(
      (item) => item.value === formData.location
    )?.label
    const aiBoxName = options.aibox.find((item) => item.value === formData.aiBox)?.label

    const { code } = await request.postJson(url, {
      pictureId: '',
      pictureName: '',
      distributionTitle: '', //布控标题
      distributionId: '', //布控ID
      streamingMediaAddress: '', //流媒体地址
      monitoringEquipmentName: '', //监测设备名称
      monitoringEquipmentId: '', //监测设备主键ID
      departmentName: '', //部门名称
      departmentId: '', //部门ID
      ...dialog.saveData.value,
      // 默认值分界线 ..... 上面的即使没值（新增）也提交
      aiBoxName: aiBoxName, //AI盒子名称
      aiBoxId: formData.aiBox, //设备ID
      sensingId: sensingId, //感知设备主键ID
      sensingDeviceName: formData.deviceName, //感知设备名称
      sensingDeviceId: formData.deviceCode, //设备ID （formData.deviceId， 已隐藏，默认传 deviceCode）
      sensingDeviceCoding: formData.deviceCode, //设备编码
      bindingPosition: formData.location, //绑定位置 (改为了手动输入 原值 bindingPosition)
      bindingPositionId: formData.location, //绑定位置ID
      sensingDeviceType: formData.deviceType, //设备类型：1可见光、2红外
      description: formData.description, //描述
      connectedness: connectedness.value ? 1 : 0, //设备连通性(1正常,0不正常)
      intranetAddress: formData.lan, //内网地址
      externalAddress: formData.wan, //外网地址
      picturePath: JSON.stringify(formData.image)
    })

    if (code !== 100) throw new Error('添加失败')
    ElMessage.success(msg)
    addDialog.visible = false
    main()
  } catch (error: any) {
    console.log('[设备管理]感知设备', error?.message)
  }
}

function getTestingResult(boolean) {
  connectedness.value = boolean
}

function handleRefresh() {
  main()
}

function handleList() {
  is.loading = true
  fetchList<SenseDeviceRes>('sense')
    .then((res) => {
      if (!res) return
      tableData.total = res.raw.total
      tableData.list = res.list.map((item) => ({
        id: item.sensingId,
        name: item.sensingDeviceName,
        alarm: item.existWarning,
        deviceId: item.sensingDeviceId,
        location: item.bindingPosition,
        status: item.enable == 1,
        detectContent: item.sensingDeviceType,
        deviceCode: item.sensingDeviceCoding,
        connectedness: item.connectedness
      }))

      if (tableData.list.length > 0 && is.firstOpen) {
        if (configStore.elTourConfig.sense.show) {
          // TODO 暂时注释 暂时隐藏
          // isShow.tour = true
        }

        is.firstOpen = false
      }
    })
    .finally(() => {
      is.loading = false
    })
}

function handleCounts() {
  fetchCounts('sense', listPayload.value.tab).then((data) => {
    data && containerRef.value?.updateBoxItems(boxItems.value, data)
  })
}

function main() {
  handleList()
  handleCounts()
}

watch(
  () => addDialog.visible,
  (val) => {
    if (!val) return
    fetchBindingLocationOptions().then((res) => {
      if (!res) return
      options.bindingLocation = res.options
    })
    fetchVideoBaseInfo('video').then((res) => {
      if (!res) return

      const url = new URL(res.address)
      const baseUrl = `${url.protocol}//${url.hostname}:${url.port}`

      addDialog.setTestingUrl(baseUrl)
    })
    fetchAllAibox().then((res) => {
      if (!res) return
      options.aibox = res.options
    })
  }
)

watch(listPayload, main, { deep: true })

onMounted(() => {
  listPayload.value.box = 'total'
  listPayload.value.detectDeviceId = ''
  listPayload.value.treeNodeName = ''
  listPayload.value.treeNodeLevel = '' as unknown as number
  main()
})
</script>

<style lang="scss" scoped src="../styles.scss"></style>
