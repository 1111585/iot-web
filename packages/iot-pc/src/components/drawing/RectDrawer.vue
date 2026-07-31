<template>
  <canvas
    ref="canvas"
    :width="canvasWidth"
    :height="canvasHeight"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  ></canvas>
</template>

<script lang="ts" setup>
/**
 * TODO：
 *  - 添加移动 ctx.translate
 *  - 添加缩放 ctx.scale
 */
const canvas = ref<HTMLCanvasElement | null>(null)
// 记录鼠标按下状态
const isMouseDown = ref(false)
// 记录矩形的起点坐标、宽高
const rect = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0
})
// 用于存储图片对象
const img = ref<HTMLImageElement | null>(null)
// 定义发射自定义事件的函数
const emits = defineEmits(['rectCoordsChanged'])
// 通过props接收canvas尺寸，这里设置默认值，可根据实际需求调整
const props = defineProps({
  canvasWidth: {
    type: Number,
    default: 600
  },
  canvasHeight: {
    type: Number,
    default: 400
  },
  strokeStyle: {
    type: String,
    default: 'red'
  },
  lineWidth: {
    type: Number,
    default: 2
  },
  imgUrl: {
    type: String,
    default: '/images/404.png'
  }
})

// 当组件挂载时初始化canvas上下文并加载图片
onMounted(() => {
  const ctx = canvas.value?.getContext('2d')
  img.value = new Image()
  if (!ctx || !img.value) return

  ctx.fillStyle = 'lightgray'
  ctx.fillRect(0, 0, props.canvasWidth, props.canvasHeight)
  // 鼠标在画布上时，将鼠标样式变为加号
  ctx.canvas.onmouseover = function () {
    ctx.canvas.style.cursor = 'crosshair'
  }

  img.value.src = props.imgUrl
  img.value.onload = function () {
    // const aspectRatio = img.value!.naturalWidth / img.value!.naturalHeight
    // const imageHeight = props.canvasHeight
    // const imageWidth = imageHeight * aspectRatio
    // ctx.drawImage(img.value!, 0, 0, imageWidth, imageHeight)

    ctx.drawImage(img.value!, 0, 0, props.canvasWidth, props.canvasHeight)
  }
  img.value.onerror = function () {
    console.error('图片加载失败，请检查图片路径或网络情况')
  }
})

// 鼠标按下事件处理函数
const onMouseDown = (e) => {
  isMouseDown.value = true
  rect.value.x = e.offsetX
  rect.value.y = e.offsetY
}

// 鼠标移动事件处理函数
const onMouseMove = (e: MouseEvent) => {
  if (isMouseDown.value) {
    const ctx = canvas.value?.getContext('2d')
    if (!ctx) return console.log('[画框]鼠标移动时没找到canvas上下文')

    ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
    ctx.drawImage(img.value!, 0, 0, props.canvasWidth, props.canvasHeight)
    rect.value.width = e.offsetX - rect.value.x
    rect.value.height = e.offsetY - rect.value.y
    drawRect(ctx, rect.value)
  }
}

// 鼠标松开事件处理函数
const onMouseUp = () => {
  isMouseDown.value = false
  const coords = getRectCoords(rect.value)
  emits('rectCoordsChanged', coords)

  console.log('得到坐标点', coords)
}

// 绘制矩形的函数
const drawRect = (ctx: CanvasRenderingContext2D, rect: ARC.AnyObj) => {
  ctx.beginPath()
  ctx.rect(rect.x, rect.y, rect.width, rect.height)
  ctx.strokeStyle = props.strokeStyle
  ctx.lineWidth = props.lineWidth
  ctx.stroke()
}

// 获取矩形四个顶点坐标的函数
const getRectCoords = (rect) => {
  return [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height }
  ]
}

const clearRect = () => {
  const ctx = canvas.value?.getContext('2d')!
  ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
  ctx.drawImage(img.value!, 0, 0, props.canvasWidth, props.canvasHeight)
}

defineExpose({
  clearRect
})
</script>

<style scoped>
canvas {
  /* border: 1px solid gray; */
}
</style>
