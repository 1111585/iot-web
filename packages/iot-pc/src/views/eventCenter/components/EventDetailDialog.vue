<template>
  <el-dialog
    class="detail-dialog"
    v-model="_visible"
    :title="title"
    width="1300px"
    append-to-body
    draggable
  >
    <el-scrollbar max-height="80vh" v-loading="is.detailLoading">
      <div class="content">
        <EventDetail v-if="data.id" :id="data.id" :data="data" :key="forceKey" />
      </div>
    </el-scrollbar>
    <template #footer>
      <div class="detail-dialog-footer">
        <el-skeleton :loading="is.detailLoading" animated>
          <template #template>
            <div class="footer-layout">
              <div class="left-buttons">
                <el-skeleton-item variant="button" style="width: 120px; margin-right: 10px" />
                <el-skeleton-item variant="button" style="width: 80px; margin-right: 10px" />
                <el-skeleton-item variant="button" style="width: 80px" />
              </div>
              <el-skeleton-item variant="button" style="width: 200px" />
              <div class="right-buttons">
                <el-skeleton-item variant="button" style="width: 80px; margin-right: 10px" />
                <el-skeleton-item variant="button" style="width: 80px" />
              </div>
            </div>
          </template>
          <template #default>
            <div class="left-buttons">
              <el-button @click="onStateChange('prev')">上一条</el-button>
              <el-button @click="onStateChange('next')">下一条</el-button>
            </div>
            <el-button style="width: 200px" type="primary" @click="handleEvent">处置</el-button>
            <div class="right-buttons">
              <el-button plain type="danger" @click="onDeleteClick">删除</el-button>
              <el-button plain type="primary" @click="onDownloadClick">下载</el-button>
            </div>
          </template>
        </el-skeleton>
      </div>
    </template>
    <EventHandleDialog
      v-if="handleDialog.visible"
      v-model:visible="handleDialog.visible"
      :title="handleDialog.title"
      :data="data"
      @refresh="handleRefresh"
    />
    <el-dialog
      v-model="videoDialog.visible"
      title="实时视频"
      fullscreen
      append-to-body
      destroy-on-close
    >
      <div class="p20">
        <div class="video-container">
          <h3 class="column-title">摄像头信息</h3>
          <section>
            <div>
              <span>被监测设备：</span>
              <span>{{ data.detectDevice }}</span>
            </div>
            <div>
              <span>感知设备：</span>
              <span>{{ data.senseDevice }}</span>
            </div>
            <div>
              <span>所属点位：</span>
              <span>{{ data.areaPoint }}</span>
            </div>
            <div>
              <span>预警时间：</span>
              <span>{{ data.date }}</span>
            </div>
          </section>
          <div class="no-video-stream" v-if="deviceList.length === 0">
            <NoVideoStream />
          </div>
          <el-row v-else :gutter="20">
            <el-col
              v-for="device in deviceList"
              :key="device.id"
              style="width: 100%; height: 100%; margin-bottom: 20px"
              :span="deviceList.length > 1 ? 12 : 24"
            >
              <xgPlayer :url="device.address" :id="device.domId" isLive autoPlay />
              <!-- <JessibucaPlayer :play-url="device.address" /> -->
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElNotification } from 'element-plus'

// import JessibucaPlayer from '@/components/media/JessibucaPlayer.vue'
import xgPlayer from '@/components/media/xgPlayer.vue'
import EventHandleDialog from './EventHandleDialog.vue'
import EventDetail from './EventDetail.vue'
import { NoVideoStream } from '@/components/renderer'
import { downloadBlod, generateEasyId, sleep } from '@/util'
import { useGet } from '@/composable/requestSup'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import type { EventData, StreamConfigRes } from '../types'

interface Props {
  visible: boolean
  data: EventData
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '预警查看'
})
const emits = defineEmits(['update:visible', 'refresh', 'stateChange'])

const is = reactive({
  videoDialogLoading: false,
  detailLoading: false
})

const _visible = computed({
  get() {
    return props.visible
  },
  set(val) {
    emits('update:visible', val)
  }
})

// 手动更新预警详情组件
const forceKey = ref(0)

