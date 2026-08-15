import type { AlertItem } from '../types'

/**
 * 将后端返回的原始处置记录按告警（warningInformationId）去重，
 * 一条告警只保留一条。
 *
 * 背景：iot_dispose_info 里一条告警会插入多条记录（初次预警 disposeType=1 + 每次处置各一条），
 * 设备详情接口按 handler_time 倒序返回全部记录，直接渲染会导致同一条告警出现多次、
 * 且描述/状态各取各的记录，展示混乱。
 *
 * 聚合规则：
 * - status：取最新处置记录（倒序第一条）
 * - descrition：固定取初次预警(disposeType=1)记录的 remark（即初始预警描述）
 * - time：取初次预警记录的 handlerTime（告警发生时间）
 * - title：根据 levelType 生成（1=闪络告警，其余=超温告警）
 */
export function normalizeAlerts(records: any[] | null | undefined): AlertItem[] {
  if (!records || records.length === 0) return []

  const groups = new Map<string, any[]>()
  for (const item of records) {
    const key = String(item.warningInformationId ?? '')
    const arr = groups.get(key)
    if (arr) arr.push(item)
    else groups.set(key, [item])
  }

  return Array.from(groups.values()).map((group) => {
    const latest = group[0]
    const initial =
      group.find((item) => Number(item.disposeType) === 1) || group[group.length - 1] || latest

    return {
      ...latest,
      title: Number(latest.levelType) === 1 ? '闪络告警' : '超温告警',
      time: initial.handlerTime,
      descrition: initial.remark,
      status: latest.disposeType
    }
  })
}
