<template>
  <el-container class="tab-video">
    <el-main class="tab-video__player">
      <div class="no-video-stream" v-if="deviceList.length === 0">
        <NoVideoStream />
      </div>
      <el-row v-else :gutter="2" style="width: 100%; height: 100%">
        <el-col
          v-for="device in deviceList"
          :key="device?.id"
          :span="deviceList.length > 1 ? 12 : 24"
          :style="{ marginBottom: deviceList.length > 2 ? '20px' : 0 }"
          style="width: 100%; height: 100%; position: relative"
        >
          <xgPlayer
            v-if="current.player === 'xg'"
            :url="device.address"
            :id="device.domId"
            :controls="!device.name.includes('红外')"
            isLive
            autoPlay
            @error="onXgPlayerError"
          />
          <JessibucaPlayer
            v-else
            :id="device.domId"
            :play-url="device.address"
            autoPlay
            :hide-log="['performance']"
          />
          <!-- 形状绘制层 -->
          <div
            v-if="device.name.includes('红外')"
            class="shape-overlay-container"
            :id="`overlay-container-${device.domId}`"
            @click="handleCanvasClick($event, device.domId)"
          >
            <canvas ref="shapeCanvas" :data-player-id="device.domId"></canvas>
          </div>
        </el-col>
      </el-row>
    </el-main>
    <el-footer class="flex-box">
      <div class="flex-box items-center" style="margin-left: auto">
        <span v-if="recordState.isActive" class="record-bar">
          <el-input
            v-model="recordState.duration"
            size="small"
            style="width: 200px"
            type="number"
            placeholder="时长"
          >
            <template #prefix>
              <el-select
                v-model="recordState.channel"
                size="small"
                style="width: 80px"
                placeholder="通道"
              >
                <el-option
                  v-for="item in deviceList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                ></el-option>
              </el-select>
            </template>
            <template #append>S</template>
          </el-input>
          <el-button
            class="ml15"
            size="small"
            :disabled="recordState.loading"
            @click="onRecordBtnClick"
            >取消</el-button
          >
        </span>
        <el-button
          size="small"
          :type="recordState.isActive ? 'primary' : ''"
          :disabled="recordState.loading"
          @click="onRecordBtnClick"
        >
          {{ recordState.isActive ? '开始录像' : '录像' }}
        </el-button>
        <el-button size="small" :disabled="is.lightBtnLoading" @click="turnOnTheLight('open')">
          <span>开灯</span>
        </el-button>
        <el-button size="small" :disabled="is.lightBtnLoading" @click="turnOnTheLight('close')">
          <span>关灯</span>
        </el-button>
      </div>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Opportunity } from '@element-plus/icons-vue'
import JessibucaPlayer from '@/components/media/JessibucaPlayer.vue'
import xgPlayer from '@/components/media/xgPlayer.vue'
import { NoVideoStream } from '@/components/renderer'
import { request } from '@/util/request'
import { normalizeStreamUrl } from '@/components/media/tools'
import { deviceApi } from '@/apis/device'
import { filesApi } from '@/apis/files'
import { sleep, generateEasyId } from '@/util'
import { toggleSenseDeviceLight } from '../utils'
import type { StreamConfigRes } from '@/views/eventCenter/types'
import type { DrawShape } from '@/components/drawing/types'
import type { MediaError } from '@/components/media/types'
import type { AreaTempRes } from '../types'

import { _shapes } from '@/views/monitorCenter/utils'

interface TempRes {
  deviceId: string //设备ID
  active: number //先判断active，再使用temp（0 不在线；1 在线）
  x: number //X坐标
  y: number //Y坐标
  temp: number //温度
}

interface Props {
  data: ARC.AnyObj
  shapes?: DrawShape[]
  shapesTemperature?: AreaTempRes[]
}
const props = defineProps<Props>()
const is = reactive({
  loading: false,
  lightBtnLoading: false
})

const current = reactive({
  player: 'xg' as 'xg' | 'jessibuca'
})

const deviceList = ref<StreamConfigRes[]>([])
const shapeCanvasRefs = ref<HTMLCanvasElement[]>([])
const clickPoints = ref<
  Array<{
    x: number
    y: number
    playerId: string
    maxTemp?: number
    minTemp?: number
    loading?: boolean
  }>
>([]) // 存储点击位置及温度数据
// 文本折叠状态记录（key: zonesId，默认展开 false）
const labelCollapseState = reactive<Record<string, boolean>>({})
// 文本偏移记录（仅前端拖动生效）
const labelOffsetState = reactive<Record<string, { dx: number; dy: number }>>({})

