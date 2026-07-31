<template>
  <el-container>
    <el-aside width="250px" style="margin-right: -10px">
      <AsideTree type="deploy" />
    </el-aside>
    <el-main>
      <BaseContainer
        ref="containerRef"
        title="AI布控设置"
        v-model:box="listPayload.box"
        v-model:tab="listPayload.tab"
        v-model:tag="listPayload.tag"
        :boxes="boxItems"
      >
        <!-- :tags="tagItems" -->
        <!-- <template #operation>
          <el-button type="primary" icon="i-ep-plus" @click="onAddBtnClick('1')"
            >电弧闪络</el-button
          >
          <el-button type="primary" icon="i-ep-plus" @click="onAddBtnClick('2')"
            >超温事件</el-button
          >
        </template> -->
        <TableHeadBar v-model:keyword="listPayload.keyword" :total="tableData.total" />
        <el-row v-loading="is.loading" :gutter="24" v-if="tableData.list.length !== 0">
          <el-col :span="8" v-for="item in tableData.list" :key="item.domId">
            <DeviceCard
              :data="item"
              :show-image="false"
              @click="onCardClick(item)"
              @clickDevice="(type) => onCardDeviceClick(type, item)"
              @stateChanged="onCardStateChanged"
            />
          </el-col>
        </el-row>
        <empty v-else />
        <!-- :title="formDialog.title" -->
        <FormDialog
          v-model="formDialog.visible"
          title="编辑布控信息"
          width="820px"
          height="400px"
          @on-close="onFormDialogClose"
        >
          <template #content>
            <CustomForm
              class="custom-form"
              ref="formRef"
              label-width="140px"
              :form="formData"
              :rules="formRules"
              :form-fields="formFields"
              :is-show-footer-btn="false"
              @submit="onFormSubmit"
            >
              <!-- <template #location>
            <el-select v-model="formData.location">
              <el-option
                v-for="item in options.points"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template> -->
              <template #detectDevice>
                <el-select v-model="formData.detectDevice">
                  <el-option
                    v-for="item in options.detect"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
              <template #senseDevice>
                <el-select v-model="formData.senseDevice" :loading="is.senseLoading">
                  <el-option
                    v-for="item in options.sense"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
              <template #infraredSensedDevice>
                <el-select v-model="formData.infraredSensedDevice" :loading="is.senseLoading">
                  <el-option
                    v-for="item in options.sense"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
              <template #aiBox>
                <el-select v-model="formData.aiBox">
                  <el-option
                    v-for="item in options.aiBoxes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </CustomForm>
          </template>
          <template #footer>
            <el-button @click="formDialog.visible = false"> 取消 </el-button>
            <el-button type="primary" @click="formRef?.confirm()"> 确认 </el-button>
          </template>
        </FormDialog>
        <FormDialog
          title="布控详情"
          v-model="detailDialog.visible"
          width="1000px"
          height="600px"
          :is-footer="false"
        >
          <template #content>
            <MonitorDetail :id="detailDialog.data.id" />
          </template>
        </FormDialog>
        <el-dialog
          width="1200px"
          v-model="monitorDialog.visible"
          :title="monitorDialog.title"
          draggable
          destroy-on-close
        >
          <AddMonitor
            ref="addMonitorRef"
            style="height: 70vh"
            :type="monitorDialog.type"
            :imgUrl="monitorUrl"
            :data="monitorDialog.data"
            @submit="onMonitorSubmit"
            @stateChange="onMonitorStateChange"
          />
          <template #footer>
            <div class="dialog-footer">
              <!-- <el-button type="danger" @click="monitorDialog.delete()">删除</el-button> -->
              <!-- 占位 -->
              <div></div>
              <!-- <el-button icon="i-ep-link">区域对比</el-button> -->
              <div>
                <el-button @click="monitorDialog.cancel()">取消</el-button>
                <el-button
                  type="primary"
                  :loading="monitorDialog.loading"
                  @click="monitorDialog.confrm()"
                >
                  确定
                </el-button>
              </div>
            </div>
          </template>
        </el-dialog>
      </BaseContainer>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import TableHeadBar from '@/components/form/TableHeadBar.vue'
