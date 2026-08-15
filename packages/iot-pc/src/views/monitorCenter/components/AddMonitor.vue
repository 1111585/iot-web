<template>
  <el-row :gutter="20">
    <el-col :span="10">
      <el-tabs
        v-model="editableTabsValue"
        type="border-card"
        editable
        class="minitor-tabs"
        @edit="handleTabsEdit"
      >
        <template #add-icon>
          <div class="add-area__btn">
            <el-icon>
              <Plus />
            </el-icon>
            <span>添加区域</span>
          </div>
        </template>
        <el-tab-pane
          v-for="item in editableTabs"
          :key="item.name"
          :label="item.title"
          :name="item.name"
        >
          <div class="mb20">
            <div class="flex-box items-center">
              <el-icon>
                <InfoFilled />
              </el-icon>
              <span class="ml5"> 在右边图片上圈选进行监控区域添加 </span>
            </div>
            <!-- <div class="mt10 ml20">点击上方修改监控区域名称</div> -->
            <div class="mt20 flex-box items-center">
              <div style="width: 110px; text-align: right" class="mr10">监控区域名称</div>
              <el-input
                style="width: 47%"
                v-model.trim="item.title"
                ref="areaNameRef"
                @blur="onAreaNameBlur(item.title)"
              >
                <template #append>
                  <el-color-picker
                    v-model="item.color"
                    size="small"
                    @change="(color) => onTabColorChanged(color!)"
                  />
                </template>
              </el-input>
            </div>
            <div class="mt10 flex-box items-center">
              <div style="width: 110px; text-align: right" class="mr10">区域类型</div>
              <el-radio-group v-model="item.type">
                <el-radio value="monitor">监控区域</el-radio>
                <el-radio value="shield">屏蔽区域</el-radio>
              </el-radio-group>
            </div>
          </div>
          <!-- <el-divider style="margin-top: 20px" /> -->
          <CustomForm
            v-if="item.type === 'monitor'"
            :form="item.formData"
            :form-fields="monitorAreaForm"
            :rules="monitorAreaFormRules"
            :isShowFooterBtn="false"
            label-width="120px"
          >
          </CustomForm>
        </el-tab-pane>
      </el-tabs>
      <div class="mt20 pl20">
        <el-form
          :model="monitorAreaFormAddon"
          :rules="monitorAreaFormAddonRules"
          ref="monitorAreaFormAddonRef"
          label-width="120px"
        >
          <el-form-item v-if="props.type === 'infrared'" label="测温距离" prop="distance">
            <el-input v-model="monitorAreaFormAddon.distance" style="width: 230px">
              <template #suffix>m</template>
            </el-input>
          </el-form-item>
          <el-form-item label="冷却时间" prop="cd">
            <el-input v-model="monitorAreaFormAddon.cd" style="width: 230px">
              <template #suffix>s</template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <!-- 对比配置 -->
      <!-- <el-divider style="margin-top: 10px" /> -->
      <div class="contrast-config" v-if="editableTabs.length > 0 && props.type !== 'light'">
        <div class="contrast-title flex-box items-center mb10">
          <el-icon>
            <InfoFilled />
          </el-icon>
          <span class="ml10">配置 跨区域温差预警</span>
        </div>
        <div class="contrast-area">
          <div v-for="(contrast, index) in getContrastAreas()" :key="index" class="mb10 pl20">
            <div class="flex-box items-center">
              <!-- 源区域显示 -->
              <div style="min-width: 90px">
                <span>源：</span>
                <el-tag
                  effect="plain"
                  type="info"
                  size="small"
                  :closable="getSourceAreaName(contrast.sourceArea) !== undefined"
                  @close="setSourceAreaToCurrentTab(contrast)"
                >
                  {{ getSourceAreaName(contrast.sourceArea) || '未选择' }}
                </el-tag>
              </div>
              <el-icon class="ml5 mr10">
                <Link />
              </el-icon>
              <!-- 目标区域选择 -->
              <!-- <span>目标：</span> -->
              <el-select
                style="width: 120px; min-width: 120px"
                v-model="contrast.targetArea"
                placeholder="请选择区域"
                clearable
                :disabled="contrast.sourceArea !== currentTabId"
              >
                <el-option
                  v-for="option in areaNameOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                  :disabled="option.value == contrast.sourceArea"
                ></el-option>
              </el-select>
              <el-input
                style="width: 120px; min-width: 120px; margin-left: 10px"
                v-model="contrast.value"
                type="number"
                :min="1"
                :max="99"
                data-type="number"
                placeholder="差异阈值"
              />
              <el-icon
                v-if="getContrastAreas().length > 1"
                style="margin-left: 10px; cursor: pointer"
                size="14"
                @click="removeContrastArea(index)"
                title="删除此对比区域"
                color="#ff6684"
              >
                <Delete />
              </el-icon>
              <el-icon
                v-if="index === getContrastAreas().length - 1"
                style="margin-left: 10px; cursor: pointer"
                size="16"
                @click="addContrastArea()"
                title="添加对比区域"
              >
                <Plus />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :span="14" v-loading="is.loading" element-loading-text="正在加载实时画面...">
      <div class="tools-bar">
        <div>
          <el-button style="padding-right: 0" size="small" icon="i-ep-brush">
            笔画颜色：
            <el-color-picker size="small" v-model="drawConfig.strokeColor" show-alpha />
          </el-button>
          <el-button size="small" icon="i-ep-download" @click="handleStateChange('exportAsImage')">
            导出图片
          </el-button>
        </div>
        <div>
          <el-dropdown size="small">
            <el-button size="small" icon="i-ep-menu"> </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item icon="i-ep-delete" @click="handleStateChange('clear')">
                  清除全部圈选
                </el-dropdown-item>
                <el-dropdown-item icon="i-ep-delete" @click="handleStateChange('clearCurrent')">
                  清除当前圈选
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div style="margin-left: auto; margin-right: 14px">
          <el-select v-model="playerType" size="small" style="width: 80px" placeholder="选择线路">
            <el-option label="线路一" value="jessibuca" />
            <el-option label="线路二" value="xgplayer" />
          </el-select>
        </div>
      </div>
      <PicDrawer
        ref="drawRef"
        :key="forceKey"
        :stageWidth="660"
        :stageHeight="vhToNumber('65vh')"
        :imgUrl="drawBgImg"
        :strokeColor="drawConfig.strokeColor"
        :drawShapes="drawShapes"
        @change="onDrawingCoordsChanged"
      />
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { Plus, InfoFilled, Delete, Link } from '@element-plus/icons-vue'
import type { TabPaneName } from 'element-plus'

