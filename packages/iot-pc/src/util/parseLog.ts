import { request } from './request'
import { sysApi } from '@/apis/sys'

/**
 * 发送打点日志
 */

interface Action<T = any> {
  type: 'log' | 'error'
  payload: T
}

export async function parseLog<T = any>(action: Action<T>, url = sysApi.sendLogs) {
  try {
    const { data } = await request.postJson(url, action.payload)

    return { raw: data }
  } catch (error) {
    console.error('[打点]', error)
  }
}
