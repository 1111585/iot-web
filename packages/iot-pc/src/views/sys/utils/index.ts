import { request } from '@/util/request'
import permApi from '@/apis/perm'
import empApi from '@/apis/emp'
import { usePermStore } from '@/store'
import useUserStore from '@/store/user'
import { ElMessageBox } from 'element-plus'
import { AesUtil } from '@infoview/util'
import { RetType } from '@/enums'

interface PermListParams {
  keyword?: string
  pageNum?: number
  pageSize?: number
}

/**
 * 获取权限列表，也是菜单
 */
export function fetchPermList(params?: PermListParams) {
  const payload = {
    keyword: '',
    pageNum: 1,
    pageSize: 1000,
    ...params
  }
  return request.get<PermListParams, ARC.ListRes<MenuType>>(permApi.permList, payload)
}

/**
 * 提取权限码，从而限制路由访问
 */
export function pickPerm(data: MenuType[], store = false) {
  const userStore = useUserStore()
  const roleType = userStore.userInfo?.roleType?.split(',') || []
  const urls = data.map((item) => item.code).filter(Boolean)

  if (store) {
    usePermStore().setPerm([...urls, ...roleType])
  }
  return urls
}

/**
 * 某个操作之前检查当前人是否有权限
 */
export async function checkMeHasPerm(params: ARC.AnyObj) {
  try {
    const res = await request.postJson(permApi.checkMeHasPerm, params)
    return res
  } catch (error) {
    throw error
  }
}

export async function checkPermPrompt() {
  try {
    const currentLoginUser = useUserStore().userInfo
    const { value } = await ElMessageBox.prompt('需要校验您的权限', '身份验证', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S/,
      inputErrorMessage: '请输入登录密码',
      inputType: 'password'
    })
    if (!value) return false
    const res = await checkMeHasPerm({
      pwd: AesUtil.aesEncrypt(value),
      empId: currentLoginUser?.empId
    })
    if (!res || res.code !== RetType.SUCCESS) {
      throw new Error('权限校验失败')
    }
    return true
  } catch (error) {
    throw error
  }
}

export async function fetchAccountDetail(accountId: string) {
  try {
    const res = await request.get(empApi.accountGetOne, { accountId })
    return res
  } catch (error) {
    throw error
  }
}

export async function fetchLockAccountList<T>(payload: ARC.ListQuery) {
  try {
    const res = await request.get<ARC.ListQuery, ARC.ListRes<T>>(empApi.accountLockList, payload)
    return res
  } catch (error) {
    throw error
  }
}
