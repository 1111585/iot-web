<template>
  <el-container>
    <!-- <el-aside width="250px" style="margin-right: -10px">
      <AsideTree type="aibox" />
    </el-aside> -->
    <el-main>
      <BaseContainer
        ref="containerRef"
        v-model:box="listPayload.box"
        v-model:tab="listPayload.tab"
        v-model:tag="listPayload.tag"
        :title="pageTitle"
        :boxes="boxItems"
      >
        <!-- 隐藏 -->
        <!-- :tags="tagItems" -->
        <!-- :tabs="tabItems" -->
        <template #operation>
          <DeviceAddBtn type="aibox" />
        </template>
        <TableHeadBar v-model:keyword="listPayload.keyword" :total="tableData.total" />
        <DataTable
          :columns="columns"
          :data="tableData.list"
          :loading="tableData.loading"
          :total="tableData.total"
          :page-num="listPayload.pageNum"
          :page-size="listPayload.pageSize"
          @update:page-num="onPageNumChange"
        >
          <template #name="{ row }">
            <span class="link" @click="onTitleClick(row)">{{ row.name }}</span>
          </template>
          <template #connectedness="{ row }">
            <el-tag :type="connectedness[row.connectedness].type">
              {{ connectedness[row.connectedness].text }}
            </el-tag>
          </template>
          <template #ability="{ row }">
            <span>{{ DeviceAbility[row.ability] }}</span>
          </template>
          <template #status="{ row }">
            <DeviceToggleSwitcher
              :status="row.status"
              :id="row.id"
              :key="row.id"
              type="aibox"
              @refresh="main"
            />
          </template>
          <template #operation="{ row }">
            <TableOperator :row="row" :actions="actions" @refresh="handleRefresh" />
          </template>
        </DataTable>
        <DeviceAddDialog @confirm="onDialogConfirm">
          <CustomForm
            class="custom-form"
            ref="formRef"
            label-width="130px"
            :rules="formRules"
            :form-fields="formFields"
            :form="formData"
            :is-show-footer-btn="false"
            @submit="onFormSubmit"
          >
            <!-- <template #location>
              <el-select v-model="formData.location">
                <el-option
                  v-for="item in bindingLocation"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template> -->
          </CustomForm>
          <template #footer-left>
            <ConnectionTestingButton
              v-if="formData.config !== 'auto'"
              device-type="aibox"
              :data="formData"
              :targetUrl="formData.ip"
              @testingResult="getTestingResult"
            />
          </template>
        </DeviceAddDialog>
        <DetailDialog ref="dialogRef">
          <DeviceDetail page="aibox" :data="saveData" />
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
import ConnectionTestingButton from '../components/ConnectionTestingButton.vue'
import DeviceAddDialog from '../components/DeviceAddDialog.vue'
import DetailDialog from '../detail/DetailDialog.vue'
import DeviceDetail from '../detail/DeviceDetail.vue'
import DeviceAddBtn from '@/views/deviceManage/components/DeviceAddBtn.vue'
import AsideTree from '../components/AsideTree.vue'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import { DeviceAbility } from '@/enums'
import {
  aiBoxTag as tagItems,
  aiBoxColumn as columns,
  aiBoxForm as formFields,
  aiBoxFormRules as formRules,
  aiBoxBoxItems as boxItems,
  bindingLocation,
  tabItems,
  addDialog,
  listPayload,
  fetchCounts,
  fetchList,
  tableActions,
  useBindingLocation,
  useDialog
} from '../utils'
import type { AiBoxRes } from '../types'

type FormData = ARC.ExtractProps<typeof formFields> & { location: string }
type TableData = Omit<ARC.ExtractProps<typeof columns>, 'operation'>

useBindingLocation(addDialog)

const route = useRoute()
const pageTitle = route.meta.title as string

const actions = tableActions['aiBox']
const connectedness = {
  0: {
    type: 'danger',
    text: '关闭'
  },
  1: {
    type: 'success',
    text: '启动'
  }
}

const connectionTestingResult = ref(false)
const formRef = ref<InstanceType<typeof CustomForm>>()
const containerRef = ref<InstanceType<typeof BaseContainer>>()
const dialogRef = ref<InstanceType<typeof DetailDialog>>()
const saveData = computed(() => dialogRef.value?.data)