// 处理画布点击事件
function handleCanvasClick(event: MouseEvent, playerId: string) {
  // 如果刚发生拖动，跳过点击
  if (dragState.dragging || dragState.wasDragged) {
    dragState.wasDragged = false
    dragState.dragging = false
    return
  }
  // 获取点击相对于画布的坐标（画布与播放器同尺寸）
  const container = document.getElementById(`overlay-container-${playerId}`)
  if (!container) return

  const canvas = container.querySelector('canvas') as HTMLCanvasElement | null
  if (!canvas) return

  const canvasRect = canvas.getBoundingClientRect()
  const x = event.clientX - canvasRect.left
  const y = event.clientY - canvasRect.top

  // 优先检测是否点击了文本区域，切换折叠状态
  const labelBoxes = (canvas as any)?._labelBoxes as
    | { x: number; y: number; w: number; h: number; zonesId: string }[]
    | undefined
  if (labelBoxes?.length) {
    const target = labelBoxes.find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)
    if (target) {
      labelCollapseState[target.zonesId] = !labelCollapseState[target.zonesId]
      updateAllShapes()
      return
    }
  }

  // 视频按 fill 铺满窗口，归一化坐标 = 窗口坐标 / 窗口尺寸
  const nx = Number((x / canvasRect.width).toFixed(5))
  const ny = Number((y / canvasRect.height).toFixed(5))

  // 存储点击位置（归一化坐标）
  const newPoint = {
    x: nx,
    y: ny,
    playerId,
    maxTemp: void 0,
    minTemp: void 0,
    loading: true // 初始设置为加载中状态
  }
  clickPoints.value = [newPoint] // 只保留最新的点击点

  // 在控制台输出坐标信息
  console.log(`点击归一化坐标: (${nx}, ${ny})`)

  // 向后端发送坐标获取温度信息
  getTemperatureData(nx, ny, playerId)

  // 重新绘制所有形状和点击点
  updateAllShapes()
}

// 拖动文本交互状态
const dragState = reactive({
  dragging: false,
  zonesId: '',
  startX: 0,
  startY: 0,
  startDx: 0,
  startDy: 0,
  timer: 0,
  wasDragged: false
})

// 向后端请求温度数据
async function getTemperatureData(x: number, y: number, playerId: string) {
  try {
    updateAllShapes()
    const device = deviceList.value.find((d) => d.domId === playerId)
    if (!device) return

    console.log('设备信息:', device)
    console.log('点击归一化坐标:', x, y)

    const { data, code } = await request.get<any, TempRes>(deviceApi.getVideoTemp, {
      deviceId: props.data.deviceId,
      x: Number(x.toFixed(5)),
      y: Number(y.toFixed(5))
    })

    if (code === 100 && data) {
      clickPoints.value[0].loading = false

      if (data.active === 0) {
        ElMessage.warning('设备不在线，无法获取温度数据')
        clickPoints.value[0].maxTemp = -1
        clickPoints.value[0].minTemp = -1
      } else {
        clickPoints.value[0].maxTemp = data.temp
        clickPoints.value[0].minTemp = data.temp
      }
      updateAllShapes()
    }
  } catch (error) {
    console.error('获取温度数据失败', error)
    ElMessage.error('获取温度数据失败')

    if (clickPoints.value.length > 0) {
      clickPoints.value[0].loading = false
      clickPoints.value[0].maxTemp = -2
      clickPoints.value[0].minTemp = -2
      updateAllShapes()
    }
  }
}

