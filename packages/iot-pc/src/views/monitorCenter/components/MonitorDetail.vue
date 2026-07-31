<template>
  <div class="deploy-detail">
    <section>
      <h3>基本信息</h3>
      <el-row>
        <el-col :span="16">
          <div v-for="item in columns" class="column" :key="item.prop">
            <span>{{ item.label }}：</span>
            <span>{{ columnData[item.prop] }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <!-- <el-image
            style="width: 150px; height: 150px"
            fit="contain"
            :src="columnData.image[0]"
            :preview-src-list="columnData.image"
          >
            <template #error>
              <ImageError />
            </template>
          </el-image> -->
        </el-col>
      </el-row>
    </section>
    <section>
      <h3>感知设备</h3>
      <el-tag v-if="tabs.length === 0" type="info">暂无设备</el-tag>
      <el-tabs v-else v-model="activeTab" class="demo-tabs">
        <el-tab-pane v-for="item in tabs" :key="item.text" :label="item.text" :name="item.value">
          <div class="flex-box items-center">
            <span>监测区域：</span>
            <el-tag v-if="!is.showActiveTabArea" type="info">暂无监测区域</el-tag>
            <el-radio-group v-else v-model="activeTabArea" :disabled="is.areaEditable">
              <el-radio-button
                v-for="area in tabsArea"
                :key="area.monitoringArea"
                :value="area.monitoringArea"
                :label="area.monitoringArea"
                size="small"
              />
            </el-radio-group>
            <el-button-group v-if="is.showActiveTabArea" class="ml15" size="small">
              <el-button
                type="primary"
                plain
                :icon="EditPen"
                @mouseover="is.showAreaEditText = true"
                @mouseleave="is.showAreaEditText = false"
                @click="onEditAreaClick"
              >
                <transition name="fade">
                  <span v-if="is.showAreaEditText">修改区域</span>
                </transition>
              </el-button>
              <el-button
                type="danger"
                plain
                :icon="Delete"
                @mouseover="is.showAreaDelText = true"
                @mouseleave="is.showAreaDelText = false"
              >
                <transition name="fade">
                  <span v-if="is.showAreaDelText" @click="onDelAreaClick">删除区域</span>
                </transition>
              </el-button>
            </el-button-group>
          </div>
          <el-row v-if="is.showActiveTabArea" :gutter="24" class="flex-box">
            <!-- 左边数值 -->
            <el-col class="mt10" :span="16">
              <div
                :class="{
                  'editable-area': is.areaEditable,
                  'editable-area--hide': !is.areaEditable
                }"
              >
                <MonitorCount :columns="monitorCount" :editable="is.areaEditable">
                  <template #contrastArea="{ column }">
                    <div v-if="!is.areaEditable">
                      <el-tag v-if="contrastAreasTemp.length === 0" type="info">
                        暂无对比区域
                      </el-tag>
                      <div v-else>
                        <div v-for="item in contrastAreasTemp" :key="item.id" class="contrast-item">
                          <el-icon class="mr5"> <Link /> </el-icon>
                          <span> {{ item.name }}</span>
                          <span class="ml8">温差:{{ item.threshold }}°C</span>
                        </div>
                      </div>
                    </div>
                    <div v-else>
                      <div
                        v-for="area in contrastAreasTemp"
                        :key="area.id"
                        class="flex-box items-center"
                      >
                        <el-select v-model="area.id" class="mr5">
                          <el-option
                            v-for="item in tabsArea"
                            :key="item.monitoringAreaId"
                            :label="item.monitoringArea"
                            :value="+item.monitoringAreaId"
                          />
                        </el-select>
                        <el-input v-model="area.threshold">
                          <template #suffix>°C</template>
                        </el-input>
                      </div>
                    </div>
                  </template>
                </MonitorCount>
                <div></div>
                <div v-if="is.areaEditable" class="mt10">
                  <el-button plain type="primary" size="small" @click="onSaveAreaClick">
                    保存
                  </el-button>
                  <el-button size="small" @click="is.areaEditable = false"> 取消 </el-button>
                </div>
              </div>
            </el-col>
            <!-- 右边图片 -->
            <el-col :span="8">
              <el-image
                style="width: 150px; height: 150px"
                fit="contain"
                :src="monitorImageList[0]"
                :preview-src-list="monitorImageList"
              >
                <template #error>
                  <ImageError />
                </template>
              </el-image>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
      <!-- 盒子信息 -->
      <section>
        <h3>盒子信息</h3>
        <div class="column">
          <span>算法服务器：</span>
          <span>{{ columnData.aiBoxName }}</span>
        </div>
      </section>
      <section>
        <h3>添加人信息</h3>
        <div>
          <div class="column">
            <span>添加人：</span>
            <span>{{ columnData.addUserName }}</span>
          </div>
          <!-- <div class="column">
            <span>添加人联系方式：</span>
            <span>{{ columnData.addUserContact }}</span>
          </div> -->
          <div class="column">
            <span>添加时间：</span>
            <span>{{ formatDate(columnData.addTime, 'yyyy年MM月dd日 hh:mm') }}</span>
          </div>
        </div>
      </section>
      <!-- 告警列表 -->
      <section>
        <h3>告警信息</h3>
        <el-tag v-if="alertList.length === 0" type="info">暂无告警信息</el-tag>
        <AlertList v-else :list="alertList" />
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { forEach as _forEach } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { Delete, EditPen, Link } from '@element-plus/icons-vue'

