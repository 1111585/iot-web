<template>
  <div class="video-frame-capture">
    <!-- 视频播放 -->
    <video
      ref="videoRef"
      class="video"
      :width="width"
      crossorigin="anonymous"
      preload="metadata"
      controls
      :autoplay="autoplay"
    >
      <source :src="src" type="video/mp4" />
      你的浏览器不支持 HTML5 的 video 标签。
    </video>
    <!-- 操作面板 -->
    <div class="controls">
      <label v-if="!auto"> <input type="radio" value="manual" v-model="mode" /> 手动截取 </label>
      <label v-if="!auto"> <input type="radio" value="auto" v-model="mode" /> 自动截取 </label>

      <!-- 自动模式下配置时间间隔 -->
      <div v-if="!auto && mode === 'auto'" class="interval-config">
        <label for="interval">时间间隔 (秒):</label>
        <input id="interval" type="number" v-model.number="interval" min="1" max="10" />
      </div>

      <!-- 手动模式下显示按钮 -->
      <div v-if="!auto">
        <button @click="startCapture" :disabled="isCapturing">开始截取</button>
        <button @click="stopCapture" :disabled="!isCapturing">停止截取</button>
      </div>
    </div>

    <!-- 截取结果 -->
    <div class="canvas-container" v-show="showPreview">
      <canvas ref="canvasRef" width="640" height="360"></canvas>
    </div>
    <!-- 已截取图片列表 -->
    <div class="image-list" v-if="capturedFrames.length && showList">
      <h3>已截取图片：</h3>
      <div class="image-item" v-for="(image, index) in capturedFrames" :key="index">
        <img :src="image" alt="Captured Frame" />
        <a :href="image" download="captured-frame.png">下载</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  auto?: boolean // 是否自动截取
  autoplay?: boolean // 是否自动播放
  interval?: number // 自动截取时间间隔
  width?: ARC.SN // 视频宽度
  height?: ARC.SN // 视频高度
  captureList?: string[]
  showPreview?: boolean
  showList?: boolean
  src: string // 视频源
}

const props = withDefaults(defineProps<Props>(), {
  width: 640,
  height: 360,
  interval: 3
})
const emits = defineEmits<{
  (e: 'update:captureList', value: string[]): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null) // 视频 DOM
const canvasRef = ref<HTMLCanvasElement | null>(null) // Canvas DOM
const ctx = ref<CanvasRenderingContext2D | null>(null) // Canvas 上下文

const mode = ref<'manual' | 'auto'>('manual') // 截取模式
const isCapturing = ref(false) // 是否正在截取
let timer: number | null = null // 定时器引用

const interval = ref<number>(props.auto && props.interval ? props.interval : 3) // 自动模式的时间间隔
const capturedFrames = ref<string[]>([]) // 已截取的图片数组

watch(
  () => capturedFrames.value.length,
  () => {
    emits('update:captureList', capturedFrames.value ?? [])
  }
)

// 手动或自动截取当前帧
const captureFrame = () => {
  if (!videoRef.value || !canvasRef.value) return

  if (!ctx.value) {
    ctx.value = canvasRef.value.getContext('2d')
  }

  // 将当前视频帧绘制到 Canvas
  ctx.value?.drawImage(videoRef.value, 0, 0, canvasRef.value.width, canvasRef.value.height)

  // 获取 Canvas 数据并存储为图片
  const imageData = canvasRef.value.toDataURL('image/png')
  capturedFrames.value.push(imageData) // 保存到图片数组
}

// 开始截取
const startCapture = () => {
  if (props.auto) return

  if (mode.value === 'manual') {
    captureFrame() // 手动模式，立即截取
  } else if (mode.value === 'auto') {
    isCapturing.value = true
    // @ts-ignore
    timer = setInterval(() => {
      captureFrame()
    }, interval.value * 1000) // 每隔指定时间截取
  }
}

// 停止截取
const stopCapture = () => {
  isCapturing.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 自动截取
const autoCapture = () => {
  if (!props.auto) return

  isCapturing.value = true
  // @ts-ignore
  timer = setInterval(() => {
    captureFrame()
  }, props.interval! * 1000)
}

// 在组件挂载时初始化自动模式
onMounted(() => {
  if (props.auto) {
    autoCapture()
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.video-frame-capture {
  .video {
    display: block;
    height: 200px;
    // margin: 0 auto;
    border: 1px solid #ccc;
    border-radius: 8px;
    object-fit: cover;
  }

  .controls {
    margin-top: 20px;
    text-align: center;

    label {
      margin-right: 10px;
    }

    .interval-config {
      margin-top: 10px;
      margin-bottom: 10px;
    }

    button {
      margin: 0 5px;
      padding: 8px 16px;
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:disabled {
        background-color: #ddd;
        cursor: not-allowed;
      }
    }
  }

  .canvas-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }

  canvas {
    border: 1px solid #ccc;
    border-radius: 8px;
  }

  .image-list {
    margin-top: 20px;

    h3 {
      text-align: center;
    }

    .image-item {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 10px 0;

      img {
        width: 160px;
        height: 90px;
        margin-right: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      a {
        color: #007bff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