import DeviceCard from '@/views/deviceManage/components/DeviceCard.vue'
import CustomForm from '@/components/form/CustomForm.vue'
import MonitorDetail from './components/MonitorDetail.vue'
import AddMonitor from './components/AddMonitor.vue'
import AsideTree from '@/views/deviceManage/components/AsideTree.vue'
import { useGet } from '@/composable/requestSup'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import { getImageList, toUrlSearchParam, base64ToFile, generateEasyId } from '@/util'
import { RetType } from '@/enums'
import {
  monitoreTags as tagItems,
  fetchList,
  fetchCounts,
  fetchOptions,
  fetchDeviceOptions,
  fetchDetail,
  fetchSenseDevicesByAiboxId,
  listPayload,
  monitorForm as formFields,
  monitorFormRules as formRules,
  checkAreaName
} from './utils'
import type { DeployDeviceRes, DeployDetail } from '../deviceManage/types'
import type { TabData, DeviceData, MonitorAction, ContrastArea } from './types'
import { sysApi } from '@/apis/sys'
import { toRelativeCoordinates } from '@/components/drawing/tools'

/**
 * 需求调整、多了许多多余的变量、方法。但是不要删除以后可能会改回来
 */

const isDev = import.meta.env.DEV

type CardState = 'edit' | 'delete'
type FormType = ARC.ExtractProps<typeof formFields>

// 当前 value 的值在 AsideTree.vue 中有使用到，修改时应该同步修改
const boxItems = ref([
  { name: '总布控', num: 0, type: 'info', value: 'total', unit: '个' },
  { name: '超温布控', num: 0, type: 'warning', value: 'cw_control', unit: '个' },
  { name: '闪络布控', num: 0, type: 'primary', value: 'sl_control', unit: '个' },
  { name: '未布控', num: 0, type: 'success', value: 'no_control', unit: '个' }
])

const is = reactive({
  loading: false,
  senseLoading: false
})

const formRef = ref<InstanceType<typeof CustomForm>>()
const containerRef = ref<InstanceType<typeof BaseContainer>>()
const addMonitorRef = ref<InstanceType<typeof AddMonitor>>()

const tableData = ref({
  list: [] as DeviceData[],
  total: 0
})
const formData: FormType & { config: ARC.SenseType } = reactive({
  location: '',
  detectDevice: '',
  senseDevice: '', // 可见光感知设备
  infraredSensedDevice: '', // 红外感知设备
  aiBox: '',
  title: '',
  description: '',
  config: '' as ARC.SenseType // 判断可见光表单还是红外表单
})
const formDialog = reactive({
  visible: false,
  title: '',
  type: '',
  // 编辑时获取详细信息，除了表单绑定外，其他不变的值原路返回给接口
  saveData: {} as DeployDetail
})

function emptyForm() {
  formRef.value?.resetFields()
  Object.keys(formData).forEach((key) => {
    formData[key] = ''
  })
}

type Options = 'points' | 'aiBoxes' | 'sense' | 'detect'
const options = reactive({
  points: [],
  aiBoxes: [],
  sense: [],
  detect: []
}) as Record<Options, ARC.Options[]>

/**
 * TODO:应该尽量使用一个弹窗，减少代码量
 */
const detailDialog = reactive({
  visible: false,
  title: '',
  data: {} as DeviceData
})

const monitorUrl = ref('')
const monitorBase64 = ref('')
const monitorDialog = reactive({
  visible: false,
  title: '',
  type: '' as ARC.SenseType,
  data: {} as any,
  fullscreen: false,
  loading: false,
  cancel() {
    monitorDialog.visible = false
    addMonitorRef.value?.clear()
  },
  confrm() {
    monitorDialog.loading = true
    addMonitorRef.value?.submit()
  },
  delete() {
    ElMessage.info('建设中')
  }
})

// 选中的卡片
const cardData = ref<DeviceData>()

