<template>
  <div class="pen-tool">
    <v-stage
      :config="stageConfig"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    >
      <v-layer ref="layerRef">
        <!-- 背景图 -->
        <v-image :config="imageConfig" />
        <!-- 已完成绘制的图形 -->
        <v-group
          v-for="(shape, shapeIndex) in shapes"
          :key="shapeIndex"
          :config="{
            draggable: true,
            x: shape.offset.x,
            y: shape.offset.y
          }"
          @mouseup="pointer = 'grab'"
          @mousedown="pointer = 'grabbing'"
          @mouseleave="pointer = 'crosshair'"
          @mouseover="pointer = 'crosshair'"
          @dragmove="updateShapePosition(shapeIndex, $event)"
        >
          <v-line
            :config="{
              points: flatPoints(shape.points),
              stroke: shape.config.stroke,
              strokeWidth: 2,
              lineJoin: 'round',
              closed: true,
              tension: 0
            }"
          />
          <v-circle
            v-for="(point, pointIndex) in shape.points"
            :key="pointIndex"
            :config="{
              x: point.x,
              y: point.y,
              radius: 3,
              fill: shape.config.stroke
            }"
          />
        </v-group>
        <!-- 当前正在绘制的图形 -->
        <v-line
          v-if="currentPoints.length > 0"
          :config="{
            points: flatPreviewPoints,
            stroke: strokeColor,
            strokeWidth: 2,
            lineJoin: 'round',
            tension: 0
          }"
        />
      </v-layer>
    </v-stage>
    <!-- 操作按钮 -->
    <div v-if="showControls" class="controls">
      <el-button size="small" @click="finishDrawing" :disabled="!currentPoints.length">
        完成
      </el-button>
      <el-button size="small" @click="clearAllShapes">清除所有图形</el-button>
      <el-button @click="exportAsImage">导出图片</el-button>
    </div>

    <div v-if="shapes.length > 0 && showOutput" class="output">
      <h3>所有图形点位：</h3>
      <pre>{{ shapes }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Konva from 'konva'
import type { DrawShape } from './types'

/**
 * 在 main.ts 全局配置 VueKonva，Konva 在这里仅起到类型注解的作用
 *
 * 确保绘制比例数据正确的情况下，通过在父组件使用 transform 来变更显示大小 ？？
 */

interface Props {
  imgUrl?: string
  stageWidth?: number
  stageHeight?: number
  strokeColor?: string
  showControls?: boolean
  showOutput?: boolean
  drawShapes?: DrawShape[] // 预览时传入整个配置
  action?: 'edit' | 'view'
}

const props = withDefaults(defineProps<Props>(), {
  imgUrl: '/images/login/login_bg.jpg',
  stageWidth: 600,
  stageHeight: 400,
  showControls: false,
  showOutput: false,
  strokeColor: 'red',
  action: 'edit'
})

watch(
  () => props.strokeColor,
  () => {
    console.log('[绘制]改变画笔颜色', props.strokeColor)
  }
)

const emits = defineEmits<{
  (e: 'change', value: { x: number; y: number }[][], shapes: DrawShape[]): void
}>()

const layerRef = ref<Konva.Layer | null>(null)

const stageConfig: Konva.StageConfig = reactive({
  width: props.stageWidth,
  height: props.stageHeight
})

const imageConfig: Konva.ImageConfig = reactive({
  x: 0,
  y: 0,
  width: props.stageWidth,
  height: props.stageHeight,
  image: null as unknown as CanvasImageSource
})

// 当前正在绘制的相关状态
const currentPoints = ref<{ x: number; y: number }[]>([])
const flatPreviewPoints = computed(() => [
  ...currentPoints.value.flatMap((p) => [p.x, p.y]),
  ...(previewPoint.value ? [previewPoint.value.x, previewPoint.value.y] : [])
])
const previewPoint = ref<{ x: number; y: number } | null>(null) // Next point preview
const isDrawing = ref(false)
const isClosed = ref(false)
// 定义鼠标指针样式，并且管理是否可以绘制
type PointerState = 'crosshair' | 'grab' | 'grabbing' | ''
const pointer = ref<PointerState>('crosshair')

// 所有绘制的图形的状态，包括 confg 配置信息
const shapes = ref<DrawShape[]>([])

const flatPoints = (points: { x: number; y: number }[]) => points.flatMap((p) => [p.x, p.y])

// Load Background Image
const loadImage = () => {
  const img = new Image()
  img.style.objectFit = 'contain'
  // 前端跨域问题会导致canvas调用toDataURL失败，需在设置 src 之前声明 crossOrigin
  // https://konvajs.org/docs/posts/Tainted_Canvas.html
  img.crossOrigin = 'Anonymous'
  img.src = props.imgUrl
  img.onload = () => {
    const aspectRatio = img.naturalWidth / img.naturalHeight
    let imageHeight = props.stageHeight
    let imageWidth = imageHeight * aspectRatio

    if (imageWidth > props.stageWidth) {
      imageWidth = props.stageWidth
      imageHeight = imageWidth / aspectRatio
    }
    imageConfig.width = imageWidth
    imageConfig.height = imageHeight
    stageConfig.width = imageWidth
    stageConfig.height = imageHeight

    console.log('实际图片', imageConfig)

    imageConfig.image = img
  }
}

const handleMouseDown = (e: any) => {
  // 预览时不允许绘制
  if (props.action === 'view') return (pointer.value = '')
  // 拖拽时不允许绘制
  if (pointer.value !== 'crosshair') return

  const pos = e.target.getStage().getPointerPosition()
  if (pos) {
    currentPoints.value.push(pos)
    previewPoint.value = null // 重置预览
    isDrawing.value = true
  }
}

const handleMouseMove = (e: any) => {
  if (!isDrawing.value) return

  const pos = e.target.getStage().getPointerPosition()
  if (pos) {
    previewPoint.value = pos // 更新正在绘制的点位
  }
}

const handleMouseUp = (e: any) => {
  const pos = e.target.getStage().getPointerPosition()
  if (!isDrawing.value || !pos) return

  if (!currentPoints.value.length) return
  const firstPoint = currentPoints.value[0]
  const distance = Math.sqrt((pos.x - firstPoint.x) ** 2 + (pos.y - firstPoint.y) ** 2)

  if (currentPoints.value.length > 2 && distance < 10) {
    currentPoints.value.push(firstPoint) // 两点之间的距离相近时自动闭合
    isClosed.value = true
    finishDrawing()
  } else {
    currentPoints.value.push(pos) // 将当前点添加到绘制的点位中，点连成一条线
    previewPoint.value = null // 重置预览
  }

  isDrawing.value = true // 显示实时预览
}

const finishDrawing = () => {
  if (!currentPoints.value.length) return

  shapes.value.push({
    id: Date.now(), // 当前系统中，这个id后来会被替换掉（看与接口约定何种类型）
    points: [...currentPoints.value],
    offset: { x: 0, y: 0 },
    config: { stroke: props.strokeColor }
  })

  console.log('[绘制]完成绘制', shapes.value)

  currentPoints.value = []
  previewPoint.value = null
  isClosed.value = false

  emits(
    'change',
    shapes.value.map((shape) => shape.points),
    shapes.value
  )
}

type ChangingParam = {
  target: string | number
  color: string
}
/** 根据索引目标改变绘制线条的颜色 */
const changeTargetStrokeColor = (config: ChangingParam) => {
  shapes.value.forEach((shape, index) => {
    if (index === config.target) {
      shape.config.stroke = config.color
    }
  })
}

const removeTargetShape = (target: number) => {
  shapes.value.splice(target, 1)
  emits(
    'change',
    shapes.value.map((shape) => shape.points),
    shapes.value
  )
}

// 清空所有图形状态
const clearAllShapes = () => {
  shapes.value = []
  currentPoints.value = []
  previewPoint.value = null
  isClosed.value = false
}

// 当在已完成的图形上拖拽时，更新图形的位置
const updateShapePosition = (shapeIndex: number, e: any) => {
  pointer.value = 'grabbing'

  const node = e.target
  shapes.value[shapeIndex].offset = { x: node.x(), y: node.y() }

  emits(
    'change',
    shapes.value.map((shape) => shape.points),
    shapes.value
  )
}

// 将当前的 v-layer 导出为base64图片
const exportAsImage = () => {
  const stage = layerRef.value?.getStage()
  if (stage) {
    const dataUrl = stage.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = 'image.png'
    link.click()
  }
}

const getBase64String = () => {
  const stage = layerRef.value?.getStage()
  if (stage) {
    const dataUrl = stage.toDataURL({ pixelRatio: 2 })
    // return dataUrl.replace('data:image/png;base64,', '')
    return dataUrl
  }
}

const restoreShape = () => {
  console.log('[绘制]是否有重绘数据', props.drawShapes)
  if (!props.drawShapes || props.drawShapes.length === 0) return
  shapes.value = props.drawShapes
}

onMounted(() => {
  loadImage()
  // props.action === 'view' && restoreShape()
  restoreShape()
  props.action === 'view' && (pointer.value = '')
})

defineExpose({
  clear: clearAllShapes,
  setColor: changeTargetStrokeColor,
  removeShape: removeTargetShape,
  exportAsImage,
  getBase64String,
  getStageSize: () => ({ width: stageConfig.width, height: stageConfig.height })
})
</script>

<style lang="scss" scoped>
.pen-tool {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  // height: 100%; // 高度改为由透传或父组件决定
  cursor: v-bind('pointer');

  .controls {
    margin-top: 20px;
    display: flex;
    align-items: center;

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
