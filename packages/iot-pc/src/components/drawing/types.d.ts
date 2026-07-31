import Konva from 'konva'

/**
 * 对应的后端字段 drawCfg，里面内容与接口无关，前端想配置内容可直接往当前对象添加属性
 */
export type DrawShape = {
  id: number
  points: { x: number; y: number }[]
  offset: { x: number; y: number }
  config: Konva.LineConfig
}