function onCardClick(item: DeviceData) {
  console.log('[监控中心]点击卡片', item)
  if (item.isMonitoring === 0) {
    // 需求改了，重置option
    options.aiBoxes = [{ label: item.aiBoxName, value: item.aiBoxId }]
    options.sense = [{ label: item.senseDeviceName, value: item.senseDeviceId }]

    formData.aiBox = item.aiBoxId
    formData.senseDevice = item.senseDeviceName
    formData.infraredSensedDevice = item.senseDeviceId

    cardData.value = item
    // @ts-ignore
    onAddBtnClick(item.detectType.toString())

    return
  }
  detailDialog.data = item
  detailDialog.visible = true
}

function onCardDeviceClick(type: ARC.SenseType, item: DeviceData) {
  // if (item.id === '') {
  if (item.isMonitoring === 0) {
    ElMessage.info('请先点击卡片进行初始化')
    return
  }

  monitorDialog.type = type
  monitorDialog.title = '添加区域'
  monitorDialog.data = item
  // 圈选区域的时候使用。如果有多张，拿第一张
  const image = getImageList(item.image)[0]
  if (image) {
    monitorUrl.value = image.url
  }
  monitorDialog.visible = true
}

/**
 * @param type 1:可见光 2:红外
 */
function onAddBtnClick(type: '1' | '2') {
  switch (type) {
    case '1':
      formDialog.title = '电弧闪络'
      formData.config = 'light'
      break
    case '2':
      formDialog.title = '超温事件'
      formData.config = 'infrared'
      break
  }

  fetchOptions(type).then((res) => {
    if (!res) return
    const _options = res.options

    options.points = _options.points
    options.aiBoxes = _options.aiBoxes
    options.sense = _options.sense
    options.detect = _options.detect
  })

  formDialog.visible = true
}

function onSubmitError(msg: string, error?: Error) {
  ElMessage.warning(msg)
  monitorDialog.loading = false

  error && console.error(error)
}

async function onFormSubmit() {
  try {
    // const location = formData.location
    // const locationName = options.points.find((item) => item.value === location)?.label
    // const detectName = options.detect.find((item) => item.value === detect)?.label

    const detect = formData.detectDevice
    const sense = formData.senseDevice
    const senseOption = options.sense.find((item) => item.value === sense)

    // const infrared = formData.infraredSensedDevice
    // const infraredName = options.sense.find((item) => item.value === infrared)?.label
    const aiBox = formData.aiBox
    const aiBoxName = options.aiBoxes.find((item) => item.value === aiBox)?.label

    // 在 ‘未布控’ 点击卡片时，弹出添加弹窗（新需求，作为修改操作的主键id）
    const cardId = cardData.value?.id
    // 修改的时候传递
    const deployAndControlId = formDialog.saveData?.deployAndControl?.deployAndControlId || cardId
    const payload = {
      // visibleLightEquipmentName: senseOption?.label, //可见光设备名称
      // visibleLightEquipmentId: sense, //可见光设备ID
      // infraredEquipmentName: infraredName, //红外设备名称
      // infraredEquipmentId: infrared, //红外设备ID
      deployAndControlId,
      bindingPositionId: senseOption?.posiId, //选择位置ID (location 隐藏)
      bindingPosition: senseOption?.posiName, //选择位置名称 （locationName 隐藏）
      monitoringEquipmentName: detect, //监测设备名称
      monitoringEquipmentId: detect, //监测设备设备ID (detect 已变成手写，没ID绑定)
      visibleLightEquipmentName: cardData.value?.light, //可见光设备名称
      visibleLightEquipmentId: cardData.value?.lightId, //可见光设备ID
      visibleLightEquipmentZt: 1, //可见光设备连通状态 1正常 0异常
      infraredEquipmentName: cardData.value?.infrared, //红外设备名称
      infraredEquipmentId: cardData.value?.infraredId, //红外设备ID
      infraredEquipmentZt: 1, //红外设备连通状态 1正常 0异常
      aiBoxName: aiBoxName, //AI盒子名称
      aiBoxId: aiBox, //AI盒子ID
      remark: formData.description, //备注
      description: formData.description,
      title: formData.title, //标题
      warningType: formData.config === 'light' ? 1 : 2 //1
    }

    /**
     * 因为需求调整，已经没有了 新建 操作（保留以下代码, 如果有调整直接用）
     */
    const isEdit = Object.keys(formDialog.saveData).length > 0 || cardData.value?.id
    const reqUrl = isEdit ? deviceApi.updateMonitor : deviceApi.addMonitor

    const { code, data } = await request.postJson<any, number>(reqUrl, payload)
    if (code === 100) {
      cardData.value = { ...cardData.value!, id: cardId!, isMonitoring: 1 }
      onCardDeviceClick(formData.config, cardData.value)

      formRef.value?.resetFields()
      formDialog.visible = false
      ElMessage.success(isEdit ? '修改成功' : '添加成功')
      main()
    }
  } catch (error) {
    console.log('[监控中中心]', error)
  }
}

