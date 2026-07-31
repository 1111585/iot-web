import { request } from '@/util/request'
import { chartApi } from '@/apis/chart'
import type { IotCollRes, IotSevenDaysRes, IotOneDayRes } from '../types'

const onError = (error: any) => console.log('[获取采集数据]', error?.message)

interface ResList<T> {
  records: T[]
  total: number
  pages: number
}

export const iotCollQuery = reactive({
  pageSize: 10,
  pageNum: 1,
  keyword: ''
})

export const iotCollList = ref<IotCollRes[]>([])
export const iotCollTotal = ref(0)

export async function fetchIotCollection() {
  try {
    const { data } = await request.get<any, ResList<IotCollRes>>(
      chartApi.getIotDeviceCollectionInfo,
      iotCollQuery
    )
    if (data?.records) {
      iotCollList.value = data.records
      iotCollTotal.value = data.total
    }
    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function fetchIotSevenDays(deviceId: string) {
  try {
    const { data } = await request.get<any, IotOneDayRes[]>(chartApi.getIotSevenDays, {
      deviceId
    })

    return { raw: data }
  } catch (error) {
    onError(error)
  }
}

export async function fetchIotOneDay(deviceId: string) {
  try {
    const { data } = await request.get<any, IotOneDayRes[]>(chartApi.getIotOneDay, { deviceId })
    return { raw: data }
  } catch (error) {
    onError(error)
  }
}