// 绘制形状的函数
function drawShapesOnCanvas(canvas: HTMLCanvasElement, shapes: DrawShape[]) {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 获取对应的播放器元素
  const playerId = canvas.dataset.playerId
  const playerEl = document.getElementById(playerId || '')
  if (!playerEl) return

  // 设置canvas大小与播放器一致
  const rect = playerEl.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 归一化坐标（0~1）→ 窗口坐标（视频按 fill 铺满窗口）
  const toWindow = (nx: number, ny: number) => ({ x: nx * canvas.width, y: ny * canvas.height })

  // 取形状的归一化点位：优先用 dets 带来的 normalizedPoints，老数据兜底由像素/stageSize 换算
  const getNormalizedPoints = (shape: any): number[][] => {
    if (shape.normalizedPoints && shape.normalizedPoints.length) return shape.normalizedPoints
    if (shape.points && shape.points.length) {
      const sw = shape.stageSize?.width
      const sh = shape.stageSize?.height
      if (!sw || !sh) {
        console.warn('[TabVideo] 形状缺少画布尺寸(stageSize)，跳过绘制', shape)
        return []
      }
      return shape.points.map((p: any) => [p.x / sw, p.y / sh])
    }
    return []
  }

  // 记录文本区域用于折叠/展开点击
  const labelBoxes: { x: number; y: number; w: number; h: number; zonesId: string }[] = []

  // 绘制每个形状
  shapes.forEach((shape, index) => {
    const npts = getNormalizedPoints(shape as any)
    if (!npts || npts.length < 3) return

    ctx.beginPath()

    // 移动到第一个点（归一化 → 窗口）
    const firstPt = toWindow(npts[0][0], npts[0][1])
    ctx.moveTo(firstPt.x, firstPt.y)

    // 连接其余点
    for (let i = 1; i < npts.length; i++) {
      const pt = toWindow(npts[i][0], npts[i][1])
      ctx.lineTo(pt.x, pt.y)
    }

    // 闭合路径
    ctx.closePath()

    // 设置样式
    ctx.strokeStyle = shape.config?.stroke || '#ff6684'
    ctx.lineWidth = 2
    ctx.stroke()

    // 设置填充颜色（半透明）
    ctx.fillStyle = 'rgba(255, 102, 132, 0.01)'
    ctx.fill()

    // 获取对应的温度数据（zonesId的设置在monitorCenter/index.vue中设置）
    const tempData = props.shapesTemperature?.find((t) => +t.zonesId === +shape.id)

    if (tempData) {
      // 计算形状左上角（归一化坐标），用于放置文本
      let minX = Infinity
      let minY = Infinity

      for (let i = 0; i < npts.length; i++) {
        minX = Math.min(minX, npts[i][0])
        minY = Math.min(minY, npts[i][1])
      }

      const zonesKey = String(tempData.zonesId)

      // 归一化坐标转窗口坐标 + 用户自定义偏移
      const offset = labelOffsetState[zonesKey] || { dx: 0, dy: 0 }
      const labelPt = toWindow(minX, minY)
      let textX = labelPt.x + 20 + offset.dx
      let textY = labelPt.y + 24 + offset.dy

      // 绘制ID和温度信息
      const text = [
        `区域: ${tempData.zonesName}`,
        `MAX: ${tempData.maxTemp.toFixed(1)}°C`,
        `AVG: ${tempData.avgTemp.toFixed(1)}°C`
        // `MIN: ${tempData.minTemp.toFixed(1)}°C`
      ]

      const collapsed = labelCollapseState[zonesKey] ?? false
      const displayText = collapsed ? [text[0]] : text

      // 设置文本样式
      const lineHeight = 16
      const padding = 5
      const color = '#2ea043'
      // 根据实际文本宽度自适应
      ctx.font = '14px Arial'
      const maxLineWidth = Math.max(...displayText.map((line) => ctx.measureText(line).width))
      let textWidth = maxLineWidth + padding * 2
      const textHeight = lineHeight * displayText.length + padding * 2

      // 若超出画布右侧，向左收缩/移动
      const margin = 8
      if (textX + textWidth + margin > canvas.width) {
        textX = Math.max(margin, canvas.width - textWidth - margin)
      }

      // 简单绘制文本背景与文本
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.fillRect(textX, textY - textHeight / 2, textWidth, textHeight)

      ctx.fillStyle = color
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'

      displayText.forEach((line, i) => {
        ctx.fillText(
          line,
          textX + padding,
          textY - textHeight / 3 + padding + lineHeight * i + lineHeight / 2
        )
      })

      // 记录文本区域用于点击切换折叠状态
      labelBoxes.push({
        x: textX,
        y: textY - textHeight / 2,
        w: textWidth,
        h: textHeight,
        zonesId: zonesKey
      })

      // 绘制区域内最高温度点位（+号标记），使用同色系
      if (tempData.maxX !== undefined && tempData.maxY !== undefined) {
        // maxX/maxY 为归一化坐标（0~1），转为窗口坐标
        const pointX = tempData.maxX * canvas.width
        const pointY = tempData.maxY * canvas.height
        const crossSize = 8
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        // 水平线
        ctx.moveTo(pointX - crossSize, pointY)
        ctx.lineTo(pointX + crossSize, pointY)
        // 垂直线
        ctx.moveTo(pointX, pointY - crossSize)
        ctx.lineTo(pointX, pointY + crossSize)
        ctx.stroke()
      }
    }
  })

  // 存储文本区域供点击折叠/展开使用
  ;(canvas as any)._labelBoxes = labelBoxes
  if (!(canvas as any)._labelHoverBound) {
    canvas.title = '展开/折叠'

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const boxes =
        ((canvas as any)._labelBoxes as { x: number; y: number; w: number; h: number }[]) || []
      const hit = boxes.some((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)
      canvas.style.cursor = hit ? 'pointer' : 'default'
    })
    ;(canvas as any)._labelHoverBound = true
  }

  // 绑定长按拖动文本（仅绑定一次）
  if (!(canvas as any)._labelDragBound) {
    const longPressMs = 300
    const clearTimer = () => {
      if (dragState.timer) {
        clearTimeout(dragState.timer)
        dragState.timer = 0
      }
    }

    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const boxes =
        ((canvas as any)._labelBoxes as {
          x: number
          y: number
          w: number
          h: number
          zonesId: string
        }[]) || []
      const target = boxes.find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)
      if (!target) return

      clearTimer()
      dragState.timer = window.setTimeout(() => {
        dragState.dragging = true
        dragState.wasDragged = false
        dragState.zonesId = target.zonesId
        dragState.startX = e.clientX
        dragState.startY = e.clientY
        const offset = labelOffsetState[target.zonesId] || { dx: 0, dy: 0 }
        dragState.startDx = offset.dx
        dragState.startDy = offset.dy
        canvas.style.cursor = 'move'
      }, longPressMs)
    })

    const endDrag = () => {
      clearTimer()
      if (dragState.dragging) {
        dragState.dragging = false
        dragState.wasDragged = true
        canvas.style.cursor = 'default'
      }
    }

    canvas.addEventListener('mousemove', (e) => {
      if (!dragState.dragging) return
      const dx = e.clientX - dragState.startX
      const dy = e.clientY - dragState.startY
      labelOffsetState[dragState.zonesId] = {
        dx: dragState.startDx + dx,
        dy: dragState.startDy + dy
      }
      dragState.wasDragged = true
      updateAllShapes()
    })
    canvas.addEventListener('mouseup', () => endDrag())
    canvas.addEventListener('mouseleave', () => endDrag())
    ;(canvas as any)._labelDragBound = true
  }

  // 绘制点击点位（+号标记）
  const canvasPlayerId = canvas.dataset.playerId
  const relevantPoints = clickPoints.value.filter((point) => point.playerId === canvasPlayerId)

  relevantPoints.forEach((point) => {
    // 点击点存的是归一化坐标（0~1），转为窗口坐标
    const displayX = point.x * canvas.width
    const displayY = point.y * canvas.height

    // 绘制十字标记
    ctx.beginPath()
    ctx.strokeStyle = '#FF0000' // 红色
    ctx.lineWidth = 2

    // 水平线
    ctx.moveTo(displayX - 10, displayY)
    ctx.lineTo(displayX + 10, displayY)

    // 垂直线
    ctx.moveTo(displayX, displayY - 10)
    ctx.lineTo(displayX, displayY + 10)

    ctx.stroke()

    // 绘制温度数据文本
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'

    let text
    if (point.loading) {
      text = '加载中...'
    } else if (point.maxTemp === -1 && point.minTemp === -1) {
      text = '设备不在线'
    } else if (point.maxTemp === -2 && point.minTemp === -2) {
      text = '获取温度失败'
    } else if (point.maxTemp !== undefined) {
      text = `温度: ${point.maxTemp.toFixed(1)}°C`
    } else {
      text = '等待点击'
    }

    const textLines = text.split('\n')
    const lineHeight = 20
    const padding = 5
    const textWidth = 120
    const textHeight = lineHeight * textLines.length + padding * 2

    // 绘制文本背景
    ctx.fillRect(displayX + 15, displayY - textHeight / 2, textWidth, textHeight)

    // 绘制文本
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '14px Arial'
    ctx.textBaseline = 'middle'

    textLines.forEach((line, index) => {
      ctx.fillText(
        line,
        displayX + 15 + padding,
        displayY - textHeight / 2 + padding + lineHeight * index + lineHeight / 2
      )
    })
  })
}