/** 获取到表单的值和圈选的坐标信息 */
function onMonitorSubmit(
  data: TabData[],
  contrastAreas: ContrastArea[],
  monitorAreaFormAddon: any
) {
  const formNotFill: TabData[] = []
  const rectCoordsNotFill: TabData[] = []

  data.forEach((item) => {
    const _item = item.formData
    delete _item.distance
    delete _item.cd
    // 有没有填表单
    if (!Object.keys(_item).every((key) => _item[key])) {
      formNotFill.push(item)
    }
    // 有没有圈选
    if (!item.rectCoords || item.rectCoords.length === 0) {
      rectCoordsNotFill.push(item)
    }
  })

  if (formNotFill.length > 0)
    return onSubmitError(`请完善 ${formNotFill.map((item) => item.title).join(',')} 的表单信息`)
  if (rectCoordsNotFill.length > 0)
    return onSubmitError(
      `请圈选 ${rectCoordsNotFill.map((item) => item.title).join(',')} 的监控区域`
    )

  handleMonitorSubmit(data, contrastAreas, monitorAreaFormAddon)
}

function onMonitorStateChange(action: MonitorAction) {
  switch (action.type) {
    case 'fullscreen':
      monitorDialog.fullscreen = !monitorDialog.fullscreen
      break
    case 'getImage':
      monitorBase64.value = action.payload?.base64Str
      break
    case 'checkAreaName':
      setTimeout(() => {
        // 关闭弹窗就不需要检查了
        if (!monitorDialog.visible) return
        const name = action.payload?.name
        const senseDeviceId = action.payload?.senseDeviceId
        checkAreaName(name, senseDeviceId)
      }, 500)
      break
  }
}

function onCardStateChanged(action: ARC.StateAction<CardState>) {
  const payload = action.payload as DeviceData
  switch (action.type) {
    case 'edit':
      cardData.value = payload
      handleDetail(payload)
      break
    case 'delete':
      handleDelete(payload)
      break
  }
}

function onFormDialogClose() {
  console.log('表单关闭')
  emptyForm()
}

function formateDrawerData(tabData: TabData[], contrastAreas?: ContrastArea[]) {
  // 格式化为接口需要的类型
  const mapping = (tab: TabData, index: number) => {
    const coords = tab.rectCoords // [{x: 0, y: 0}, {x: 1, y: 2} ]
    /**
     * 去重，点与点连接时生成的重复点 [[0, 0], [1, 2]]
     * 点位坐标用了四舍五入，并转换为相对坐标
     */
    const points = Array.from(
      new Set(
        coords?.map((item) => {
          // 先转换为相对坐标（绘制时默认指定了 600*400）
          const relativeCoord = toRelativeCoordinates(
            Math.round(item.x),
            Math.round(item.y),
            600,
            400
          )
          // 返回相对坐标的数组形式
          return JSON.stringify([relativeCoord.relativeX, relativeCoord.relativeY])
        })
      )
    ).map((item) => JSON.parse(item))

    // 使用原有id或monitoringInformationId，如果都不存在才使用索引
    const id = tab.id || tab.monitoringInformationId || index
    return {
      id,
      points: points,
      level1_temp: tab.formData.firstLevel,
      level2_temp: tab.formData.secondLevel
    }
  }

  const detZones = tabData.filter((item) => item.type === 'monitor').map(mapping)
  const maskZones = tabData.filter((item) => item.type === 'shield').map(mapping)

  // 处理对比区域，添加compare属性
  if (contrastAreas && contrastAreas.length > 0) {
    detZones.forEach((zone) => {
      // 查找匹配的sourceArea
      const matchingAreas = contrastAreas.filter(
        (area) => area.sourceArea.toString() === zone.id.toString()
      )

      // 如果找到匹配项，添加compare属性
      if (matchingAreas.length > 0) {
        // @ts-ignore
        zone.compare = matchingAreas
          .map((area) => ({
            id: area.targetArea,
            threshold: area.value
          }))
          .filter((item) => item.id)
      } else {
        // @ts-ignore
        zone.compare = []
      }
    })
  }

  return {
    detZones,
    maskZones
  }
}

