import type { TempCurveDataRes } from '@/views/deviceManage/types'

export type TempDataPoint = {
  date: string
  type: string
  value: number
  deviceName?: string
}

export const calculateTempTimeRange = (intervalType: string, referenceDate = new Date()) => {
  const date = new Date(referenceDate)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  let startDate = ''
  let endDate = ''

  // 标准三档：5分钟 / 1小时 / 1天 —— 都表示"当天 00:00 ~ 23:59"
  if (['5min', '1h', '1d'].includes(intervalType)) {
    startDate = `${year}-${month}-${day} 00`
    endDate = `${year}-${month}-${day} 23`
  } else {
    const firstDay = new Date(year, date.getMonth(), 1)
    const lastDay = new Date(year, date.getMonth() + 1, 0)
    const firstMonth = String(firstDay.getMonth() + 1).padStart(2, '0')
    const firstDayStr = String(firstDay.getDate()).padStart(2, '0')
    const lastMonth = String(lastDay.getMonth() + 1).padStart(2, '0')
    const lastDayStr = String(lastDay.getDate()).padStart(2, '0')
    startDate = `${year}-${firstMonth}-${firstDayStr} 00`
    endDate = `${year}-${lastMonth}-${lastDayStr} 23`
  }

  const trimToDate = (value: string) => value.split(' ')[0]
  return { startDate: trimToDate(startDate), endDate: trimToDate(endDate) }
}

const formatRecordLabel = (recordTime: string, intervalType?: string) => {
  const trimmed = recordTime.trim()
  if (!trimmed) {
    return ''
  }

  const [datePart, timePart] = trimmed.split(' ')

  if (intervalType === '1w') {
    return datePart
  }

  return timePart ? `${datePart} ${timePart}` : datePart
}

const parseRecordTime = (recordTime: string) => {
  const trimmed = recordTime.trim()
  if (!trimmed) {
    return new Date(0)
  }
  const normalized = trimmed.includes(' ') ? trimmed.replace(' ', 'T') : `${trimmed}T00:00:00`
  return new Date(normalized)
}

const downsampleForWeek = (data: TempCurveDataRes[], maxPointsPerSeries = 56) => {
  if (!maxPointsPerSeries || data.length === 0) {
    return data
  }

  const grouped = new Map<string, TempCurveDataRes[]>()
  data.forEach((item) => {
    const areaKey = `${item.zonesId}-${item.zonesName}`
    const list = grouped.get(areaKey) || []
    list.push(item)
    grouped.set(areaKey, list)
  })

  const result: TempCurveDataRes[] = []

  grouped.forEach((records) => {
    const sorted = [...records].sort(
      (a, b) => parseRecordTime(a.recordTime).getTime() - parseRecordTime(b.recordTime).getTime()
    )
    if (sorted.length <= maxPointsPerSeries) {
      result.push(...sorted)
      return
    }

    const step = Math.max(1, Math.floor(sorted.length / maxPointsPerSeries))
    for (let i = 0; i < sorted.length; i += step) {
      result.push(sorted[i])
    }

    const last = sorted[sorted.length - 1]
    if (result[result.length - 1] !== last) {
      result.push(last)
    }
  })

  return result
}

export interface MapTempCurveOptions {
  /** 图例标签：full=「设备名-区域-最小/最大温度」（默认）；zone=仅「区域-平均值/最大值」 */
  labelMode?: 'full' | 'zone'
  /** 低值线口径：min=最小温度（默认）；avg=平均温度 */
  lowValueMode?: 'min' | 'avg'
}

export const mapTempCurveData = (
  data: TempCurveDataRes[],
  intervalType?: string,
  options: MapTempCurveOptions = {}
): TempDataPoint[] => {
  const { labelMode = 'full', lowValueMode = 'min' } = options
  const processed = intervalType === '1w' ? downsampleForWeek(data) : data
  return processed
    .map((item) => {
      const formattedDate = formatRecordLabel(item.recordTime, intervalType)
      const deviceName = item.deviceName || ''
      const zoneName = item.zonesName || '区域' + item.zonesId

      // 设备卡片场景：图例只要「区域-平均值 / 区域-最大值」，且低值线用平均温度
      if (labelMode === 'zone') {
        const lowLabel = lowValueMode === 'avg' ? '平均值' : '最小值'
        const lowValue = lowValueMode === 'avg' ? item.avgTemp : item.minTemp
        return [
          { date: formattedDate, type: `${zoneName}-${lowLabel}`, value: lowValue, deviceName },
          { date: formattedDate, type: `${zoneName}-最大值`, value: item.maxTemp, deviceName }
        ]
      }

      const zoneLabel = deviceName ? `${deviceName}-${zoneName}` : zoneName
      return [
        { date: formattedDate, type: `${zoneLabel}-最小温度`, value: item.minTemp, deviceName },
        { date: formattedDate, type: `${zoneLabel}-最大温度`, value: item.maxTemp, deviceName }
      ]
    })
    .flat()
}

export const getAxisRange = <T extends { value: number }>(data: T[]) => {
  if (!data.length) {
    return { min: 0, max: 50 }
  }

  const values = data.map((item) => item.value)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const range = maxValue - minValue

  let paddingRatio = 0.1

  if (range < 0.5) {
    paddingRatio = 0.8
  } else if (range < 1) {
    paddingRatio = 0.6
  } else if (range < 2) {
    paddingRatio = 0.5
  } else if (range < 5) {
    paddingRatio = 0.3
  } else if (range < 10) {
    paddingRatio = 0.2
  }

  const padding = range * paddingRatio
  return {
    min: Math.max(0, minValue - padding),
    max: maxValue + padding
  }
}