// 更新所有canvas上的形状
function updateAllShapes() {
  nextTick(() => {
    // 获取所有canvas元素
    const canvasElements = document.querySelectorAll(
      '.shape-overlay-container canvas'
    ) as NodeListOf<HTMLCanvasElement>
    shapeCanvasRefs.value = Array.from(canvasElements)

    if (!props.shapes || props.shapes.length === 0) return
    // 为每个canvas绘制形状
    shapeCanvasRefs.value.forEach((canvas) => {
      // drawShapesOnCanvas(canvas, _shapes)
      drawShapesOnCanvas(canvas, props.shapes || [])
    })
  })
}

// 监听窗口大小变化，重新绘制形状
const resizeObserver = new ResizeObserver(() => {
  updateAllShapes()
})

async function fetchUrls() {
  try {
    is.loading = true
    const { data, code } = await request.get<any, StreamConfigRes[]>(deviceApi.getFlvStream, {
      name: props.data.name,
      id: props.data.deviceId
    })

    if (code !== 100) throw new Error('请求失败')
    deviceList.value = data
      .filter((item) => item.address.startsWith('http'))
      .map((item) => ({
        ...item,
        address: normalizeStreamUrl(item.address),
        domId: generateEasyId()
      }))
      // 非“红外”排前，“红外”排后
      .sort((a, b) => {
        const aInfra = a.name?.includes('红外') ? 1 : 0
        const bInfra = b.name?.includes('红外') ? 1 : 0
        return aInfra - bInfra
      })
    console.log('[设备详情]获取实时视频地址成功', deviceList.value)
  } catch (error) {
    console.log('[设备详情]获取实时视频地址失败', error)
  } finally {
    await sleep(1000)
    is.loading = false
  }
}