function __formateDrawerData(tabData: TabData[]) {
  // 格式化为接口需要的类型
  const mapping = (tab: TabData, index: number) => {
    const coords = tab.rectCoords // [{x: 0, y: 0}, {x: 1, y: 2} ]
    /**
     * 去重，点与点连接时生成的重复点 [[0, 0], [1, 2]]
     * 点位坐标用了四舍五入
     */
    const points = Array.from(
      new Set(coords?.map((item) => JSON.stringify([Math.round(item.x), Math.round(item.y)])))
    ).map((item) => JSON.parse(item))

    return { id: index, points: points }
  }

  const detZones = tabData.filter((item) => item.type === 'monitor').map(mapping)
  const maskZones = tabData.filter((item) => item.type === 'shield').map(mapping)

  return {
    detZones,
    maskZones
  }
}

/** 上传绘制过后的图片 */
async function uploadDrawerImage(): Promise<ARC.ImageItem[] | string> {
  try {
    if (!monitorBase64.value) return ''
    const _bold = base64ToFile(monitorBase64.value)
    const fileName = 'arc_' + new Date().getTime() + '.png'
    const { data, code } = await request.uploadFile(_bold, fileName, sysApi.uploadFile)
    if (code !== RetType.SUCCESS) return ''
    const url = data.url

    // 按照约定，返回ImageItem数组便于后续操作
    return [
      {
        name: data.name || fileName,
        url: url,
        fid: '',
        size: ''
      }
    ]
  } catch (error) {
    console.log('[监控区域图片上传]失败', error)
    return ''
  }
}

