/**
 * 统一视频坐标换算工具。
 *
 * 坐标空间约定：
 * - 归一化坐标 N (0~1)：相对视频/传感器全画面，AI 盒子输入（detZones）与输出（maxX/maxY）均使用；
 * - 舞台坐标 S（像素）：AI布控设置 PicDrawer 舞台尺寸（stageSize，宽高比 = 视频宽高比）；
 * - 窗口坐标 W（像素）：热成像播放窗口内 overlay canvas，视频以 contain（等比 + 黑边）渲染。
 *
 * 一切以 N 为唯一中间基准：S ⇄ N ⇄ W，letterbox 只影响 N ⇄ W 这一段。
 */

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 计算视频在容器内 contain 布局后的有效区域（已扣除 letterbox 黑边）。
 * 若视频尺寸未知，返回整个容器（不做黑边修正）。
 */
export function getContainRect(
  containerWidth: number,
  containerHeight: number,
  videoWidth: number,
  videoHeight: number
): Rect {
  if (!containerWidth || !containerHeight || !videoWidth || !videoHeight) {
    return { x: 0, y: 0, width: containerWidth, height: containerHeight }
  }

  const containerRatio = containerWidth / containerHeight
  const videoRatio = videoWidth / videoHeight

  if (videoRatio > containerRatio) {
    // 视频更宽：宽度铺满，上下黑边
    const width = containerWidth
    const height = containerWidth / videoRatio
    return { x: 0, y: (containerHeight - height) / 2, width, height }
  }

  // 视频更高：高度铺满，左右黑边
  const height = containerHeight
  const width = containerHeight * videoRatio
  return { x: (containerWidth - width) / 2, y: 0, width, height }
}

/** 归一化坐标 → 窗口坐标（含 letterbox 偏移） */
export function normalizedToWindow(
  nx: number,
  ny: number,
  containerWidth: number,
  containerHeight: number,
  videoWidth: number,
  videoHeight: number
): { x: number; y: number } {
  const rect = getContainRect(containerWidth, containerHeight, videoWidth, videoHeight)
  return { x: rect.x + nx * rect.width, y: rect.y + ny * rect.height }
}

/**
 * 窗口坐标 → 归一化坐标（含 letterbox 偏移）。
 * 若点击落在有效区域外（黑边），返回 null，由调用方忽略。
 */
export function windowToNormalized(
  px: number,
  py: number,
  containerWidth: number,
  containerHeight: number,
  videoWidth: number,
  videoHeight: number
): { x: number; y: number } | null {
  const rect = getContainRect(containerWidth, containerHeight, videoWidth, videoHeight)
  if (!rect.width || !rect.height) return null

  const nx = (px - rect.x) / rect.width
  const ny = (py - rect.y) / rect.height

  if (nx < 0 || nx > 1 || ny < 0 || ny > 1) {
    return null
  }
  return { x: nx, y: ny }
}

/** 舞台坐标 → 归一化坐标 */
export function stageToNormalized(
  sx: number,
  sy: number,
  stageWidth: number,
  stageHeight: number
): { x: number; y: number } {
  return {
    x: stageWidth ? sx / stageWidth : 0,
    y: stageHeight ? sy / stageHeight : 0
  }
}