async function turnOnTheLight(action: 'open' | 'close') {
  is.lightBtnLoading = true
  toggleSenseDeviceLight({
    deviceId: props.data.deviceId,
    deviceType: props.data.sensingDeviceType,
    action
  }).finally(() => {
    setTimeout(() => {
      is.lightBtnLoading = false
    }, 500)
  })
}

function onXgPlayerError(error: MediaError) {
  console.log('[设备详情]直播流', error.reason)
  if (error.reason === 'unsupported') {
    console.log('[设备详情]切换播放器... =-=-> jessibuca')
    current.player = 'jessibuca'
  }
}

const recordState = reactive({
  loading: false,
  isActive: false,
  duration: 1,
  deviceId: '',
  channel: ''
})

function onRecordBtnClick() {
  if (recordState.isActive) {
    let warnMsg = ''
    if (!recordState.channel) {
      warnMsg = '请选择通道'
    }
    if (!recordState.duration || recordState.duration < 1) {
      warnMsg = '请输入有效时长'
    }
    if (warnMsg) {
      ElMessage.warning(warnMsg)
      return
    }
    const reqParam = {
      deviceId: props.data.deviceId,
      channelType: recordState.channel.includes('红外') ? 'ch2' : 'ch1',
      recordTime: recordState.duration
    }
    recordState.loading = true
    request
      .get(filesApi.video.record, reqParam)
      .then((res) => {
        if (res.code === 100) ElMessage.success(res.msg)
      })
      .finally(() => {
        recordState.isActive = false
        recordState.loading = false
      })
  } else {
    recordState.isActive = true
  }
}

onMounted(() => {
  console.log('[感知设备]绘制形状', props.shapes)
  fetchUrls()
  // 在视频加载完成后绘制形状
  nextTick(() => {
    setTimeout(updateAllShapes, 1000) // 给视频加载一些时间
  })
})

onUnmounted(() => {
  // 清理ResizeObserver
  resizeObserver.disconnect()
})

// 监听deviceList变化，当视频加载完成后绘制形状
watch(
  deviceList,
  () => {
    if (deviceList.value.length > 0) {
      nextTick(() => {
        setTimeout(updateAllShapes, 1000) // 给视频加载一些时间

        // 监听每个播放器容器的大小变化
        deviceList.value.forEach((device) => {
          const playerEl = document.getElementById(device.domId)
          if (playerEl) {
            resizeObserver.observe(playerEl)
          }
        })
      })
    }
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.tab-video {
  &__aside {
    margin-right: 20px;
    padding: 15px 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  &__player {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 400px;
    border-radius: 4px;
  }

  .divider {
    width: 1px;
    height: 100%;
    margin: 0 14px;
    background-color: #ccc;
  }
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

.shape-overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: auto; // 修改为auto以捕获点击事件
  z-index: 10; // 确保在视频播放器上方

  canvas {
    width: 100%;
    height: 100%;
  }
}

.record-bar {
  transition: all ease-in-out 0.3s;
  margin-right: 15px;
}

.el-button--warning:hover {
  color: var(--el-color-warning);
}
</style>