async function handleMonitorSubmit(
  tabData: TabData[],
  contrastAreas: ContrastArea[],
  monitorAreaFormAddon: any
) {
  try {
    const _info = monitorDialog.data // 基础信息
    const type = monitorDialog.type
    const deviceType = {
      light: 1,
      infrared: 2
    }
    const equipmentName = {
      light: _info.light,
      infrared: _info.infrared
    }
    const equipmentId = {
      light: _info.lightId,
      infrared: _info.infraredId
    }

    const picture = await uploadDrawerImage()
    const info = {
      // warningType: _info.detectType, // 先不传
      warningId: '', // 先传空
      deployAndControlId: _info.id, // 布控主键
      equipmentName: equipmentName[type],
      equipmentId: equipmentId[type],
      deviceType: deviceType[type] || 3, // 可见光1, 红外2, 混合3
      picturePath: JSON.stringify(picture)
    }

    const { detZones, maskZones } = formateDrawerData(tabData, contrastAreas)

    /**
     * 圈选区域的信息，无值传 ''
     * drawCfg.id 对应 detZones 里头的id，detZones 是传给AI盒子的数据，到时AI盒子返回的区域id（zonesId）对应的温度将通过drawCfg的id找到对应的区域
     */
    const monitoringArea = tabData.map((tab, index) => {
      if (type === 'light') {
        return {
          ...info,
          monitoringAreaId: tab.id,
          monitoringInformationId: tab.monitoringInformationId || '',
          monitoringArea: tab.title,
          dets: JSON.stringify({
            detZones,
            maskZones
          }),
          drawCfg: JSON.stringify({ ...tab.shapes, id: tab.id }),
          // coolingTime: tab.formData.cd || '',
          coolingTime: monitorAreaFormAddon.cd || '',
          zxdfz: tab.formData.zxdfz || '',
          compare: JSON.stringify(
            contrastAreas
              .filter((item) => item.sourceArea === tab.id)
              .map((item) => ({ id: item.targetArea, threshold: item.value }))
          )
        }
      } else {
        return {
          ...info,
          monitoringAreaId: tab.id,
          monitoringArea: tab.title,
          monitoringInformationId: tab.monitoringInformationId || '',
          dets: JSON.stringify({
            detZones,
            maskZones
          }),
          drawCfg: JSON.stringify({ ...tab.shapes, id: tab.id }),
          // coolingTime: tab.formData.cd || '',
          // distance: tab.formData.distance || '',
          coolingTime: monitorAreaFormAddon.cd || '',
          distance: monitorAreaFormAddon.distance || '',
          oneAlarmTemperature: tab.formData.firstLevel || '',
          twoAlarmTemperature: tab.formData.secondLevel || '',
          compare: JSON.stringify(
            contrastAreas
              .filter((item) => item.sourceArea === tab.id)
              .map((item) => ({ id: item.targetArea, threshold: item.value }))
          )
        }
      }
    })

    /// 测试用
    // if (isDev) {
    //   console.group('[监控区域提交]')
    //   console.log('[原始数据]')
    //   console.log(tabData)
    //   console.log('[提交数据]')
    //   console.log(monitoringArea)
    //   console.log('[对比区域]')
    //   console.log(contrastAreas)
    //   console.groupEnd()
    //   return
    // }

    const { code } = await request.postJson(deviceApi.addMonitorInfrared, monitoringArea)
    // 区域存在，或者失败了由后端控制 ElMessage.danger 的显示文案
    if (code === RetType.FAIL) return

    await handleAreaPointSubmit(tabData, contrastAreas, monitorAreaFormAddon)

    monitorDialog.visible = false
    ElMessage.success('添加成功')
    main()
  } catch (error) {
    console.log('[监控中心]提交监控区域', error)
  } finally {
    monitorDialog.loading = false
  }
}

/**
 * 这条接口的数据会转发到AI盒子
 * 额外保存点位的接口，在保存区域信息的时候，dets中也保存了点位信息
 */
async function handleAreaPointSubmit(
  tabData: TabData[],
  contrastAreas: ContrastArea[],
  monitorAreaFormAddon: any
) {
  try {
    const { detZones, maskZones } = formateDrawerData(tabData, contrastAreas)
    const payload = {
      detZones, // 监测点
      maskZones // 屏蔽点
    }

    const baseInfo = monitorDialog.data
    const type = monitorDialog.type

    const params = {
      channel: 'ch1',
      deviceId: type === 'light' ? baseInfo.lightId : baseInfo.infraredId,
      deviceType: type === 'light' ? 1 : type === 'infrared' ? 2 : 3,
      coolingTime: monitorAreaFormAddon.cd || '',
      distance: monitorAreaFormAddon.distance || ''
    }
    const reqUrl = `${deviceApi.saveMonitorArea}?${toUrlSearchParam(params)}`

    await request.postJson(reqUrl, payload)
  } catch (error) {
    console.log('[监控中心]提交监控区域的点位', error)
  }
}

function handleList() {
  is.loading = true
  fetchList<DeployDeviceRes>('deploy')
    .then((res) => {
      if (!res) return
      tableData.value.total = res.raw.total
      tableData.value.list = res.list.map((item) => ({
        id: item.deployAndControlId,
        aiBoxId: item.aiBoxId,
        aiBoxName: item.aiBoxName,
        detectDevice: item.monitoringEquipmentName,
        detectType: item.warningType,
        areaPoint: item.bindingPosition,
        infrared: item.infraredEquipmentName,
        infraredStatus: item.infraredEquipmentZt,
        light: item.visibleLightEquipmentName,
        lightStatus: item.visibleLightEquipmentZt,
        image: item.picturePath,
        detectDeviceId: item.monitoringEquipmentId,
        areaPointId: item.bindingPositionId,
        infraredId: item.infraredEquipmentId,
        lightId: item.visibleLightEquipmentId,
        senseDeviceId: item.visibleLightEquipmentId || item.infraredEquipmentId,
        senseDeviceName: item.visibleLightEquipmentName || item.infraredEquipmentName,
        isMonitoring: item.controlOrNot,
        domId: generateEasyId()
      }))
    })
    .finally(() => {
      is.loading = false
    })
}

