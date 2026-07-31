import { getCurrentInstance, type ComponentInternalInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RetType } from '@/enums'
import { request } from '@/util/request'
const reqLoading = ref(false)
const useCurrentInstance = () => {
  const instance = getCurrentInstance() as ComponentInternalInstance
  return instance.appContext.config.globalProperties
}

const requestWrapper = <T = any, U = any>(
  method: string,
  apiUrl: string,
  data?: T,
  opsTip?: string
): Promise<RepDataType<U>> => {
  reqLoading.value = true
  return request[method](apiUrl, data)
    .then((rep) => {
      opsTip &&
        ElMessage({
          message: `${opsTip}${rep.code === RetType.SUCCESS ? '成功' : '失败'}`,
          type: rep.code === RetType.SUCCESS ? 'success' : 'error',
          duration: 1000
        })

      return rep as RepDataType<U>
    })
    .catch(() => (reqLoading.value = false))
}

const handleWarn = <T = any, U = any>(
  method: string,
  apiUrl: string,
  data?: T,
  opsTip?: string,
  warnTip?: string
) =>
  warnTip && warnTip.length > 0
    ? ElMessageBox.confirm(warnTip, '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => requestWrapper<T, U>(method, apiUrl, data, opsTip))
    : requestWrapper<T, U>(method, apiUrl, data, opsTip)

/**
 * GET请求
 * @param apiUrl 请求路径
 * @param data  请求参数
 * @param opsTip  操作成功或失败提示拼接，${opsTip}成功，${opsTip}失败
 * @param warnTip 警告信息，一些危险操作，操作前警告弹窗
 * @returns
 */
const useGet = <T = any, U = any>(apiUrl: string, data?: T, opsTip?: string, warnTip?: string) =>
  handleWarn<T, U>('get', apiUrl, data, opsTip, warnTip)
/**
 * POST请求
 * @param apiUrl 请求路径
 * @param data  请求参数
 * @param opsTip  操作成功或失败提示拼接，${opsTip}成功，${opsTip}失败
 * @param warnTip 警告信息，一些危险操作，操作前警告弹窗
 * @returns
 */
const usePost = <T = any, U = any>(apiUrl: string, data?: T, opsTip?: string, warnTip?: string) =>
  handleWarn<T, U>('post', apiUrl, data, opsTip, warnTip)
/**
 * POST_JSON请求
 * @param apiUrl 请求路径
 * @param data  请求参数
 * @param opsTip  操作成功或失败提示拼接，${opsTip}成功，${opsTip}失败
 * @param warnTip 警告信息，一些危险操作，操作前警告弹窗
 * @returns
 */
const usePostJson = <T = any, U = any>(
  apiUrl: string,
  data?: T,
  opsTip?: string,
  warnTip?: string
) => handleWarn<T, U>('postJson', apiUrl, data, opsTip, warnTip)

export { useCurrentInstance, useGet, usePost, usePostJson }
