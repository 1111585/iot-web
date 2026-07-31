<template>
  <div class="test-page">
    <!-- <section v-if="isDev">
      <TabChart type="temp" />
    </section> -->

    <!-- 直播流截图 Demo -->
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>直播流截图 Demo</span>
        </div>
      </template>

      <el-form :model="screenshotForm" label-width="120px" class="demo-form">
        <el-form-item label="直播流地址">
          <el-input v-model="screenshotForm.streamUrl" placeholder="输入直播流地址" clearable />
        </el-form-item>

        <el-form-item label="播放器类型">
          <el-select v-model="screenshotForm.playerType" placeholder="选择播放器">
            <el-option label="Jessibuca (默认)" value="jessibuca" />
            <el-option label="xgplayer" value="xgplayer" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleScreenshot" :loading="screenshotLoading">
            截图
          </el-button>
          <el-button @click="handleDownloadScreenshot" :disabled="!screenshotResult">
            下载截图
          </el-button>
          <el-button @click="handleCopyScreenshot" :disabled="!screenshotResult">
            复制 Base64
          </el-button>
        </el-form-item>

        <el-form-item v-if="screenshotError" label="错误信息">
          <el-alert :title="screenshotError" type="error" :closable="true" />
        </el-form-item>
      </el-form>

      <div v-if="screenshotResult" class="screenshot-preview">
        <p class="preview-title">截图预览：</p>
        <img :src="screenshotResult" alt="screenshot" class="preview-img" />
      </div>
    </el-card>

    <el-row class="content-row">
      <el-col class="col-item" :span="12" ref="drawerColRef">
        <PicDrawer
          class="pic-drawer"
          ref="drawRef"
          :key="forceKey"
          :stageWidth="drawerSize.width"
          :stageHeight="drawerSize.height"
          :strokeColor="drawConfig.strokeColor"
          :drawShapes="drawShapes"
          @change="onDrawingCoordsChanged"
        />
      </el-col>
      <el-col class="col-item" :span="12">
        <div
          class="compare-wrap"
          :style="{ width: drawerSize.width + 'px', height: drawerSize.height + 'px' }"
        >
          <img src="/images/login/login_bg.jpg" alt="bg" class="canvas-bg" />
          <canvas ref="canvasRef" class="canvas-render"></canvas>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import JessibucaPlayer from '@/components/media/JessibucaPlayer.vue'
import PlayerBar from '@/components/media/PlayerBar.vue'
// import DeviceStatus from './chart/components/dialog/DeviceStatus.vue'
import { captureFrameToDataURL } from '@/util/ffmpeg'
import { liveStreamScreenshot } from '@/components/media/tools'
import TabChart from './deviceManage/components/TabChart.vue'
import PicDrawer from '@/components/drawing/PicDrawer.vue'
import type { DrawShape } from '@/components/drawing/types'
import { convertShapeCoordinates } from '@/components/drawing/tools'

// 直播流截图 Demo 相关状态
const screenshotForm = reactive({
  streamUrl: 'http://192.168.1.33:8180/hdl/rtsp/101_2',
  playerType: 'jessibuca' as 'jessibuca' | 'xgplayer'
})
const screenshotLoading = ref(false)
const screenshotResult = ref<string | null>(null)
const screenshotError = ref<string | null>(null)

// 处理截图
async function handleScreenshot() {
  if (!screenshotForm.streamUrl) {
    ElMessage.warning('请输入直播流地址')
    return
  }

  screenshotLoading.value = true
  screenshotError.value = null
  screenshotResult.value = null

  try {
    const result = await liveStreamScreenshot(
      screenshotForm.streamUrl,
      screenshotForm.playerType,
      false
    )

    if (result) {
      screenshotResult.value = result
      ElMessage.success('截图成功')
    } else {
      screenshotError.value = '截图返回为空'
      ElMessage.error(screenshotError.value)
    }
  } catch (error: any) {
    const errorMsg = error?.message || '截图失败'
    screenshotError.value = errorMsg
    ElMessage.error(errorMsg)
  } finally {
    screenshotLoading.value = false
  }
}