function handleCount() {
  fetchCounts('deploy', listPayload.value.tab).then((res) => {
    res && containerRef.value?.updateBoxItems(boxItems.value, res)
  })
}

function handleDetail(data: DeviceData) {
  fetchDetail(data.id).then((res) => {
    if (!res) return
    formDialog.saveData = res.raw
    const baseInfo = res.raw.deployAndControl

    // formData.location = baseInfo.bindingPositionId
    // formData.detectDevice = baseInfo.monitoringEquipmentId
    // formData.senseDevice = baseInfo.visibleLightEquipmentId
    // formData.infraredSensedDevice = baseInfo.infraredEquipmentId

    // @ts-ignore
    formData.location = ''
    formData.detectDevice = baseInfo.monitoringEquipmentName
    formData.senseDevice = baseInfo.visibleLightEquipmentName
    formData.infraredSensedDevice = baseInfo.infraredEquipmentName

    formData.aiBox = baseInfo.aiBoxId
    formData.title = baseInfo.title
    formData.description = baseInfo.description
    if (baseInfo.warningType === 1) {
      formData.config = 'light'
      formDialog.type = 'light'
      formDialog.title = '电弧闪络'
    } else if (baseInfo.warningType === 2) {
      formData.config = 'infrared'
      formDialog.type = 'infrared'
      formDialog.title = '红外闪络'
    }

    fetchOptions(baseInfo.warningType).then((res) => {
      if (!res) return
      const _options = res.options

      options.points = _options.points
      options.aiBoxes = _options.aiBoxes
      // options.sense = _options.sense
      options.detect = _options.detect
    })

    // dynamicOptions(afterDynamicOptions)

    formDialog.visible = true
  })
}

function handleDelete(data: DeviceData) {
  useGet(
    deviceApi.deleteMonitor,
    { deployAndControlId: data.id },
    '删除',
    '确定要删除当前配置吗?'
  ).then(() => main())
}

function dynamicOptions(cb?: () => void) {
  const id = formData.aiBox
  const type = formData.config === 'light' ? 1 : 2

  formData.senseDevice = ''
  formData.infraredSensedDevice = ''
  is.senseLoading = true
  fetchSenseDevicesByAiboxId(id, type)
    .then((res) => {
      if (!res) return
      options.sense = res.options
      cb && cb()
    })
    .finally(() => {
      is.senseLoading = false
    })
}

function afterDynamicOptions() {
  if (formData.config === 'light') {
    formData.senseDevice = formDialog.saveData?.deployAndControl?.visibleLightEquipmentId
  } else {
    formData.infraredSensedDevice = formDialog.saveData?.deployAndControl?.infraredEquipmentId
  }
}

function main() {
  handleList()
  handleCount()
}

watch(listPayload, main, { deep: true })
// watch(
//   () => formData.location,
//   (newId) => {
//     const id = newId as unknown as number
//     fetchDeviceOptions(id).then((res) => {
//       if (!res) return
//       options.detect = res.options
//     })
//   }
// )
watch(
  () => formDialog.visible,
  (flag) => {
    if (!flag) formRef.value?.resetFields()
  }
)

// 感知设备根据AI盒子变化动态变化
// watch(
//   () => formData.aiBox,
//   () => {
//     dynamicOptions()
//   }
// )

onMounted(() => {
  listPayload.value.box = 'no_control'
  listPayload.value.treeNodeLevel = '' as unknown as number
  listPayload.value.deviceId = ''
  main()
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixin.scss';

.custom-form {
  padding: 20px;
  @include mixin.selector-full-width();
}

.dialog-footer {
  display: flex;
  // justify-content: center;
  justify-content: flex-end;

  & > .el-button {
    margin-right: auto;
  }
}
</style>