import { ImageError } from '@/components/renderer'
import AlertList from './AlertList.vue'
import MonitorCount from './MonitorCount.vue'
import { SenseAblity } from '@/enums'
import { formatDate, getImageList } from '@/util'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import { useGet } from '@/composable/requestSup'
import { fetchDetail } from '../utils'
import type { AlertItem } from '../types'

interface Props {
  id: number
}

interface Tab {
  text: string
  value: string
}

const props = defineProps<Props>()

const columns = [
  {
    label: '布控标题',
    prop: 'title'
  },
  {
    label: '被监测设备',
    prop: 'name'
  },
  {
    label: '备注',
    prop: 'description'
  }
]

const columnData = ref({
  name: '',
  description: '',
  aiBoxName: '',
  addUserName: '',
  addUserContact: '',
  addTime: '',
  location: '',
  title: '', // 布控/监控标题
  image: [] as string[]
})
const monitorImageList = ref<string[]>([])

const is = reactive({
  loading: false,
  showActiveTabArea: false,
  showAreaDelText: false,
  showAreaEditText: false,
  areaEditable: false
})

/** el-tab */
const activeTab = ref()
const tabs = ref<Tab[]>([])
/** el-radio-group */
const activeTabArea = ref()
const tabsArea = ref<any[]>([])
/** activeTab 对应的多个区域，是一个map，以activeTab为key */
const areaMap = ref()

// 不同类型的感知设备，下面显示的内容有所不同
const monitorCount = ref([
  {
    text: '一级警报温度',
    value: '',
    unit: '°C',
    alias: 'warningTemp',
    isShow: true
  },
  {
    text: '二级警报温度',
    value: '',
    unit: '°C',
    alias: 'dangerTemp',
    isShow: true
  },
  {
    text: '置信度阈值',
    value: '30',
    unit: '',
    // alias: 'thresholdValue',
    alias: 'zxdfz',
    isShow: true
  },
  {
    text: '对比区域',
    value: '',
    unit: '',
    alias: 'contrastArea',
    isShow: true,
    isSlot: true
  },
  {
    text: '测温距离',
    value: '',
    unit: 'm',
    alias: 'distance',
    isShow: true,
    isSingle: true,
    isShowDivider: true
  },
  {
    text: '冷却时间',
    value: '',
    unit: 's',
    alias: 'cd',
    isShow: true,
    isSingle: true
  }
])

const alertList = ref<AlertItem[]>([])

/**
 * 编辑区域的临时数据, 点击保存时（onSaveAreaClick）连同修改的数值一起发送给接口
 * - 在 watch(activeTabArea 中赋值
 */
const editAreaTemp = ref({} as any)
const contrastAreasTemp = ref<any[]>([])

function onEditAreaClick() {
  is.areaEditable = true
}
function onDelAreaClick() {
  console.log('[监控详情]删除区域 TODO')
  const areaData = editAreaTemp.value
  useGet(
    deviceApi.deleteMonitorArea,
    { id: areaData.monitoringInformationId, areaNum: tabsArea.value.length },
    '删除',
    '确定要删除当前区域吗?'
  ).then(() => main())
}
async function onSaveAreaClick() {
  try {
    const reflection = {
      distance: 'distance',
      warningTemp: 'oneAlarmTemperature',
      dangerTemp: 'twoAlarmTemperature',
      cd: 'coolingTime',
      thresholdValue: 'thresholdValue',
      zxdfz: 'zxdfz',
      contrastArea: 'dets'
    }

    monitorCount.value.forEach((item) => {
      const targetKey = reflection[item.alias]
      if (targetKey) {
        const targetValue = editAreaTemp.value.targetKey
        editAreaTemp.value[targetKey] = item.value || targetValue
      }
    })
    const monitoringAreaId = editAreaTemp.value.monitoringAreaId
    const dets = getContrastAreas(editAreaTemp.value.dets).dets

    // 重新编辑 dets 字符串中的 compare 字段
    dets.detZones.forEach((item) => {
      if (item.id == monitoringAreaId) {
        item.compare = contrastAreasTemp.value.map((item) => ({
          id: item.id,
          threshold: item.threshold
        }))
      }
    })
    editAreaTemp.value.dets = JSON.stringify(dets)

    const { code } = await request.postJson(deviceApi.editMonitorArea, editAreaTemp.value)
    if (code !== 100) throw new Error('编辑区域失败')

    is.areaEditable = false
    ElMessage.success('保存成功')
    main()
  } catch (error) {
    onError(error)
  }
}

const onError = (error: any) => console.log('[监控详情]出错了', error)

watch(activeTab, () => {
  console.log('[监控详情]当前设备', activeTab.value)
  tabsArea.value = areaMap.value[activeTab.value]
  activeTabArea.value = tabsArea.value?.[0].monitoringArea
})