import PicDrawer from '@/components/drawing/PicDrawer.vue'
import CustomForm from '@/components/form/CustomForm.vue'
import { liveStreamScreenshot, normalizeStreamUrl } from '@/components/media/tools'
import { generateEasyId, generateIntId } from '@/util'
import { monitorAreaForm, monitorAreaFormRules, monitorAreaFormKeys, fetchDetail } from '../utils'

import { FormInstance } from 'element-plus'
import type { DrawShape } from '@/components/drawing/types'
import type { TabData, MonitorAction, DeviceData, ContrastArea } from '../types'
import type { MonitoringInformation, CompareItem } from '@/views/deviceManage/types'

const props = defineProps<{
  data: DeviceData
  type: ARC.SenseType
  imgUrl?: string
}>()
const emits = defineEmits<{
  (e: 'submit', data: TabData[], contrastAreas: ContrastArea[], monitorAreaFormAddon: any): void
  (e: 'stateChange', action: MonitorAction): void
}>()

const forceKey = ref(0) // 数据的获取和处理会比绘制的渲染慢点，暂时定为数据回来后强制渲染
const is = reactive({
  loading: false
})

const playerType = ref<'jessibuca' | 'xgplayer'>('jessibuca')

const drawRef = ref<InstanceType<typeof PicDrawer> | null>(null)
const drawConfig = reactive({
  strokeColor: '#ff6684'
})
const drawShapes = ref<DrawShape[]>([])
const drawBgImg = ref(props.imgUrl)

