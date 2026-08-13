<template>
  <div class="arc-detail">
    <el-row :gutter="24">
      <el-col :span="16">
        <!-- CT 告警：电流趋势图 -->
        <el-card v-if="isCTLevel" class="preview-card">
          <template #header>
            <div class="card-header"><span class="card-title">告警曲线</span></div>
          </template>
          <AlarmChart v-if="ctInfo.deviceId"
            :device-id="ctInfo.deviceId"
            :warning-id="props.data.id as number"
            :threshold="ctInfo.threshold"
            :trigger-time="ctInfo.triggerTime"
            :trigger-phase="ctInfo.phase" />
        </el-card>
        <!-- 弧温告警：媒体预览 -->
        <el-card v-else class="preview-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">媒体预览</span>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col class="mb20" :span="12">
              <VideoFrameCapture
                v-if="previewFrame.one.url"
                v-model:capture-list="mediaCapture.mediaList"
                :src="previewFrame.one.url"
                :auto="mediaCapture.enable"
                :interval="2"
                autoplay
                width="320"
                height="240"
              />
            </el-col>
            <el-col :span="12">
              <!-- :preview-src-list="[previewFrame.two.url]" -->
              <!-- @click="picDrawDialog.draw(previewFrame.two.url)" -->
              <el-image
                ref="tourRefOne"
                :src="previewFrame.two.url"
                fit="cover"
                class="media-image"
                style="cursor: pointer"
                :preview-src-list="[previewFrame.two.url]"
              />
            </el-col>
            <!-- 隐藏了 -->
            <!-- <el-col :span="12">
              <el-image
                :src="previewFrame.three.url"
                :preview-src-list="[previewFrame.three.url]"
                v-loading="previewFrame.three.loading"
                fit="cover"
                class="media-image"
              />
            </el-col>
            <el-col :span="12">
              <el-image
                v-loading="previewFrame.four.loading"
                :src="previewFrame.four.url"
                :preview-src-list="[previewFrame.four.url]"
                fit="cover"
                class="media-image"
              />
            </el-col> -->
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="8">
        <div class="right-panel">
        <!-- CT 告警专用信息 -->
        <el-card v-if="isCTLevel" class="info-card">
          <div class="info-header">
            <div class="info-title">
              <span class="label">事件类型：</span><span class="value">{{ info.eventType }}</span>
            </div>
            <div class="info-status">
              <el-tag :type="info.status === '已处理' ? 'success' : 'warning'">{{ info.status }}</el-tag>
            </div>
          </div>
          <div class="info-content">
            <div class="info-item"><span class="label">设备名称：</span><span class="value">{{ ctInfo.deviceName }}</span></div>
            <div class="info-item"><span class="label">设备地址：</span><span class="value">{{ ctInfo.ip }}</span></div>
            <div class="info-item"><span class="label">触发相位：</span><span class="value" style="font-weight:600">{{ ctInfo.phase }}相</span></div>
            <div class="info-item"><span class="label">触发电流：</span><span class="value" style="color:#fe3246;font-weight:600">{{ ctInfo.value }}A</span></div>
            <div class="info-item"><span class="label">告警阈值：</span><span class="value">{{ ctInfo.threshold }}A</span></div>
          </div>
        </el-card>
        <!-- 弧温告警专用信息 -->
        <el-card v-else class="info-card">
          <div class="info-header">
            <div class="info-title">
              <span class="label">事件类型：</span>
              <span class="value">{{ info.eventType }}</span>
            </div>
            <div class="info-status">
              <el-tag :type="info.status === '已处理' ? 'success' : 'warning'">
                {{ info.status }}
              </el-tag>
            </div>
          </div>
          <div class="info-content">
            <!-- <div class="info-item">
              <span class="label">监测设备：</span>
              <span class="value link" @click="onDeviceClick('detect')">
                {{ info.monitorDevice }}
              </span>
            </div> -->
            <div class="info-item">
              <span class="label">感知设备：</span>
              <span class="value link" @click="onDeviceClick('sense')">
                {{ info.sensorDevice }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">所属点位：</span>
              <span style="line-height: 1.5em" class="value">{{ info.location }}</span>
            </div>
            <div class="info-item">
              <span class="label">算法服务器：</span>
              <span class="value link" @click="onDeviceClick('aibox')">{{ info.aiBox }}</span>
            </div>
          </div>
        </el-card>
        <!-- 处理流程时间线 -->
        <el-card class="timeline-card">
          <template #header>
            <div class="card-header">
              <span>处理流程</span>
            </div>
          </template>
          <empty v-if="activities.length === 0" />
          <el-timeline v-else class="timeline">
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :type="activity.type"
              :size="activity.size"
            >
              <!-- :timestamp="activity.timestamp" -->
              <div class="timeline-content">
                <div class="flex-box items-center">
                  <h4 :class="activity.type">
                    {{ activity.title }}
                  </h4>
                  <div style="margin-left: auto">
                    <el-popover
                      :width="300"
                      popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
                    >
                      <template #reference>
                        <span class="mr20 link timeline-user">{{ activity.user }}</span>
                      </template>
                      <template #default>
                        <Columns :columns="pickActivitiesColumn(activity)" />
                      </template>
                    </el-popover>
                    <span style="color: var(--el-color-info)">{{ activity.timestamp }}</span>
                  </div>
                </div>
                <p>{{ activity.content }}</p>
                <el-image
                  v-if="activity.image"
                  :src="activity.image"
                  :preview-src-list="[activity.image]"
                  fit="cover"
                  class="timeline-image"
                />
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
        </div>
      </el-col>
    </el-row>
    <FormDialog
      v-model="deviceDialog.visible"
      :title="deviceDialog.title"
      :isFooter="false"
      width="1000px"
      height="80vh"
    >
      <template #content>
        <DeviceDetail
          :id="deviceDialog.id"
          :page="deviceDialog.type"
          :data="{ deviceId: deviceDialog.id }"
        />
      </template>
    </FormDialog>
    <el-dialog v-model="picDrawDialog.visible" title="查看监控区域">
      <div style="padding: 20px">
        <PicDrawer
          :img-url="picDrawDialog.url"
          action="view"
          :draw-shapes="shapes"
          :stage-width="stageSize.width || undefined"
          :stage-height="stageSize.height || undefined"
        />
      </div>
    </el-dialog>
    <el-tour v-model="isShow.tour" @close="onTourClose">
      <el-tour-step :target="tourRefOne?.$el" title="查看监控区域">
        <div>点击此查看监控区域</div>
        <el-checkbox class="mt10 ml10" v-model="dontShowThisTime" size="small" label="不再提示" />
      </el-tour-step>
    </el-tour>
  </div>
</template>

<script setup lang="ts">
import DeviceDetail from '@/views/deviceManage/detail/DeviceDetail.vue'
import VideoFrameCapture from '@/components/media/VideoFrameCapture.vue'
import PicDrawer from '@/components/drawing/PicDrawer.vue'
import IotChart from '@/views/monitorData/components/IotChart.vue'
import AlarmChart from './AlarmChart.vue'
import { useConfigStore } from '@/store/config'
import { Columns } from '@/components/renderer'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import { fetchEventDetail } from '../utils'
// import { _shapes } from '@/views/monitorCenter/utils'
import type { DrawShape } from '@/components/drawing/types'
import type { TimelineActivity, EventData } from '../types'

interface Props {
  id: number | string
  data: EventData
}

const props = defineProps<Props>()
const configStore = useConfigStore()

// CT 告警 levelType === 4
const isCTLevel = computed(() => props.data?.typeRaw === 4)

// 解析 warningContent JSON，提取 CT 告警字段
const ctInfo = computed(() => {
  try {
    const content = info.value.warningContent
    if (!content) return {}
    const raw = typeof content === 'string' ? JSON.parse(content) : content
    return {
      phase: raw.phase || '-',
      value: raw.value != null ? Number(raw.value).toFixed(2) : '-',
      threshold: raw.threshold ?? '-',
      deviceId: raw.deviceId || '',
      deviceName: raw.deviceName || '-',
      ip: raw.ip || '-',
      triggerTime: raw.triggerTime || 0
    }
  } catch {
    return { phase: '-', value: '-', threshold: '-', deviceId: '', deviceName: '-', ip: '-', triggerTime: 0 }
  }
})

const isShow = reactive({
  tour: false
})

// 指引配置
const tourRefOne = ref()
const dontShowThisTime = ref(false)
function onTourClose() {
  if (dontShowThisTime.value) {
    configStore.setElTourConfig('sense', false)
  }
}

const shapes = ref<DrawShape[]>([])
const stageSize = ref<{ width: number; height: number }>({ width: 0, height: 0 })

// 基本信息
const info = ref({
  aiBoxId: '',
  sensorDeviceId: '',
  monitorDeviceId: '',
  // 渲染需要
  eventType: '',
  status: '',
  location: '',
  duration: '',
  aiBox: '',
  monitorDevice: '',
  sensorDevice: '',
  videoUrl: '',
  pictureUrl: '',
  warningTime: '',
  warningContent: ''
})
// 左边的预览媒体
const previewFrame = ref({
  one: {
    url: '',
    name: '视频1',
    type: 'video',
    loading: true
  },
  two: {
    url: '',
    name: '图片1',
    type: 'image',
    loading: true
  },
  three: {
    url: '',
    name: '图片2',
    type: 'video',
    loading: true
  },
  four: {
    url: '',
    name: '图片4',
    type: 'image',
    loading: true
  }
})
// 处理流程时间线数据
const activities = ref<TimelineActivity[]>([])

const dialogTitles = {
  aibox: '算法服务器详情',
  detect: '监测设备详情',
  sense: '设备详情'
}

const deviceDialog = reactive({
  visible: false,
  title: '',
  type: '' as ARC.MonitorDeviceType,
  id: ''
})

const picDrawDialog = reactive({
  visible: false,
  url: '',
  draw(url: string) {
    this.url = url
    this.visible = true
  }
})

const mediaCapture = reactive({
  enable: true,
  mediaList: [] as string[]
})

watch(
  () => mediaCapture.mediaList.length,
  (l) => {
    if (l > 10) {
      previewFrame.value.three.url = mediaCapture.mediaList[l - 2]
      previewFrame.value.four.url = mediaCapture.mediaList[l - 1]
    }
  }
)

const activitiesColumns = [
  { label: '被监测设备', prop: 'equipmentName', value: '', unit: '' }
  // { label: '一级报警温度', prop: 'oneAlarmTemperature', value: '', unit: '°C' },
  // { label: '二级报警温度', prop: 'twoAlarmTemperature', value: '', unit: '°C' },
  // { label: '处理人', prop: 'addUser', value: '', unit: '' }
]
function pickActivitiesColumn(item: TimelineActivity) {
  activitiesColumns.forEach((column) => {
    column.value = item[column.prop] + ' ' + column.unit
  })

  return activitiesColumns
}

function onDeviceClick(type: ARC.MonitorDeviceType) {
  switch (type) {
    case 'aibox':
      deviceDialog.id = info.value.aiBoxId
      break
    case 'detect':
      deviceDialog.id = info.value.monitorDeviceId
      break
    case 'sense':
      deviceDialog.id = info.value.sensorDeviceId
      break
  }

  deviceDialog.title = dialogTitles[type]
  deviceDialog.type = type
  deviceDialog.visible = true
}

function initData() {
  const payload = {
    warningInformationId: props.data.id, //预警主键ID
    id: props.data.id, //预警主键ID
    equipmentName: props.data.senseDevice,
    equipmentId: props.data.senseDeviceId,
    levelType: props.data.typeRaw,
    deployControlId: props.data.deployControlId,
    picturePath: '' //图片ID，json格式
  }

  return request.get(deviceApi.initEventDetail, payload)
}

onMounted(async () => {
  await initData()
  fetchEventDetail(props.id).then((res) => {
    if (!res) return
    info.value = res.baseInfo
    activities.value = res.activities

    previewFrame.value.one.url = info.value.videoUrl
    previewFrame.value.two.url = info.value.pictureUrl
    previewFrame.value.one.loading = false
    previewFrame.value.two.loading = false

    shapes.value = res?.shapes || []
    const firstShape: any = Array.isArray(shapes.value) ? shapes.value[0] : null
    if (firstShape?.stageSize?.width && firstShape?.stageSize?.height) {
      stageSize.value = {
        width: firstShape.stageSize.width,
        height: firstShape.stageSize.height
      }
    }

    setTimeout(() => {
      const range = mediaCapture.mediaList.length
      previewFrame.value.three.url = mediaCapture.mediaList[0]
      previewFrame.value.four.url = mediaCapture.mediaList[range - 1]
      previewFrame.value.three.loading = false
      previewFrame.value.four.loading = false

      // TODO 暂时隐藏
      // isShow.tour = true
    }, 3000)
  })
})
</script>

<style scoped lang="scss">
$card-width: 250px;
.arc-detail {
  padding: 10px;
  // height: 100vh;

  .preview-card {
    min-height: 77vh;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 16px;
        font-weight: bold;
      }
    }
    .media-image {
      width: 320px;
      height: 240px;
      border-radius: 8px;
    }
    .media-video {
      width: $card-width;
      height: 200px;
    }
  }

  .right-panel {
    display: flex;
    flex-direction: column;
    height: 100%;

    .info-card {
      flex-shrink: 0;
      margin-bottom: 20px;
    }

    .timeline-card {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
  }

  .info-card {
    margin-bottom: 20px;

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .info-title {
        font-size: 16px;
        font-weight: bold;
      }
    }

    .info-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;

      .info-item {
        font-size: 14px;
        .label {
          margin-right: 8px;
          color: #666;
        }

        .value {
          font-weight: 500;
          color: #333;
        }
        .link {
          color: var(--el-color-primary) !important;
        }
      }
    }
  }

  .timeline-card {
    .card-header {
      font-weight: bold;
    }

    .timeline {
      // height: 60vh;
      padding: 10px;
      overflow-y: scroll;

      &-user {
        cursor: help;
      }

      &-image {
        width: 200px;
        height: 120px;
        border-radius: 4px;
        cursor: pointer;
      }
    }

    .timeline-content {
      h4 {
        margin: 0 0 8px;
        font-size: 16px;
      }

      p {
        margin: 0 0 12px;
        color: #666;
      }
    }
  }
}
</style>