watch(activeTabArea, () => {
  _forEach(tabsArea.value, (item) => {
    if (item.monitoringArea === activeTabArea.value) {
      editAreaTemp.value = item
      contrastAreasTemp.value = getContrastAreas(item.dets).areas
      is.showActiveTabArea = true
      _forEach(monitorCount.value, (colItem) => {
        switch (colItem.alias) {
          case 'distance':
            colItem.value = item.distance
            colItem.isShow = item.deviceType === SenseAblity['红外']
            break
          case 'warningTemp':
            colItem.value = item.oneAlarmTemperature
            colItem.isShow = item.deviceType === SenseAblity['红外']
            break
          case 'dangerTemp':
            colItem.value = item.twoAlarmTemperature
            colItem.isShow = item.deviceType === SenseAblity['红外']
            break
          case 'cd':
            colItem.value = item.coolingTime
            // 两种情况都显示
            break
          case 'thresholdValue':
            colItem.value = item.zxdfz
            colItem.isShow = item.deviceType === SenseAblity['可见光']
            break
          case 'zxdfz':
            colItem.value = item.zxdfz
            colItem.isShow = item.deviceType === SenseAblity['可见光']
            break
          case 'contrastArea':
            colItem.value = item.dets
            break
        }
      })

      return false
    } else {
      is.showActiveTabArea = false
    }
  })
})

function handleDetail() {
  is.loading = true
  fetchDetail(props.id)
    .then((res) => {
      if (!res) return
      columnData.value = res?.baseInfo
      tabs.value = res?.tabs
      areaMap.value = res.areaMap
      alertList.value = res?.alertsList

      activeTab.value = tabs.value[0].value
      tabsArea.value = areaMap.value[activeTab.value]
      activeTabArea.value = tabsArea.value?.[0].monitoringArea

      // 当前被监测设备预览图
      columnData.value.image = res.baseInfo.image.map((item) => item.url)
      const images = res.allAreaList
        .filter((item) => item.picturePath)
        .map((item) => getImageList(item.picturePath))
      // 绘制过后的预览图。保存在每一个监控区域的 picturePath 中
      monitorImageList.value = images
        .filter((item) => item.length > 0)
        .flatMap((item) => item)
        .map((item) => item.url)
    })
    .finally(() => {
      is.loading = false
    })
}

function getContrastAreas(dets: string) {
  try {
    const detZones = JSON.parse(dets)?.detZones
    if (!detZones || detZones.length === 0) throw new Error('没有检测区域')
    const needs = detZones.find((item) => item.id == editAreaTemp.value.monitoringAreaId)
    if (!needs || !needs.compare) throw new Error('没有找到需要的检测区域')

    const getAreaName = (id: string) =>
      areaMap.value[activeTab.value]?.find((item) => item.monitoringAreaId == id)?.monitoringArea

    return {
      areas: needs.compare.map((item) => ({
        id: item.id,
        name: getAreaName(item.id),
        threshold: item.threshold
      })),
      dets: JSON.parse(dets)
    }
  } catch (error) {
    console.error(error)
    return { areas: [], dets: [] }
  }
}

function main() {
  handleDetail()
}

onMounted(() => {
  main()
})
</script>

<style lang="scss" scoped>
.deploy-detail {
  margin: 0 auto;

  .el-button--danger:hover {
    color: var(--el-color-danger);
  }
  .el-button--primary:hover {
    color: var(--el-color-primary);
  }

  section {
    padding: 20px 0;
    &:first-child {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
    h3 {
      position: relative;
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: bold;
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: -10px;
        transform: translateY(-60%);
        display: inline-block;
        width: 4px;
        height: 14px;
        margin-right: 10px;
        border-radius: 4px;
        background-color: var(--el-color-primary);
      }
    }
  }

  .column {
    padding: 8px 0;
    font-size: 14px;
    .unit {
      margin-left: 4px;
    }
  }
}

.list {
  list-style: none;

  &-item {
    font-size: 14px;
    padding: 14px 0;
    border-bottom: 1px solid #e5e5e5;
    &__left {
      flex: 2;
      margin-bottom: 10px;
    }
    &__right {
      flex: 1;
      text-align: right;
    }
    &__time {
      margin-left: 14px;
      color: var(--el-text-color-secondary);
    }
    &__desc {
      color: var(--el-text-color-secondary);
    }
  }
}

.contrast-item {
  display: inline-flex;
  align-items: center;
  margin-right: 5px;
  padding: 2px 5px;
  border-radius: 4px;
  box-shadow:
    5px 5px 5px #edf2ff inset,
    -5px -5px 5px #edf2ff inset;
}

/** 编辑监控区域 div的显隐过渡 */
.editable-area {
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-top: 10px;
  background-color: #f5f7fa;
  border-radius: 8px;
  transition: all 0.4s ease;
  & > div:last-child {
    margin-left: auto;
  }
}
.editable-area--hide {
  transition: all 0.4s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter,
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transition: all 0.4s ease-in-out;
  transform: translateX(-10px);
}
</style>