// 监听播放器类型切换，触发截图
watch(playerType, async () => {
  const currentTab = editableTabs.value.find((tab) => tab.name === editableTabsValue.value)
  if (currentTab?.senseDevices?.address) {
    is.loading = true
    try {
      const normalizedAddress = normalizeStreamUrl(currentTab.senseDevices.address)
      const streamUrl = await liveStreamScreenshot(normalizedAddress, playerType.value, true)
      if (streamUrl) {
        drawBgImg.value = streamUrl
        forceKey.value++
      }
    } catch (error) {
      console.error('切换线路截图失败:', error)
      ElMessage.error('切换线路截图失败')
    } finally {
      is.loading = false
    }
  }
})

// 真实的表单字段，用来做表单校验
const defaultFormData = {
  config: props.type
  // contrastAreas: [{ area: '', value: '' }] // 如果数据需要放进表单，将值映射到这里
}
const formKeys = monitorAreaFormKeys.get(props.type)
if (formKeys) {
  const spKeys = ['zxdfz', 'cd']
  for (const key of formKeys) {
    if (spKeys.includes(key)) {
      defaultFormData['zxdfz'] = 0.5
      defaultFormData['cd'] = 10
    } else {
      defaultFormData[key] = ''
    }
  }
}

let tabIndex = 0
const getDefaultTitle = () => {
  return `区域${++tabIndex}`
}
const getDefaultTab = () => ({
  id: generateIntId(), // 使用时间戳作为唯一id
  type: 'monitor' as 'monitor' | 'shield',
  name: generateEasyId(), // 和 el-tab 绑定值对比的唯一标识
  title: getDefaultTitle(), // tab 标题
  stageSize: { width: 0, height: 0 }
})
const editableTabs = ref<TabData[]>([
  {
    ...getDefaultTab(),
    color: drawConfig.strokeColor,
    rectCoords: [] as ARC.RectCoords[],
    formData: { ...defaultFormData },
    shapes: {} as DrawShape,
    senseDevices: [] as any
  }
])
const editableTabsValue = ref(editableTabs.value[0].name)
watch(editableTabsValue, () => {
  setAreaNameFocus()
})

// tab区域对应对比区域的下拉选项
const areaNameOptions = computed(() => {
  return editableTabs.value.map((item) => ({
    value: item.id as number,
    label: item.title,
    name: item.name // 会用到和 editableTabsValue 对比
  }))
})

// 获取当前选中的标签页ID
const currentTabId = computed(() => {
  return editableTabs.value.find((tab) => tab.name === editableTabsValue.value)?.id
})

const areaNameRef = ref()
const setAreaNameFocus = () => {
  const currentIndex = editableTabs.value.findIndex((item) => item.name === editableTabsValue.value)
  requestAnimationFrame(() => {
    areaNameRef.value[currentIndex]?.focus()
  })
}
const onAreaNameBlur = (name: string) => {
  if (!name) return
  handleStateChange('checkAreaName', { name, senseDeviceId: props.data.senseDeviceId })
  // checkAreaName(name, props.data.senseDeviceId).then((res) => {
  //   // if (!res) setAreaNameFocus()
  //   // ...
  // })
}

