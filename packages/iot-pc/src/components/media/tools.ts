/**
 * 直播流截取
 *
 * 由于当前使用摄像头flv流 audio/mp4;codecs=g7110a 格式特殊
 * 目前只找到Jessibuca支持，flv.js、xgplayer 不支持
 *
 * TODO: 视频流截取
 *
 * 使用 wasm ffmpeg（不支持直播流），不必操作dom（VideoFrameCapture.vue）
 *
 */

import Player from 'xgplayer'
import FlvPlugin from 'xgplayer-flv'

// 常量配置
const SCREENSHOT_TIMEOUT = 10000
const SCREENSHOT_DELAY = 1000
const CONTAINER_SIZE = { width: '640px', height: '480px' }

// 根据当前页面协议/域名/端口规范化流地址，避免后端返回固定IP（dev 与部署保持一致）
export function normalizeStreamUrl(address: string): string {
  const url = new URL(address)
  const currentProtocol = window.location.protocol
  const currentHost = window.location.hostname
  return `${currentProtocol}//${currentHost}${url.port ? `:${url.port}` : ''}${url.pathname}${url.search || ''}`
}

// 创建隐藏容器
function createHiddenContainer(): HTMLDivElement {
  const container = document.createElement('div')
  container.style.display = 'none'
  container.style.width = CONTAINER_SIZE.width
  container.style.height = CONTAINER_SIZE.height
  document.body.appendChild(container)
  return container
}

// 移除容器
function removeContainer(container: HTMLElement): void {
  if (container.parentNode) {
    container.parentNode.removeChild(container)
  }
}

// 标记解决状态，防止重复处理
function markResolved(resolved: { value: boolean }): boolean {
  if (resolved.value) return false
  resolved.value = true
  return true
}

/** 使用 Jessibuca 截图 */
function screenshotWithJessibuca(url: string): Promise<string | null> {
  if (!(window as any).Jessibuca) {
    return Promise.reject(new Error('没有找到 Jessibuca'))
  }

  return new Promise((resolve, reject) => {
    const container = createHiddenContainer()
    let jessibuca: any = null
    const resolved = { value: false }

    const timeoutId = setTimeout(() => {
      if (markResolved(resolved)) {
        cleanup()
        reject(new Error('Jessibuca 截图超时'))
      }
    }, SCREENSHOT_TIMEOUT)

    const cleanup = () => {
      clearTimeout(timeoutId)
      try {
        jessibuca?.destroy()
      } catch (e) {
        console.error('销毁 Jessibuca 实例失败:', e)
      }
      removeContainer(container)
    }

    try {
      jessibuca = new (window as any).Jessibuca({
        container: container,
        videoBuffer: 0.2,
        decoder: '/jessibuca/decoder.js',
        isResize: false,
        debug: false,
        showBandwidth: false,
        operateBtns: {
          fullscreen: false,
          screenshot: false,
          play: false,
          audio: false
        },
        forceNoOffscreen: true,
        isNotMute: false
      })

      jessibuca.on('play', () => {
        if (resolved.value) return
        console.log('Jessibuca 播放中，尝试截图')
        setTimeout(() => {
          if (resolved.value) return
          try {
            const imageData = jessibuca.screenshot(
              Date.now().toString(),
              'png',
              0.9,
              'base64'
            ) as string
            if (markResolved(resolved)) {
              cleanup()
              resolve(imageData)
            }
          } catch (e) {
            if (markResolved(resolved)) {
              console.error('Jessibuca 截图失败:', e)
              cleanup()
              reject(e)
            }
          }
        }, SCREENSHOT_DELAY)
      })

      jessibuca.on('error', (error: any) => {
        if (markResolved(resolved)) {
          console.error('Jessibuca 错误:', error)
          cleanup()
          reject(error)
        }
      })

      jessibuca.play(url)
    } catch (e) {
      if (markResolved(resolved)) {
        console.error('Jessibuca 初始化失败:', e)
        cleanup()
        reject(e)
      }
    }
  })
}

/** 使用 xgplayer 截图 */
function screenshotWithXgplayer(url: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const container = createHiddenContainer()
    let player: any = null
    const resolved = { value: false }

    const timeoutId = setTimeout(() => {
      if (markResolved(resolved)) {
        cleanup()
        reject(new Error('xgplayer 截图超时'))
      }
    }, SCREENSHOT_TIMEOUT)

    const cleanup = () => {
      clearTimeout(timeoutId)
      try {
        player?.destroy()
      } catch (e) {
        console.error('销毁 xgplayer 实例失败:', e)
      }
      removeContainer(container)
    }

    try {
      const playerId = 'xgplayer-screenshot-' + Date.now()
      container.id = playerId
      player = new Player({
        id: playerId,
        url: url,
        autoplay: true,
        controls: false,
        width: CONTAINER_SIZE.width,
        height: CONTAINER_SIZE.height,
        isLive: true,
        plugins: [FlvPlugin]
      })

      player.on('play', () => {
        if (resolved.value) return
        console.log('xgplayer 播放中，尝试截图')
        setTimeout(() => {
          if (resolved.value) return
          try {
            const video = player.video as HTMLVideoElement
            if (!video || video.readyState < 2) {
              throw new Error('视频未就绪或无法获取 video 元素')
            }
            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              throw new Error('无法获取 canvas 上下文')
            }
            ctx.drawImage(video, 0, 0)
            const imageData = canvas.toDataURL('image/png')
            if (markResolved(resolved)) {
              cleanup()
              resolve(imageData)
            }
          } catch (e) {
            if (markResolved(resolved)) {
              console.error('xgplayer 截图失败:', e)
              cleanup()
              reject(e)
            }
          }
        }, SCREENSHOT_DELAY)
      })

      player.on('error', (error: any) => {
        if (markResolved(resolved)) {
          console.error('xgplayer 错误:', error)
          cleanup()
          reject(error)
        }
      })
    } catch (e) {
      if (markResolved(resolved)) {
        console.error('xgplayer 初始化失败:', e)
        cleanup()
        reject(e)
      }
    }
  })
}

/** 传入直播流，截取关键帧
 * @param address 直播流地址
 * @param playerType 播放器类型，'jessibuca' 或 'xgplayer'，默认为 'jessibuca'
 * @param fallback 是否在主播放器失败时降级到备用播放器，默认为 true
 */
export function liveStreamScreenshot(
  address: string,
  playerType: 'jessibuca' | 'xgplayer' = 'jessibuca',
  fallback: boolean = true
): Promise<string | null> {
  const url = normalizeStreamUrl(address)
  const isPrimaryXgplayer = playerType === 'xgplayer'
  const primaryScreenshot = isPrimaryXgplayer
    ? screenshotWithXgplayer(url)
    : screenshotWithJessibuca(url)
  const fallbackScreenshot = isPrimaryXgplayer
    ? screenshotWithJessibuca(url)
    : screenshotWithXgplayer(url)

  if (!fallback) {
    return primaryScreenshot
  }

  return primaryScreenshot.catch((error) => {
    const fallbackName = isPrimaryXgplayer ? 'Jessibuca' : 'xgplayer'
    const primaryName = isPrimaryXgplayer ? 'xgplayer' : 'Jessibuca'
    console.warn(`${primaryName} 截图失败，尝试使用 ${fallbackName}:`, error)
    return fallbackScreenshot
  })
}
