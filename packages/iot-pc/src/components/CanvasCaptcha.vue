<template>
  <canvas
    ref="captchaCanvas"
    :width="width"
    :height="height"
    @click="refreshCaptcha"
    class="captcha-canvas"
  >
  </canvas>
  <!-- <div
    v-if="!text"
    class="is-loading"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <span class="spinner"></span>
    <span v-show="!isHovering">加载中</span>
    <span v-show="isHovering" @click="refreshCaptcha">点击刷新</span>
  </div> -->
</template>

<script lang="ts" setup>
const props = defineProps({
  width: {
    type: Number,
    default: 120
  },
  height: {
    type: Number,
    default: 40
  },
  text: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['refresh', 'generate'])

const captchaCanvas = ref<HTMLCanvasElement | null>(null)
const isHovering = ref(false)

// 绘制验证码
function drawCaptcha(text: string) {
  if (!captchaCanvas.value) return

  const ctx = captchaCanvas.value.getContext('2d')
  if (!ctx) return

  const { width, height } = captchaCanvas.value

  // 清空画布
  ctx.clearRect(0, 0, width, height)

  // 设置背景
  ctx.fillStyle = '#f0f2f5'
  ctx.fillRect(0, 0, width, height)

  // 绘制干扰线
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = getRandomColor()
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.stroke()
  }

  // 绘制干扰点
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = getRandomColor()
    ctx.beginPath()
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // 绘制文字
  ctx.textBaseline = 'middle'

  const chars = text.split('')
  const charWidth = width / chars.length

  for (let i = 0; i < chars.length; i++) {
    // 随机字体大小
    const fontSize = 18 + Math.random() * 6
    ctx.font = `bold ${fontSize}px Arial`

    // 随机颜色
    ctx.fillStyle = getRandomColor()

    // 随机旋转角度（适度旋转范围）
    const angle = (Math.random() * 0.4 - 0.2) * Math.PI

    // 轻微缩放
    const scaleX = 0.9 + Math.random() * 0.2
    const scaleY = 0.9 + Math.random() * 0.2

    // 随机位置
    const x = charWidth * i + charWidth / 2 + (Math.random() * 10 - 5)
    const y = height / 2 + (Math.random() * 10 - 5)

    // 轻微波浪形变形效果
    const waveOffset = Math.sin(i * 2) * 3

    // 应用变换
    ctx.save()
    ctx.translate(x, y + waveOffset)
    ctx.rotate(angle)
    ctx.scale(scaleX, scaleY)

    // 轻微倾斜效果
    ctx.transform(1, Math.random() * 0.15, Math.random() * 0.15, 1, 0, 0)

    ctx.fillText(chars[i], 0, 0)
    ctx.restore()
  }
}

// 获取随机颜色
function getRandomColor() {
  const colors = [
    '#333333',
    '#555555',
    '#777777',
    '#999999',
    '#0066cc',
    '#009933',
    '#cc0000',
    '#cc6600'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

function refreshCaptcha() {
  emit('generate')
}

// 监听文本变化
watch(
  () => props.text,
  (newText) => {
    isHovering.value = false
    if (newText) {
      drawCaptcha(newText)
    }
  }
)

onMounted(() => {
  if (props.text) {
    drawCaptcha(props.text)
  } else {
    // refreshCaptcha()
  }
})

// 暴露刷新方法给父组件
defineExpose({
  refreshCaptcha
})
</script>

<style scoped>
.captcha-canvas {
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}

.is-loading {
  position: absolute;
  right: 0;
  transform: translateX(-10%);
  padding: 2px 8px;
  color: #666;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: fadeIn 0.3s ease-in;

  cursor: pointer;
}

.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #e0e0e0;
  border-top-color: var(--el-color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