/** 每次绘制闭合时处理绘制信息 */
const onDrawingCoordsChanged = (data: { x: number; y: number }[][], shapes: DrawShape[]) => {
  const stageSize = drawRef.value?.getStageSize?.()
  let currentTabIndex = 0
  const currentTab = editableTabs.value.find((item, index) => {
    if (item.name === editableTabsValue.value) {
      currentTabIndex = index
      return true
    }
    return false
  })
  if (currentTab) {
    currentTab.rectCoords = data[currentTabIndex]
    currentTab.shapes = shapes[currentTabIndex]
    if (stageSize?.width && stageSize?.height) {
      currentTab.stageSize = { width: stageSize.width, height: stageSize.height }
    } else {
      console.warn('[布控] 未能获取画布尺寸 stageSize，提交时将被阻止', stageSize)
      ElMessage.warning('未能获取画布尺寸，请关闭弹窗后重新打开')
    }
  }

  /**
   * TODO: ？？
   * - 一个tab能画多少个区域？如果可多个，是否应该只允许新增一个tab
   * - 一个tab只能画一个？那应该添加条件判断
   */

  // 在左边进行绘制之后，自动添加新的 tab
  if (data.length > editableTabs.value.length) {
    const newTabName = generateEasyId()
    const newTabTitle = getDefaultTitle()
    const newTabId = generateIntId() // 使用时间戳作为唯一id

    editableTabs.value.push({
      id: newTabId,
      title: newTabTitle,
      name: newTabName,
      type: 'monitor',
      color: drawConfig.strokeColor,
      rectCoords: data[data.length - 1],
      formData: {
        ...defaultFormData
      },
      shapes: shapes[data.length - 1],
      stageSize:
        stageSize?.width && stageSize?.height
          ? { width: stageSize.width, height: stageSize.height }
          : { width: 0, height: 0 }
    })
    editableTabsValue.value = newTabName
    ElNotification.success({
      message: `已新建区域"${newTabTitle}"`,
      showClose: false
    })
  }
}