/** 预警处理弹窗 */
const handleDialog = reactive({
  visible: false,
  title: '预警处理'
})
const videoDialog = reactive({
  visible: false,
  urls: {
    // 示例地址
    // light: 'http://192.168.1.34:8080/hdl/34020000001320000001/34020000001320000001.flv',
    // infrared: 'http://192.168.1.34:8080/hdl/34020000001320000001/34020000001320000002.flv'
    light: '',
    infrared: ''
  },
  url: '',
  videoType: 'light' as ARC.SenseType,
  open(type: ARC.SenseType = 'light') {
    videoDialog.videoType = type
    videoDialog.url = videoDialog.urls[type]
    videoDialog.visible = true
  }
})

const deviceList = ref<StreamConfigRes[]>([])
function watchRealTimeVideo() {
  is.videoDialogLoading = true
  request
    .get<any, StreamConfigRes[]>(deviceApi.getFlvStream, {
      name: props.data.senseDevice,
      id: props.data.senseDeviceId
    })
    .then((res) => {
      if (res.code !== 100) return console.log('获取实时视频地址失败')
      const devices = res.data
      deviceList.value = devices
        .filter((item) => item.address.startsWith('http'))
        .map((item) => ({
          ...item,
          domId: generateEasyId()
        }))
      videoDialog.open()
    })
    .finally(() => {
      is.videoDialogLoading = false
    })
}

// 处置
function handleEvent() {
  handleDialog.visible = true
}

function handleRefresh() {
  forceKey.value++
  // 处置成功后通知外层刷新列表
  emits('refresh')
}

function onDeleteClick() {
  useGet(deviceApi.deleteEvent, { warningId: props.data.id }, '删除', '是否要删除该预警').then(() =>
    emits('refresh')
  )
}

type State = 'prev' | 'next'
function onStateChange(state: State) {
  is.detailLoading = true
  emits('stateChange', { action: state })
  sleep(1500).then(() => (is.detailLoading = false))
}

async function onDownloadClick() {
  try {
    const id = props.data.id
    const baseUrl = request.getBaseUrl()

    const res = await fetch(baseUrl + `${deviceApi.download.event}?id=${id}`, {
      method: 'GET'
    })

    // 后端异常会被包装成 HTTP 200 的 JSON，避免把错误报文当成 zip 下载
    const contentType = res.headers.get('content-type') || ''
    if (!res.ok || contentType.includes('application/json') || contentType.includes('text/')) {
      let message = '下载失败'
      try {
        const text = await res.text()
        const json = JSON.parse(text)
        message = json?.msg || json?.message || json?.data?.msg || message
      } catch {
        // 忽略解析错误，使用默认提示
      }
      ElNotification({ title: '下载失败', message, type: 'error' })
      return
    }

    const date = new Date()
    const dateStr = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
    const fileName = `预警信息${dateStr}.zip`

    ElNotification({
      title: '通知',
      message: '开始下载 ' + fileName,
      type: 'info'
    })

    const blob = await res.blob()

    downloadBlod(blob, fileName)
  } catch (error) {
    console.log(error)
  }
}

watch(
  () => videoDialog.videoType,
  (val) => {
    videoDialog.url = videoDialog.urls[val]
  }
)

watch(
  () => props.data?.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      forceKey.value++
    }
  }
)

onMounted(() => {
  console.log('[预警详情]', props.data)
})
</script>

<style lang="scss" scoped>
.detail-dialog {
  overflow-x: hidden;
  &-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px 0px 20px;
    margin: 0 -20px;
    box-shadow: 0 -2px 8px rgba(90, 90, 90, 0.1);
    height: 60px; /* 固定高度 */

    .footer-layout {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 100%;
    }

    .left-buttons,
    .right-buttons {
      display: flex;
      align-items: center;
    }

    :deep(.el-skeleton__item) {
      margin-bottom: 0;
    }

    :deep(.el-skeleton) {
      width: 100%;
      height: 100%;

      .el-skeleton__item.el-skeleton__button {
        height: 32px; /* 与el-button默认高度一致 */
      }
    }
  }
}
.content {
  min-height: 80vh;
}

.video-container {
  width: 95vw;
  height: 70vh;

  .el-row {
    width: 100%;
    height: 100%;
  }

  section {
    margin-bottom: 14px;

    & > div {
      margin-bottom: 10px;
    }
  }
}

.video-dialog {
  width: 60vw;
  height: 70vh;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-55%);
}

.column-title {
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

.no-video-stream {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}
</style>
<style lang="scss">
.detail-dialog .el-dialog__footer {
  padding: 0px;
}
</style>
