<template>
  <div :id="id"></div>
</template>

<script setup lang="ts">
import Player, { Events } from 'xgplayer'
import FlvPlugin from 'xgplayer-flv'
import 'xgplayer/dist/index.min.css'
import type { MediaError } from './types'

interface Props {
  url: string
  width?: string
  height?: string
  autoPlay?: boolean
  /** 是否是直播流 */
  isLive?: boolean
  id?: string
}

interface Emits {
  (e: 'error', error: MediaError): void
  (e: 'video-info', info: any): void
  (e: 'play-success'): void
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '100%',
  id: 'mse'
})
const emit = defineEmits<Emits>()

let player: Player | null = null

// 存储视频信息
const videoInfo = reactive({
  width: 0,
  height: 0,
  fps: 0,
  duration: 0,
  currentTime: 0,
  codec: ''
})

onMounted(() => {
  player = new Player({
    id: props.id,
    url: props.url,
    height: props.height,
    width: props.width,
    isLive: props.isLive,
    autoplay: props.autoPlay,
    plugins: [FlvPlugin]
  })

  /**
   * 错误码参考：https://h5player.bytedance.com/api/error.html#error（但是目前遇到的错误码并不在其中）
   */
  player.on(Events.ERROR, (error) => {
    console.log('[媒体播放]🎞️❌', error)

    const unsupported = ['audio/mp4;codecs=g7110a', 'unsupported', 'play type']
    if (unsupported.every((flag) => error.message.includes(flag)) || error?.errorType === 'media') {
      emit('error', { reason: 'unsupported' })
    }
  })

  // 监听视频元数据加载完成事件
  player.on(Events.LOADED_METADATA, () => {
    console.log('[媒体播放]🎞️ 元数据加载完成')
    getVideoInfo()
  })
})

function getVideoInfo() {
  if (!player) return

  try {
    const video = player.video as HTMLVideoElement
    if (!video) return

    videoInfo.width = video.videoWidth
    videoInfo.height = video.videoHeight
    videoInfo.duration = video.duration || 0
    videoInfo.currentTime = video.currentTime || 0

    console.group('[媒体播放]视频信息')
    console.log('分辨率:', `${videoInfo.width}x${videoInfo.height}`)
    console.log('时长:', videoInfo.duration.toFixed(2), '秒')
    console.log('当前时间:', videoInfo.currentTime.toFixed(2), '秒')
    console.groupEnd()

    emit('video-info', { ...videoInfo })
  } catch (error) {
    console.error('[媒体播放]获取视频信息失败', error)
  }
}

// 暴露方法给父组件
defineExpose({
  getVideoInfo: () => ({ ...videoInfo })
})
</script>

<style lang="scss" scoped></style>