// 下载截图
function handleDownloadScreenshot() {
  if (!screenshotResult.value) return

  const link = document.createElement('a')
  link.href = screenshotResult.value
  link.download = `screenshot_${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('下载成功')
}

// 复制 Base64
function handleCopyScreenshot() {
  if (!screenshotResult.value) return

  navigator.clipboard
    .writeText(screenshotResult.value)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

const forceKey = ref(0)
const vhToNumber = (vh: string) => {
  const h = document.documentElement.clientHeight
  return (Number(vh.slice(0, -2)) / 100) * h
}
const drawRef = ref<InstanceType<typeof PicDrawer> | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const drawerColRef = ref<HTMLElement | null>(null)
const drawerSize = reactive({ width: 600, height: 450 })
const sourceSize = reactive({ width: 600, height: 450 })
const drawConfig = reactive({
  strokeColor: '#ff6684'
})
const drawShapes = ref<DrawShape[]>([])

const onDrawingCoordsChanged = (v1, v2) => {
  drawShapes.value = v2
  renderCanvas()
}

function updateDrawerSize() {
  nextTick(() => {
    const stageSize = drawRef.value?.getStageSize?.()
    const rect = drawerColRef.value?.getBoundingClientRect()
    const width = stageSize?.width || rect?.width || drawerSize.width
    const height = stageSize?.height || rect?.height || drawerSize.height
    drawerSize.width = width
    drawerSize.height = height
    sourceSize.width = width
    sourceSize.height = height
    renderCanvas()
  })
}

watch(
  () => drawShapes.value,
  () => {
    renderCanvas()
  },
  { deep: true }
)

function renderCanvas() {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const stageSize = drawRef.value?.getStageSize?.()
  if (stageSize && stageSize.width && stageSize.height) {
    drawerSize.width = stageSize.width
    drawerSize.height = stageSize.height
    sourceSize.width = stageSize.width
    sourceSize.height = stageSize.height
  }

  // 使用测得的绘制区尺寸，保持两侧画布一致
  canvas.width = drawerSize.width
  canvas.height = drawerSize.height

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制每个形状
  drawShapes.value.forEach((shape) => {
    if (!shape.points || shape.points.length < 3) return

    const pts = shape.points
    ctx.beginPath()

    // 移动到第一个点
    ctx.moveTo(pts[0].x, pts[0].y)

    // 连接其余点
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y)
    }

    // 闭合路径
    ctx.closePath()

    // 设置样式
    ctx.strokeStyle = shape.config?.stroke || '#ff6684'
    ctx.lineWidth = 2
    ctx.stroke()

    // 设置填充颜色（半透明）
    ctx.fillStyle = 'rgba(255, 102, 132, 0.1)'
    ctx.fill()
  })
}

const tt = ref()
const deviceStatusVisible = ref(false)

const cp = ref('PlayerBar')
const mm = ref('media')

import(`@/components/${mm.value}/${cp.value}.vue`).then((module) => {
  console.log(module.default)
  tt.value = module.default
})

const isDev = import.meta.env.DEV

const jessibucaRef = ref<InstanceType<typeof JessibucaPlayer> | null>(null)

function onBarClick(btn: any) {
  if (btn.alias === 'play') {
    jessibucaRef.value?.togglePlay()
  } else if (btn.alias === 'fullscreen') {
  }
}

async function test() {
  const url = await liveStreamScreenshot(
    'http://192.168.1.34:8080/hdl/34020000001320000009/34020000001320000009'
  )
  console.log(url)
  // const url = await captureFrameToDataURL('http://47.97.123.179:9000/yjbucket/video_572751219_082249_67e5f7c89742c0bac32586ca3a97e912.mp4', 0)
  // const a = document.createElement('a')
  // a.href = url
  // a.download = 'captured_frame.jpg'
  // a.click()
  // URL.revokeObjectURL(url)
}
// URL.revokeObjectURL(url)

onMounted(() => {
  updateDrawerSize()
  window.addEventListener('resize', updateDrawerSize)
  // test()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDrawerSize)
})
</script>

<style lang="scss" scoped>
.test-page {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f5f5f5;
  gap: 20px;

  section {
    width: 100%;
  }
}

.demo-card {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.demo-form {
  margin-bottom: 20px;

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-input) {
    width: 100%;
  }

  :deep(.el-select) {
    width: 100%;
  }
}

.screenshot-preview {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;

  .preview-title {
    margin: 0 0 12px 0;
    font-weight: 600;
    color: #303133;
  }

  .preview-img {
    max-width: 100%;
    max-height: 400px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    display: block;
    margin: 0 auto;
  }
}

.content-row {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 20px;
}

.col-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  background-color: #ffffff;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 0;
}

.pic-drawer {
  width: 100%;
  height: 100%;
  border: 1px saddlebrown solid;
  background-image:
    linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px);
  background-size: 20px 20px;
}

.canvas-render {
  display: block;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: transparent;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(#f0f0f0 1px, transparent 1px),
    linear-gradient(90deg, #f0f0f0 1px, transparent 1px);
  background-size: 20px 20px;
}

.compare-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.canvas-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  z-index: 1;
}

.canvas-render {
  position: relative;
  z-index: 2;
}
</style>