const formData: Partial<FormData> = reactive({
  ability: 1,
  boxName: '',
  description: '',
  deviceCode: '',
  deviceId: '',
  location: '',
  image: [],
  config: 'auto',
  ip: '',
  mask: '',
  gateway: '',
  version: '',
  connectedness: 0
})

const dialog = useDialog('aibox', formData)

const tableData = reactive({
  list: [] as TableData[],
  total: 0,
  loading: false
})

function onDialogConfirm() {
  formRef.value?.confirm()
}

function onPageNumChange(num: number) {
  listPayload.value.pageNum = num
  handleList()
}

async function onFormSubmit() {
  try {
    const urls = {
      add: deviceApi.addAiBox,
      edit: deviceApi.editAiBox
    }
    const msgs = {
      add: '添加成功',
      edit: '修改成功'
    }

    const url = urls[addDialog.type]
    const msg = msgs[addDialog.type]

    const id = addDialog.data?.id
    const locationName =
      bindingLocation.value.find((item) => item.value === formData?.location)?.label || ''

    const reqData = {
      pictureId: '',
      pictureName: '',
      distributionTitle: '', //布控标题
      distributionId: '', //布控ID
      sensingDeviceName: '', //感知设备名称
      sensingDeviceId: '', //感知设备ID
      monitoringEquipmentName: '', //监测设备名称
      monitoringEquipmentId: '', //监测设备主键ID
      streamingMediaAddress: '', //流媒体地址
      departmentName: '', //部门名称
      departmentId: '', //部门ID
      ...dialog.saveData.value,
      boxId: id,
      ipAddress: formData.ip, //IP地址
      subNetworkMask: formData.mask, //子网掩码
      defaultGateway: formData.gateway, //默认网关
      aiBoxName: formData.boxName, //AI盒子名称
      // @ts-ignore
      aiBoxId: formData.deviceId, //设备ID  (隐藏了)
      aiBoxCoding: formData.deviceCode, //设备编码
      bindingPosition: locationName, //绑定位置
      // @ts-ignore
      bindingPositionId: formData.location, //bindingPositionId (隐藏了)
      installationPosition: formData.installationPosition, //安装位置
      description: formData.description, //描述
      picturePath: JSON.stringify(formData.image),
      connectedness: dialog.saveData.value.connectedness || connectionTestingResult.value ? 1 : 0, //设备连通性(1正常,0不正常)
      version: formData.version,
      // @ts-ignore 页面上先隐藏，默认传1
      analyticalAbility: formData.ability
    }

    await request.postJson(url, reqData)

    ElMessage.success(msg)
    addDialog.visible = false
    main()
  } catch (error) {
    console.log(error)
  }
}

function onTitleClick(row: any) {
  dialogRef.value?.open('算法服务器详情', row)
}

function getTestingResult(result: boolean) {
  connectionTestingResult.value = result
}

function handleRefresh() {
  main()
}

function handleCounts() {
  fetchCounts('aibox', listPayload.value.tab).then((data) => {
    data && containerRef.value?.updateBoxItems(boxItems.value, data)
  })
}

function handleList() {
  tableData.loading = true
  fetchList<AiBoxRes>('aibox')
    .then((data) => {
      if (!data) return console.log('[AI盒子]没有数据！')
      tableData.total = data.raw.total
      tableData.list = data.list.map((item) => ({
        // id: item.aiBoxId,
        id: item.boxId,
        name: item.aiBoxName,
        deviceId: item.aiBoxId,
        addDate: item.addTime,
        location: item.bindingPosition,
        installationPosition: item.installationPosition,
        status: item.enable == 1, //是否启用（0禁用、1启用）
        connectedness: item.connectedness, // 服务器状态 1正常 0不正常
        deviceCode: item.aiBoxCoding,
        ability: item.analyticalAbility, // 1超温事件、2电弧闪烁
        version: item.version
      }))
    })
    .finally(() => {
      tableData.loading = false
    })
}

function main() {
  handleCounts()
  handleList()
}

watch(listPayload, main, { deep: true })

onMounted(() => {
  listPayload.value.box = 'total'
  listPayload.value.detectDeviceId = ''
  listPayload.value.treeNodeName = ''
  main()
})
</script>

<style lang="scss" scoped src="../styles.scss"></style>
