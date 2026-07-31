<template>
  <div class="pen-tool">
    <v-stage
      :config="stageConfig"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    >
      <v-layer>
        <v-image :config="imageConfig" />
        <v-line
          :config="{
            points: flatPoints,
            stroke: 'red',
            strokeWidth: 2,
            lineJoin: 'round',
            closed: isClosed,
            tension: 0
          }"
        />
        <v-circle
          v-for="(point, index) in points"
          :key="index"
          :config="{
            x: point.x,
            y: point.y,
            radius: 4,
            fill: 'blue'
          }"
        />
      </v-layer>
    </v-stage>

    <div v-if="isShowControls" class="controls">
      <el-button size="small" @click="finishDrawing" :disabled="!points.length">完成</el-button>
      <el-button size="small" @click="clearDrawing">清除</el-button>
    </div>

    <div v-if="exportedPoints.length > 0 && isShowOutput" class="output">
      <h3>圈选框点位：</h3>
      <pre>{{ exportedPoints }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  imgUrl?: string
  stageWidth?: number
  stageHeight?: number
  isShowControls?: boolean
  isShowOutput?: boolean
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  imgUrl: '',
  stageWidth: 600,
  stageHeight: 400,
  stageBorder: false
})
const emits = defineEmits<{
  (e: 'onChange', value: { x: number; y: number }[]): void
}>()

const stageConfig = ref({
  width: props.stageWidth,
  height: props.stageHeight
})

const imageConfig = reactive({
  x: 0,
  y: 0,
  width: props.stageWidth,
  height: props.stageHeight,
  image: null as HTMLImageElement | null,
  fill: '#d3d3d3'
})

/**
 * [x1, y1, x2, y2, x3, y3]...的扁平化数组 flatPoints
 * - 点连成线
 * - 传给 v-circle 作为两点之间的节点
 */
const points = ref<{ x: number; y: number }[]>([])
const flatPoints = computed(() => points.value.flatMap((p) => [p.x, p.y]))
const isDrawing = ref(false) // 绘制中
const isClosed = ref(false) // 路径已闭合
const exportedPoints = ref<{ x: number; y: number }[]>([]) // 保存点位信息

const loadImage = () => {
  const img = new Image()
  img.src = props.imgUrl
  img.onload = () => {
    // 宽高自适应
    const aspectRatio = img.naturalWidth / img.naturalHeight
    const imageHeight = props.stageHeight
    const imageWidth = imageHeight * aspectRatio

    imageConfig.width = imageWidth
    imageConfig.height = imageHeight
    stageConfig.value.width = imageWidth
    stageConfig.value.height = imageHeight

    imageConfig.image = img
  }
}

const handleMouseDown = (e: any) => {
  if (isClosed.value) return

  const pos = e.target.getStage().getPointerPosition()
  if (pos) {
    points.value.push(pos)
    isDrawing.value = true
  }
}

const handleMouseMove = (e: any) => {
  // 先确认起始点才开始绘制
  // if (!isDrawing.value || isClosed.value) return
  // 直接开始绘制，不用确认起始点
  if (isClosed.value) return

  const pos = e.target.getStage().getPointerPosition()
  if (pos) {
    // 每次移动的时候将新的点替换掉上一次的点，连成一条直线
    points.value = [...points.value.slice(0, -1), pos]
  }
}

const handleMouseUp = (e: any) => {
  if (!isDrawing.value || isClosed.value) return

  const pos = e.target.getStage().getPointerPosition()
  if (pos) {
    const lastPoint = points.value[0]
    const distance = Math.sqrt((pos.x - lastPoint.x) ** 2 + (pos.y - lastPoint.y) ** 2)

    // 当前点靠近起始点时自动闭合
    if (points.value.length > 2 && distance < 10) {
      isClosed.value = true
      points.value.push(points.value[0]) // 当前点覆盖起始点
      // 闭合后自动完成
      finishDrawing()
    } else {
      points.value.push(pos) // 创建一个新的点
    }
  }
  isDrawing.value = false
}

const finishDrawing = () => {
  exportedPoints.value = [...points.value]
  emits('onChange', points.value)
  console.log('获得所有点位', exportedPoints.value)
}

const clearDrawing = () => {
  points.value = []
  exportedPoints.value = []
  isClosed.value = false
}

onMounted(() => {
  loadImage()
})
</script>

<style lang="scss" scoped>
.pen-tool {
  position: relative;
  display: flex;
  flex-direction: column;
  // align-items: center;
  cursor: crosshair;

  .controls {
    display: flex;

    button {
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
    }
  }

  .output {
    margin-top: 20px;
    pre {
      background-color: #f4f4f4;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      overflow-x: auto;
    }
  }
}
</style>
