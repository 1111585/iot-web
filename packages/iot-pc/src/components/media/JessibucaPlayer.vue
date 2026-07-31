<template>
  <div class="jessibuca-container" :id="id">
    <div ref="jessibucaRef"></div>
    <div v-if="!playUrl" class="no-stream">暂无数据流</div>
  </div>
</template>

<script setup lang="ts">
/**
 * 
 * !!! 如果在 el-dialog 上使用，记得设置 destroy-on-close ！！！
 * 
 * @TOOD:
 * 1. func-bar
 * 
 * jessibuca 播放器
 *
 * 用意：支持播放 audio/mp4:codecs-g7110a 格式资源，浏览器自身并不支持此mimeType：
 * 
 * ```
 * const mimeType = 'audio/mp4;codecs=g7110a';
 * if (MediaSource.isTypeSupported(mimeType)) {
 *      console.log('Supported');
 * } else {
 *      console.log('Unsupported');
 * }
```
 *
 * - 官网：http://www.jessibuca.com/document.html
 * - typescript声明示例： https://github.com/bosscheng/jessibuca-vue-ts-demo.git
 * - 下载：不支持 npm，需要使用静态js（public/jessibuca），此版本为开源版
 */

interface Props {
  playUrl: string
  id?: string
  showBandwidth?: boolean
  showOperateBtns?: boolean
  forceNoOffscreen?: boolean
  autoPlay?: boolean
  isNotMute?: boolean
  showBar?: boolean
  debug?: boolean
  hideLog?: string[]
}

interface Emit {
  (e: 'video-info', info: any): void
  (e: 'play-success'): void
}

const props = withDefaults(defineProps<Props>(), {
  showBandwidth: true,
  showOperateBtns: true,
  forceNoOffscreen: false,
  isNotMute: false
})

const emit = defineEmits<Emit>()

const is = reactive({
  playing: false,
  loaded: false,
  quieting: true
})

const videoInfo = reactive({
  width: 0,
  height: 0,
  fps: 0,
  decodedFrames: 0,
  droppedFrames: 0,
  codecName: ''
})

let jessibuca: Jessibuca | null
const jessibucaRef = ref(null)

const buffer = ref(null)
const forceNoOffscreen = ref(false)

const createJessibuca = () => {
  jessibuca = new (window as any).Jessibuca({
    container: jessibucaRef.value,
    videoBuffer: 2, // 缓存时长
    decoder: '/jessibuca/decoder.js', // 需要指定位置，否知由 jessibuca.js 加载时会报错
    isResize: false,
    text: '',
    // background: "bg.jpg",
    loadingText: '加载中',
    // hasAudio:false,
    debug: props.debug,
    showBandwidth: props.showBandwidth, // 显示网速
    operateBtns: {
      fullscreen: props.showOperateBtns,
      screenshot: props.showOperateBtns,
      play: props.showOperateBtns,
      audio: props.showOperateBtns
    },
    forceNoOffscreen: forceNoOffscreen.value,
    isNotMute: false,
    controlAutoHide: true /// 是否自动隐藏控制条，鼠标悬停时显示
  }) as Jessibuca

  // 3.x 推荐写法
  if (jessibuca.loaded) {
    play()
  } else {
    jessibuca.on('load', function () {
      play()
    })
  }

  jessibuca.on('log', function (msg: any) {
    console.log('on log', msg)
  })
  jessibuca.on('record', function (msg: any) {
    console.log('on record:', msg)
  })
  jessibuca.on('pause', function () {
    console.log('on pause')
    is.playing = false
  })
  jessibuca.on('play', function () {
    console.log('on play')
    is.playing = true
    is.loaded = true
    is.quieting = jessibuca?.isMute() || false

    emit('play-success')
  })
  jessibuca.on('fullscreen', function (msg: any) {
    console.log('on fullscreen', msg)
  })

  jessibuca.on('mute', function (msg: any) {
    console.log('on mute', msg)
    is.quieting = msg
  })

  jessibuca.on('mute', function (msg: any) {
    console.log('on mute2', msg)
  })

  jessibuca.on('audioInfo', function (msg: any) {
    console.log('audioInfo', msg)
  })

  // jessibuca.on("bps", function (bps) {
  //   // console.log('bps', bps);
  // });
  // let _ts = 0;
  // jessibuca.on("timeUpdate", function (ts) {
  //   // console.log('timeUpdate,old,new,timestamp', _ts, ts, ts - _ts);
  //   // _ts = ts;
  // });

  jessibuca.on('videoInfo', function (info: any) {
    console.log('videoInfo', info)

    if (info) {
      videoInfo.width = info.width || 0
      videoInfo.height = info.height || 0
      videoInfo.fps = info.fps || 0
      videoInfo.decodedFrames = info.decodedFrames || 0
      videoInfo.droppedFrames = info.droppedFrames || 0
      videoInfo.codecName = info.codecName || ''
      emit('video-info', { ...videoInfo })
    }
  })

  jessibuca.on('error', function (error: any) {
    console.log('error', error)
  })

  jessibuca.on('timeout', function () {
    console.log('timeout')
  })

  jessibuca.on('start', function () {
    console.log('start')
  })

  jessibuca.on('performance', function (performance: any) {
    let show = '卡顿'
    if (performance === 2) {
      show = '非常流畅'
    } else if (performance === 1) {
      show = '流畅'
    }
  })

  // 创建一个对象来存储性能指标数据
  const performanceMetrics = reactive({
    buffer: null,
    stats: null,
    kBps: null
  })

  // 统一的日志输出函数
  const logPerformanceMetrics = (updatedMetric: string) => {
    if (props.hideLog && props.hideLog.includes('performance')) return
    console.group('Jessibuca性能指标')
    console.log('触发事件:', updatedMetric)
    console.log('buffer:', performanceMetrics.buffer)
    console.log('stats:', performanceMetrics.stats)
    console.log('kBps:', performanceMetrics.kBps)
    console.groupEnd()
  }

  jessibuca.on('buffer', function (buffer: any) {
    performanceMetrics.buffer = buffer
    logPerformanceMetrics('buffer')
  })

  jessibuca.on('stats', function (stats: any) {
    performanceMetrics.stats = stats
    logPerformanceMetrics('stats')
  })

  jessibuca.on('kBps', function (kBps: any) {
    performanceMetrics.kBps = kBps
    logPerformanceMetrics('kBps')
  })

  // 显示时间戳 PTS
  jessibuca.on('videoFrame', function () {})

  //
  jessibuca.on('metadata', function () {})
}

onMounted(() => {
  createJessibuca()
})

onUnmounted(async () => {
  if (jessibuca) {
    ;(await jessibuca) && jessibuca.destroy()
    jessibuca = null
  }
})

const play = () => {
  if (props.playUrl) {
    jessibuca?.play(props.playUrl)
  }
}
const pause = () => {
  jessibuca?.pause()
  is.playing = false
}

const togglePlay = () => {
  if (is.playing) {
    pause()
  } else {
    play()
  }
}

const destroy = async () => {
  if (jessibuca) {
    await jessibuca.destroy()
    jessibuca = null
  }
  createJessibuca()
  is.playing = false
  is.loaded = false
}

defineExpose({
  play,
  pause,
  destroy,
  togglePlay,
  getVideoInfo: () => ({ ...videoInfo })
})
</script>

<style lang="scss" scoped>
.jessibuca-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #42434c;
}

.no-stream {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  font-size: 24px;
  font-weight: bold;
  user-select: none;
}
</style>