const handleTabsEdit = async (targetName: TabPaneName | undefined, action: 'remove' | 'add') => {
  if (action === 'add') {
    const newTabName = generateEasyId()
    const newTabTitle = getDefaultTitle()
    const newTabId = generateIntId()
    editableTabs.value.push({
      id: newTabId,
      title: newTabTitle,
      name: newTabName,
      type: 'monitor',
      color: drawConfig.strokeColor,
      formData: {
        ...defaultFormData
      },
      shapes: {} as DrawShape,
      stageSize: { width: 0, height: 0 }
    })
    editableTabsValue.value = newTabName
  } else if (action === 'remove') {
    await ElMessageBox.confirm('确定移除当前监测区域?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO:应该改为 ID
    // 补丁：过去是取用了 激活 的tab，但是有可能删除的不是激活的tab
    // 将事件传过来的targetName设置为激活的tab
    editableTabsValue.value = (targetName as string) || ''

    const tabs = editableTabs.value
    let activeIndex = 0
    let activeName = editableTabsValue.value
    if (activeName === targetName) {
      tabs.forEach((tab, index) => {
        if (tab.name === targetName) {
          activeIndex = index
          const nextTab = tabs[index + 1] || tabs[index - 1]
          if (nextTab) {
            activeName = nextTab.name
          }
        }
      })
    }

    const tabId = editableTabs.value.find((tab) => tab.name === targetName)?.id
    const currentActiveTabId = editableTabs.value.find((tab) => tab.name === activeName)?.id

    contrastAreas.value.forEach((area) => {
      // 如果源区域是要删除的区域，将其设置为当前激活的tab
      if (area.sourceArea === tabId) {
        area.sourceArea = currentActiveTabId || ''
      }
      // 如果目标区域是要删除的区域，将其设置为空字符串
      if (area.targetArea === tabId) {
        area.targetArea = ''
      }
    })

    // 获取要删除的tab对应的形状id
    const tabToRemove = editableTabs.value.find((tab) => tab.name === targetName)

    editableTabsValue.value = activeName
    editableTabs.value = tabs.filter((tab) => tab.name !== targetName)

    // 使用索引删除形状（保留原有逻辑，但添加注释说明潜在问题）
    // 注意：这里使用索引删除形状可能存在问题，如果shapes数组和tabs数组顺序不一致
    // 更安全的做法是使用唯一标识符删除，但需要修改PicDrawer组件的removeShape方法
    drawRef.value?.removeShape(activeIndex)
  }
}

function handleStateChange(type: MonitorAction['type'], data?: ARC.AnyObj) {
  const payload = { ...data }

  switch (type) {
    case 'clear':
      ElMessageBox.confirm('此行为将清除所有绘制，是否继续?', '提示', {
        type: 'warning',
        draggable: true
      }).then(() => {
        drawRef.value?.clear()
        emits('stateChange', { type: type, payload: payload })
      })
      break
    case 'clearCurrent':
      ElMessageBox.confirm('此行为将清除当前绘制，是否继续?', '提示', {
        type: 'warning',
        draggable: true
      }).then(() => {
        const currentTabIndex = editableTabs.value.findIndex(
          (tab) => tab.name === editableTabsValue.value
        )
        drawRef?.value?.removeShape(currentTabIndex)
        emits('stateChange', { type: type, payload: payload })
      })
      break
    case 'exportAsImage':
      drawRef.value?.exportAsImage()
      emits('stateChange', { type: type, payload: payload })
      break
    case 'getImage':
      emits('stateChange', {
        type: type,
        payload: { ...payload, base64Str: drawRef.value?.getBase64String() }
      })
      break
    case 'checkAreaName':
      emits('stateChange', {
        type: 'checkAreaName',
        payload: {
          name: payload.name,
          senseDeviceId: payload.senseDeviceId
        }
      })
      break
  }
}

async function handleTabData() {
  try {
    is.loading = true
    const detail = await fetchDetail(props.data.id)
    const baseInfo = detail?.raw.deployAndControl
    const areaMap = detail?.areaMap
    const senseDevices =
      detail?.senseDevices.filter((item) => item.address.startsWith('http')) || []

    // 通过设备ID来获取对应设备
    // const senseDeviceId = props.type === 'infrared' ? baseInfo?.infraredEquipmentId : baseInfo?.visibleLightEquipmentId
    // const senseDeviceUsed = senseDevices.find(item => item.flagId === senseDeviceId)

    // 临时：根据名称来获取对应设备
    const nameFlag = props.type === 'infrared' ? '红外' : '可见'
    const senseDeviceUsed = senseDevices.find((item) => item.name.includes(nameFlag))

    editableTabs.value[0].senseDevices = senseDeviceUsed

    if (senseDeviceUsed?.address) {
      const normalizedAddress = normalizeStreamUrl(senseDeviceUsed.address)
      const streamUrl = await liveStreamScreenshot(normalizedAddress, playerType.value, true)
      drawBgImg.value = streamUrl || drawBgImg.value
      forceKey.value++
    }

    // 获取到红外或者可见光的id，从areaMap中提取绘制区域的数据
    const idNeeds =
      props.type === 'infrared' ? baseInfo?.infraredEquipmentId : baseInfo?.visibleLightEquipmentId
    if (!idNeeds) throw new Error('没有对应ID')

    const idNeedsAsArray = idNeeds?.split('、')
    const mapNeeds: MonitoringInformation[] = []
    if (areaMap && idNeedsAsArray) {
      idNeedsAsArray.forEach((id) => {
        if (areaMap[id]) {
          mapNeeds.push(areaMap[id])
        }
      })
    }

    if (mapNeeds.length === 0) throw new Error('没有对应的区域数据！')

    /**
     * 提取区域表单数据和绘制区域数据
     */
    editableTabs.value = mapNeeds.flat().map((item) => {
      const drawCfg = JSON.parse(item.drawCfg)
      // 从shapes中直接提取points属性作为rectCoords
      const rectCoords = drawCfg.points || []
      const stageSize = drawCfg.stageSize || { width: 0, height: 0 }
      return {
        id: drawCfg.id || item.monitoringAreaId, // 保留原有id，用于后续提交时保持一致性
        monitoringInformationId: item.monitoringInformationId,
        title: item.monitoringArea,
        name: generateEasyId(),
        type: JSON.parse(item.dets)?.detZones?.length !== 0 ? 'monitor' : 'shield',
        color: drawConfig.strokeColor,
        formData:
          props.type === 'infrared'
            ? {
                // distance: item.distance,
                firstLevel: item.oneAlarmTemperature,
                secondLevel: item.twoAlarmTemperature,
                // cd: item.coolingTime,
                config: props.type
              }
            : {
                thresholdValue: item.zxdfz, // ??
                zxdfz: item.zxdfz,
                // cd: item.coolingTime,
                config: props.type
              },
        rectCoords,
        shapes: drawCfg,
        senseDevices: senseDeviceUsed,
        stageSize
      }
    })

    /**
     * 提取区域对比数据
     * dets 是所有区域的 dets 数据，所以提取一个就行
     */
    const dets = mapNeeds.flat().map((item) => item.dets)[0]
    const detZones = JSON.parse(dets).detZones
    detZones.forEach((item) => {
      const sourceArea = item.id

      let compare = (item.compare as CompareItem[]) || []
      compare = compare.filter((item) => item.id !== '')

      if (compare.length !== 0) {
        compare.forEach((compareItem) => {
          contrastAreas.value.push({
            sourceArea,
            targetArea: compareItem.id,
            value: compareItem.threshold
          })
        })
      }
    })

    contrastAreas.value = contrastAreas.value.filter((item) => item.value !== '')
    // 如果没有数据，加上默认数据
    if (contrastAreas.value.length === 0) {
      contrastAreas.value.push({ sourceArea: currentTabId.value || '', targetArea: '', value: '' })
    }

    // 接口不返回此数据，所以需要从mapNeeds中提取（因为当前值已经改为：公共数据，而不是）
    // 第一层是感知设备（设计之初有多个感知设备），第二层是区域
    try {
      monitorAreaFormAddon.cd = mapNeeds[0][0]?.coolingTime
      monitorAreaFormAddon.distance = mapNeeds[0][0]?.distance
    } catch (error) {
      monitorAreaFormAddon.cd = ''
      monitorAreaFormAddon.distance = ''
    }

    if (editableTabs.value.length !== 0) {
      editableTabsValue.value = editableTabs.value[0].name
      drawShapes.value = editableTabs.value.map((item) => item.shapes)
      forceKey.value++
    }
  } catch (error: any) {
    console.log('[布控详情]', error?.message)
  } finally {
    is.loading = false
  }
}

const clear = () => {
  editableTabsValue.value = '1'
  editableTabs.value = [
    {
      ...getDefaultTab(),
      color: drawConfig.strokeColor,
      rectCoords: [] as ARC.RectCoords[],
      formData: { config: props.type },
      shapes: {} as DrawShape
    }
  ]
  monitorAreaFormAddon.distance = ''
  monitorAreaFormAddon.cd = ''
}

const submit = () => {
  handleStateChange('getImage')
  emits('submit', editableTabs.value, getContrastAreas(), monitorAreaFormAddon)
}

/**
 * 如果想要sourceArea也是变动值，去掉模版中的注释，并且将sourceArea的自动赋值去掉改用为模版绑定值
 */
const contrastAreas = ref<ContrastArea[]>([{ sourceArea: '', targetArea: '', value: '' }])

const monitorAreaFormAddonRef = ref<FormInstance>()
const monitorAreaFormAddon = reactive({ distance: '', cd: '' })
const monitorAreaFormAddonRules = reactive({
  distance: [{ required: true, message: '请输入测温距离', trigger: 'blur' }],
  cd: [{ required: true, message: '请输入冷却时间', trigger: 'blur' }]
})

watch(editableTabsValue, (newValue) => {
  const currentTabId = editableTabs.value.find((tab) => tab.name === newValue)?.id
  if (currentTabId) {
    contrastAreas.value.forEach((area) => {
      // 只有当sourceArea为空时才设置，确保一旦绑定后就不再改变
      if (!area.sourceArea) {
        area.sourceArea = currentTabId
      }
    })
  }
})

// TODO: 是否需要改成其他格式的数据
// 获取对比区域数据
const getContrastAreas = () => {
  return contrastAreas.value
}

// 根据ID获取源区域名称
const getSourceAreaName = (areaId: string | number) => {
  if (!areaId) return undefined
  const area = editableTabs.value.find((tab) => tab.id === areaId)
  return area ? area.title : '未知区域'
}

const addContrastArea = () => {
  // 获取当前标签页
  const currentTabId = editableTabs.value.find((tab) => tab.name === editableTabsValue.value)?.id
  if (!currentTabId) {
    return
  }

  if (editableTabs.value.length < 2) {
    ElMessage.warning({
      message: '需要至少两个区域才能进行对比',
      duration: 3000
    })
    return
  }

  // 检查是否有足够的区域组合可供选择
  if (editableTabs.value.length <= contrastAreas.value.length + 1) {
    ElMessage.warning({
      message: '没有更多的区域组合可供选择',
      duration: 3000
    })
    return
  }

  contrastAreas.value.push({
    sourceArea: currentTabId,
    targetArea: '',
    value: ''
  })
}

// 删除对比区域
const removeContrastArea = (index: number) => {
  contrastAreas.value.splice(index, 1)

  // 确保至少有一个对比区域
  if (contrastAreas.value.length === 0) {
    const currentTabId = editableTabs.value.find((tab) => tab.name === editableTabsValue.value)?.id
    contrastAreas.value.push({
      sourceArea: currentTabId || '',
      targetArea: '',
      value: ''
    })
  }
}

/**
 * 设置对比区域的源区域为当前选中的标签页
 */
const setSourceAreaToCurrentTab = async (contrast: ContrastArea) => {
  await ElMessageBox.confirm('确定将当前区域设置为对比源区域吗？', '提示', {
    type: 'warning'
  })
  const tabId = editableTabs.value.find((tab) => tab.name === editableTabsValue.value)?.id
  if (tabId !== undefined) {
    contrast.sourceArea = tabId
  } else {
    ElMessage.warning('请先选择一个区域标签页')
  }
}

const onTabColorChanged = (color: string) => {
  if (!color) return
  drawConfig.strokeColor = color
}

watch(
  () => drawConfig.strokeColor,
  () => {
    let currentTabIndex = 0
    let currentTab = editableTabs.value.find((item, index) => {
      if (item.name === editableTabsValue.value) {
        currentTabIndex = index
        return true
      }
      return false
    })

    if (currentTab) {
      currentTab.color = drawConfig.strokeColor
      drawRef.value?.setColor({ target: currentTabIndex, color: drawConfig.strokeColor })
    }
  }
)

// 让 canvas 的图片高度自适应 ？？？
const vhToNumber = (vh: string) => {
  const h = document.documentElement.clientHeight
  return (Number(vh.slice(0, -2)) / 100) * h
}

defineExpose({ clear, submit })

onMounted(() => {
  if (props.data.id) {
    handleTabData()
  }
  setAreaNameFocus()
})
</script>

<style lang="scss">
.minitor-tabs {
  .el-tabs__content {
    // height: 66vh;
    padding: 20px;
    padding-bottom: 0;

    .el-input {
      width: 230px;
    }
  }

  .el-tabs__header {
    padding-right: 10px;
    border: none;
    // 每一个 tab 的头部
    .el-tabs__item {
      // margin-right: 10px;
      // border-radius: 4px;
      // border: 1px solid #e4e7ed;
      // background-color: #f5f7fa;
      // color: #909399;
      // &.is-active {
      //   background-color: #ecf5ff;
      //   border-color: #d9ecff;
      //   color: #409eff;
      // }
    }
  }

  .el-tabs__new-tab {
    width: 80px !important;
  }

  .el-input {
    width: 100px;
  }

  .el-input__wrapper {
    // box-shadow: none;
  }

  .add-area__btn {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 100px;
  }
}

.tools-bar {
  display: flex;
}

.tools-bar .el-color-picker__trigger {
  border: none;
}

.tools-bar .el-button {
  margin-left: 0;
}

.color-block {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 2px;
}

.contrast-config {
  padding: 20px;
  padding-right: 10px;
}

.contrast-area {
  max-height: 15vh;
  overflow-y: scroll;
}
</style>
