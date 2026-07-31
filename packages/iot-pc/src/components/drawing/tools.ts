import type { DrawShape } from './types'

// 将绝对坐标转换为相对坐标（百分比）
export const toRelativeCoordinates = (
  x: number,
  y: number,
  imageWidth: number,
  imageHeight: number
) => {
  return {
    relativeX: x / imageWidth,
    relativeY: y / imageHeight
  }
}

// 将相对坐标转换为绝对坐标
export const toAbsoluteCoordinates = (
  relativeX: number,
  relativeY: number,
  imageWidth: number,
  imageHeight: number
) => {
  return {
    x: Math.round(relativeX * imageWidth),
    y: Math.round(relativeY * imageHeight)
  }
}

// 转换整个形状的坐标
export const convertShapeCoordinates = (
  shape: DrawShape,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
) => {
  // 深拷贝形状对象，避免修改原对象
  const newShape = JSON.parse(JSON.stringify(shape))

  // 根据形状类型处理不同的坐标属性
  if (newShape.points && Array.isArray(newShape.points)) {
    // 处理多点形状，如多边形
    newShape.points = newShape.points.map((point: { x: number; y: number }) => {
      const relative = toRelativeCoordinates(point.x, point.y, sourceWidth, sourceHeight)
      return toAbsoluteCoordinates(
        relative.relativeX,
        relative.relativeY,
        targetWidth,
        targetHeight
      )
    })
  } else if (newShape.x !== undefined && newShape.y !== undefined) {
    // 处理单点形状，如圆形或矩形
    const relative = toRelativeCoordinates(newShape.x, newShape.y, sourceWidth, sourceHeight)
    const absolute = toAbsoluteCoordinates(
      relative.relativeX,
      relative.relativeY,
      targetWidth,
      targetHeight
    )
    newShape.x = absolute.x
    newShape.y = absolute.y

    // 如果有宽度和高度，也需要按比例调整
    if (newShape.width !== undefined && newShape.height !== undefined) {
      const widthRatio = targetWidth / sourceWidth
      const heightRatio = targetHeight / sourceHeight
      newShape.width = Math.round(newShape.width * widthRatio)
      newShape.height = Math.round(newShape.height * heightRatio)
    }

    // 如果有半径，也需要按比例调整
    if (newShape.radius !== undefined) {
      const ratio = targetWidth / sourceWidth
      newShape.radius = Math.round(newShape.radius * ratio)
    }
  }

  return newShape
}

// 计算多边形面积（鞋带公式），返回绝对值
export const polygonArea = (points: Array<{ x: number; y: number }>) => {
  if (!points || points.length < 3) return 0
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const { x: x1, y: y1 } = points[i]
    const { x: x2, y: y2 } = points[(i + 1) % points.length]
    sum += x1 * y2 - x2 * y1
  }
  return Math.abs(sum / 2)
}

// 找出面积最大的 shape，返回 shape 与面积
export const findMaxAreaShape = <T extends { points?: Array<{ x: number; y: number }> }>(
  shapes: T[]
): { shape: T | null; area: number } => {
  let maxShape: T | null = null
  let maxArea = 0
  for (const shape of shapes) {
    const pts = shape.points
    if (!pts || pts.length < 3) continue
    const area = polygonArea(pts)
    if (area > maxArea) {
      maxArea = area
      maxShape = shape
    }
  }
  return { shape: maxShape, area: maxArea }
}
